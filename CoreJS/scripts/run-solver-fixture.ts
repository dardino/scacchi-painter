#!/usr/bin/env -S tsx
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { solve } from '../src/solver';
import { ProblemInput } from '../src/solver/types';

const argv = Object.fromEntries(process.argv.slice(2).map(a => {
  if (!a.startsWith('--')) return [a, true];
  const [k,v] = a.slice(2).split('=');
  return [k, v ?? true];
}));

const inPath = (argv.in as string) || './test/fixtures/yacpdb-sample.json';
const outPath = (argv.out as string) || './test/fixtures/yacpdb-sample-results.json';
const maxDepthArg = argv.maxDepth ? Number(argv.maxDepth) : undefined;
const timeLimitMs = argv.timeLimitMs ? Number(argv.timeLimitMs) : 30_000;

async function main() {
  const inFull = path.resolve(process.cwd(), inPath);
  const raw = JSON.parse(await readFile(inFull, 'utf8'));
  const problems: ProblemInput[] = raw.problems || raw;
  if (!Array.isArray(problems)) throw new Error('fixture does not contain problems array');

  const results: any[] = [];
  for (const p of problems) {
    try {
      const res = await solve(p, { maxDepth: maxDepthArg, timeLimitMs });
      results.push(res);
      console.log(`id=${p.id} nodes=${res.nodes} time=${res.timeMs}ms best=${res.bestLine?.[0] ?? '-'} `);
    } catch (err) {
      results.push({ id: p.id, error: (err as any)?.message });
    }
  }

  const outFull = path.resolve(process.cwd(), outPath);
  await mkdir(path.dirname(outFull), { recursive: true });
  await writeFile(outFull, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf8');
  console.log(`Wrote results to ${outFull}`);
}

main().catch(err => { console.error(err); process.exit(1); });
