import esbuild from 'esbuild';
import fs from 'fs/promises';
import http from 'http';
import path from 'path';
import puppeteer from 'puppeteer';

const BUNDLE_DIR = path.resolve(process.cwd(), 'dist-test-browser');

describe('browser integration (puppeteer)', () => {
  it('bundles solver for browser and runs search in headless Chromium', async () => {
    // bundle a tiny browser entry that exposes `window.runSearch(fen)`
    const entryCode = `import { parseFEN } from './solver/parse';\nimport { search } from './solver/search';\nwindow['runSearch'] = async (fen, maxDepth=4, timeLimitMs=5000) => { const parsed = parseFEN(fen); return await search(parsed.bitboards, parsed.sideToMove, maxDepth, timeLimitMs); };`;

    await fs.rm(BUNDLE_DIR, { recursive: true, force: true });
    await fs.mkdir(BUNDLE_DIR, { recursive: true });

    await esbuild.build({
      stdin: { contents: entryCode, resolveDir: path.resolve(process.cwd(), 'src'), sourcefile: 'browser-entry.ts' },
      bundle: true,
      platform: 'browser',
      format: 'iife',
      outfile: path.join(BUNDLE_DIR, 'bundle.js'),
      minify: true,
    });

    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script src="/bundle.js"></script></body></html>`;
    await fs.writeFile(path.join(BUNDLE_DIR, 'index.html'), html, 'utf8');

    const server = http.createServer(async (req, res) => {
      try {
        const url = req.url || '/';
        if (url === '/' || url === '/index.html') {
          const h = await fs.readFile(path.join(BUNDLE_DIR, 'index.html'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(h);
          return;
        }
        if (url === '/bundle.js') {
          const b = await fs.readFile(path.join(BUNDLE_DIR, 'bundle.js'));
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(b);
          return;
        }
        res.writeHead(404); res.end('not found');
      } catch (e) {
        res.writeHead(500); res.end(String(e));
      }
    });

    await new Promise<void>((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => resolve());
      server.on('error', (err) => reject(err));
    });
    // @ts-ignore
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    try {
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
      // wait until our runSearch is defined
      await page.waitForFunction(() => (window as any).runSearch !== undefined, { timeout: 5000 });

      const fen = '8/8/8/8/8/8/8/K6k w - - 0 1';
      const result = await page.evaluate(async (f: string) => {
        // @ts-ignore
        const r = await (window as any).runSearch(f, 2, 2000);
        return r;
      }, fen);

      expect(result).toBeDefined();
      expect(typeof result.timeMs).toBe('number');
      expect(typeof result.nodes).toBe('number');
      expect(Array.isArray(result.bestLine)).toBe(true);
    } finally {
      await browser.close();
      server.close();
    }
  }, 60000);
});
