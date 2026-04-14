import esbuild from 'esbuild';
import fs from 'fs/promises';
import http from 'http';
import path from 'path';
import puppeteer from 'puppeteer';

const BUNDLE_DIR = path.resolve(process.cwd(), 'dist-test-browser-parallel');

describe('browser parallel integration (puppeteer)', () => {
  it('bundles worker+main and runs multiple problems concurrently via WebWorkers', async () => {
    // prepare bundle dir
    await fs.rm(BUNDLE_DIR, { recursive: true, force: true });
    await fs.mkdir(BUNDLE_DIR, { recursive: true });

    // worker code: receives {cmd:'solve', id, problem, maxDepth, timeLimitMs}
    const workerCode = `import { parseFEN } from './solver/parse';\nimport { search } from './solver/search';\nself.onmessage = async (ev) => { const m = ev.data; if (m && m.cmd === 'solve') { try { const parsed = parseFEN(m.problem.fen); const res = await search(parsed.bitboards, parsed.sideToMove, m.maxDepth || 4, m.timeLimitMs || 30000); self.postMessage({ id: m.id, result: res }); } catch (e) { self.postMessage({ id: m.id, error: String(e) }); } } };`;

    await esbuild.build({
      stdin: { contents: workerCode, resolveDir: path.resolve(process.cwd(), 'src'), sourcefile: 'browser-worker.ts' },
      bundle: true,
      platform: 'browser',
      format: 'iife',
      outfile: path.join(BUNDLE_DIR, 'worker-parallel.js'),
      minify: true,
    });

    // main page code: exposes window.runParallel(problems, threads)
    const mainCode = `window['runParallel'] = async (problems, threads=4, maxDepth=4, timeLimitMs=10000) => { const n = Math.min(threads, problems.length); const workers = new Array(n).fill(null).map(() => new Worker('/worker-parallel.js')); const results = new Array(problems.length); let next = 0; const active = new Set(); workers.forEach((w, wi) => { w.onmessage = (ev) => { const { id, result, error } = ev.data; const idx = Number(id); results[idx] = result || { error }; active.delete(wi); if (next < problems.length) { const job = next++; active.add(wi); w.postMessage({ cmd: 'solve', id: String(job), problem: problems[job], maxDepth, timeLimitMs }); } }; }); // seed
    for (let i=0;i<workers.length;i++) { if (next >= problems.length) break; const job = next++; active.add(i); workers[i].postMessage({ cmd: 'solve', id: String(job), problem: problems[job], maxDepth, timeLimitMs }); }
    await new Promise(resolve => { const iv = setInterval(() => { const done = results.filter(r => r !== undefined).length; if (done === problems.length) { clearInterval(iv); resolve(); } }, 50); }); workers.forEach(w => w.terminate()); return results; };`;

    await esbuild.build({
      stdin: { contents: mainCode, resolveDir: path.resolve(process.cwd(), 'src'), sourcefile: 'browser-main-parallel.ts' },
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
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(h);
          return;
        }
        if (url === '/bundle-parallel.js') {
          const b = await fs.readFile(path.join(BUNDLE_DIR, 'bundle-parallel.js'));
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(b);
          return;
        }
        if (url === '/worker-parallel.js') {
          const b = await fs.readFile(path.join(BUNDLE_DIR, 'worker-parallel.js'));
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
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
      await page.waitForFunction(() => (window as any).runParallel !== undefined, { timeout: 5000 });

      const results = await page.evaluate(async (probs) => {
        // @ts-ignore
        return await (window as any).runParallel(probs, 4, 4, 5000);
      }, problems);

      // basic assertions
      if (!Array.isArray(results) || results.length !== problems.length) throw new Error('unexpected results');
      for (const r of results) {
        if (r && !r.error) {
          if (typeof r.timeMs !== 'number') throw new Error('missing timeMs');
          if (typeof r.nodes !== 'number') throw new Error('missing nodes');
        }
      }
    } finally {
      await browser.close();
      server.close();
    }
  }, 120000);
});
