import esbuild from 'esbuild';
import fs from 'fs/promises';
import http from 'http';
import path from 'path';
import puppeteer from 'puppeteer';
import { describe, it } from 'vitest';

const BUNDLE_DIR = path.resolve(process.cwd(), 'dist-test-browser-parallel');

describe('browser parallel integration (puppeteer)', () => {
  it('bundles worker+main and runs multiple problems concurrently via WebWorkers', async () => {
    // prepare bundle dir
    await fs.rm(BUNDLE_DIR, { recursive: true, force: true });
    await fs.mkdir(BUNDLE_DIR, { recursive: true });

    // worker code: supports an init handshake to receive SharedArrayBuffer for a prototype shared TT
    const workerCode = `import { parseFEN } from './solver/parse';\nimport { search } from './solver/search';\nimport { TT } from './solver/tt';\nlet sharedView = null; let slots = 0;\nfunction key32FromBig(key) { return Number(key & 0xffffffffn) | 0; }\nfunction initSharedTT(sab, slotCount) { try { sharedView = new Int32Array(sab); slots = slotCount || 16384; // slot layout: [key32, depth, score] per slot\n  TT.probe = (keyBig) => { if (!sharedView) return undefined; const k32 = key32FromBig(keyBig); const idx = (k32 >>> 0) % slots; const off = idx * 3; const stored = Atomics.load(sharedView, off); if (stored === (k32 | 0)) { const depth = Atomics.load(sharedView, off + 1); const score = Atomics.load(sharedView, off + 2); return { key: BigInt(stored >>> 0), depth, score, flag: 'EXACT' }; } return undefined; };\n  TT.store = (keyBig, entry) => { if (!sharedView) return; const k32 = key32FromBig(keyBig); const idx = (k32 >>> 0) % slots; const off = idx * 3; // write depth and score first, then key as a commit marker\n  Atomics.store(sharedView, off + 1, entry.depth || 0);\n  Atomics.store(sharedView, off + 2, entry.score || 0);\n  Atomics.store(sharedView, off, (k32 | 0)); };\n  return true; } catch (e) { return false; } }\n\nself.onmessage = async (ev) => { const m = ev.data; if (!m) return; if (m.cmd === 'init') { const ok = initSharedTT(m.sab, m.slots); self.postMessage({ cmd: 'ready', ok: !!ok }); return; } if (m.cmd === 'solve') { try { const parsed = parseFEN(m.problem.fen); const res = await search(parsed.bitboards, parsed.sideToMove, m.maxDepth || 4, m.timeLimitMs || 30000); self.postMessage({ id: m.id, result: res }); } catch (e) { self.postMessage({ id: m.id, error: String(e) }); } } };`;

    await esbuild.build({
      stdin: { contents: workerCode, resolveDir: path.resolve(process.cwd(), 'src'), sourcefile: 'browser-worker.ts' },
      bundle: true,
      platform: 'browser',
      format: 'iife',
      outfile: path.join(BUNDLE_DIR, 'worker-parallel.js'),
      minify: true,
    });

    // main page code: creates SharedArrayBuffer, initializes workers, and exposes window.runParallel(problems, threads)
    const mainCode = `window['runParallel'] = async (problems, threads=4, maxDepth=4, timeLimitMs=10000) => { const slotCount = 1<<14; const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * slotCount * 3); const n = Math.min(threads, problems.length); const workers = []; // create and init workers\n    for (let i = 0; i < n; i++) { const w = new Worker('/worker-parallel.js'); workers.push(w); }\n    // wait for ready handshake\n    await Promise.all(workers.map((w) => new Promise((resolve) => { const onmsg = (ev) => { if (ev.data && ev.data.cmd === 'ready') { w.onmessage = null; resolve(); } }; w.onmessage = onmsg; w.postMessage({ cmd: 'init', sab, slots: slotCount }); })));\n    const results = new Array(problems.length); let next = 0; const active = new Set(); // set result handlers\n    workers.forEach((w, wi) => { w.onmessage = (ev) => { const data = ev.data; if (!data) return; const idx = Number(data.id); results[idx] = data.result || { error: data.error }; active.delete(wi); if (next < problems.length) { const job = next++; active.add(wi); w.postMessage({ cmd: 'solve', id: String(job), problem: problems[job], maxDepth, timeLimitMs }); } }; }); // seed initial jobs\n    for (let i = 0; i < workers.length; i++) { if (next >= problems.length) break; const job = next++; active.add(i); workers[i].postMessage({ cmd: 'solve', id: String(job), problem: problems[job], maxDepth, timeLimitMs }); }\n    await new Promise(resolve => { const iv = setInterval(() => { const done = results.filter(r => r !== undefined).length; if (done === problems.length) { clearInterval(iv); resolve(); } }, 50); }); workers.forEach(w => w.terminate()); return results; };`;

    const mainCode2 = `
    function runParallelWithWorkers(problems, workers, maxDepth, timeLimitMs) {
      const results = new Array(problems.length);
      let next = 0;
      const active = new Set();
      workers.forEach((w, wi) => {
        w.onmessage = (ev) => {
          const data = ev.data;
          if (!data) return;
          const idx = Number(data.id);
          results[idx] = data.result || { error: data.error };
          active.delete(wi);
          if (next < problems.length) {
            const job = next++;
            active.add(wi);
            w.postMessage({ cmd: 'solve', id: String(job), problem: problems[job], maxDepth, timeLimitMs });
          }
        };
      });

      // seed initial jobs
      for (let i = 0; i < workers.length; i++) {
        if (next >= problems.length) break;
        const job = next++;
        active.add(i);
        workers[i].postMessage({ cmd: 'solve', id: String(job), problem: problems[job], maxDepth, timeLimitMs });
      }

      return new Promise(resolve => {
        const iv = setInterval(() => {
          const done = results.filter(r => r !== undefined).length;
          if (done === problems.length) { clearInterval(iv); workers.forEach(w => w.terminate()); resolve(results); }
        }, 50);
      });
    }

    window['runParallelShared'] = async (problems, threads=4, maxDepth=4, timeLimitMs=10000) => {
      const slotCount = 1<<14;
      const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * slotCount * 3);
      const n = Math.min(threads, problems.length);
      const workers = [];
      for (let i = 0; i < n; i++) workers.push(new Worker('/worker-parallel.js'));

      // init handshake
      await Promise.all(workers.map((w) => new Promise((resolve) => {
        const onmsg = (ev) => { if (ev.data && ev.data.cmd === 'ready') { w.onmessage = null; resolve(); } };
        w.onmessage = onmsg;
        w.postMessage({ cmd: 'init', sab, slots: slotCount });
      })));

      return await runParallelWithWorkers(problems, workers, maxDepth, timeLimitMs);
    };

    window['runParallelIndependent'] = async (problems, threads=4, maxDepth=4, timeLimitMs=10000) => {
      const n = Math.min(threads, problems.length);
      const workers = [];
      for (let i = 0; i < n; i++) workers.push(new Worker('/worker-parallel.js'));
      return await runParallelWithWorkers(problems, workers, maxDepth, timeLimitMs);
    };

    window['runParallel'] = window['runParallelShared'];
    `;

    await esbuild.build({
      stdin: { contents: mainCode2, resolveDir: path.resolve(process.cwd(), 'src'), sourcefile: 'browser-main-parallel.ts' },
      bundle: true,
      platform: 'browser',
      format: 'iife',
      outfile: path.join(BUNDLE_DIR, 'bundle-parallel.js'),
      minify: true,
    });

    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script src="/bundle-parallel.js"></script></body></html>`;
    await fs.writeFile(path.join(BUNDLE_DIR, 'index.html'), html, 'utf8');

    // read fixture problems
    const fixturePath = path.resolve(process.cwd(), 'test/fixtures/yacpdb-sample.json');
    const raw = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
    const problems = (raw.problems || raw).slice(0, 8).map((p: any) => ({ id: p.id, fen: p.fen }));

    const server = http.createServer(async (req, res) => {
      try {
        const url = req.url || '/';
        if (url === '/' || url === '/index.html') {
          const h = await fs.readFile(path.join(BUNDLE_DIR, 'index.html'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html', 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' });
          res.end(h);
          return;
        }
        if (url === '/bundle-parallel.js') {
          const b = await fs.readFile(path.join(BUNDLE_DIR, 'bundle-parallel.js'));
          res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' });
          res.end(b);
          return;
        }
        if (url === '/worker-parallel.js') {
          const b = await fs.readFile(path.join(BUNDLE_DIR, 'worker-parallel.js'));
          res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' });
          res.end(b);
          return;
        }
        res.writeHead(404); res.end('not found');
      } catch (e) { res.writeHead(500); res.end(String(e)); }
    });

    await new Promise<void>((resolve, reject) => { server.listen(0, '127.0.0.1', () => resolve()); server.on('error', (err) => reject(err)); });
    // @ts-ignore
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    try {
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
      await page.waitForFunction(() => (window as any).runParallelShared !== undefined && (window as any).runParallelIndependent !== undefined, { timeout: 5000 });

      // run independent workers first, then shared TT workers
      const indepObj = await page.evaluate(async (probs) => {
        // @ts-ignore
        const t0 = performance.now();
        // @ts-ignore
        const res = await (window as any).runParallelIndependent(probs, 4, 4, 5000);
        return { res, t: performance.now() - t0 };
      }, problems);

      const sharedObj = await page.evaluate(async (probs) => {
        // @ts-ignore
        const t0 = performance.now();
        // @ts-ignore
        const res = await (window as any).runParallelShared(probs, 4, 4, 5000);
        return { res, t: performance.now() - t0 };
      }, problems);

      const indepResults = indepObj.res;
      const sharedResults = sharedObj.res;

      if (!Array.isArray(indepResults) || indepResults.length !== problems.length) throw new Error('independent unexpected results');
      if (!Array.isArray(sharedResults) || sharedResults.length !== problems.length) throw new Error('shared unexpected results');

      for (const r of indepResults.concat(sharedResults)) {
        if (r && !r.error) {
          if (typeof r.timeMs !== 'number') throw new Error('missing timeMs');
          if (typeof r.nodes !== 'number') throw new Error('missing nodes');
        }
      }

      // log simple benchmark summary
      // @ts-ignore
      console.info('benchmark', { independentMs: indepObj.t, sharedMs: sharedObj.t });
    } finally {
      await browser.close();
      server.close();
    }
  }, 120000);
});
