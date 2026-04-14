import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { solve } from './index';
import { ProblemInput } from './types';

describe('fixture-driven solver (YACPDB)', () => {
  it('runs solver on all fixture problems (fast mode)', async () => {
    const fixturePath = path.resolve(process.cwd(), 'test/fixtures/yacpdb-sample.json');
    const raw = JSON.parse(readFileSync(fixturePath, 'utf8'));
    const problems: ProblemInput[] = raw.problems || raw;
    expect(Array.isArray(problems)).toBe(true);
    if (!Array.isArray(problems) || problems.length === 0) return;

    for (const p of problems) {
      // keep this test reasonably fast: shallow search + short time limit
      const res = await solve(p as ProblemInput, { maxDepth: 6, timeLimitMs: 1000, threads: 1 });
      expect(res.id).toBe(String(p.id));
      expect(typeof res.timeMs).toBe('number');
      expect(typeof res.nodes).toBe('number');
    }
  }, 60000);
});
