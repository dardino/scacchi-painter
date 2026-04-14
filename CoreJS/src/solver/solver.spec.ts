import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { solve } from "./index";

describe("solver integration (fixture)", () => {
  it("runs solver on first YACPDB fixture problem", async () => {
    const fixturePath = path.resolve(process.cwd(), "test/fixtures/yacpdb-sample.json");
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
    const problems = raw.problems || raw.problems || raw;
    expect(Array.isArray(problems)).toBe(true);
    if (!Array.isArray(problems) || problems.length === 0) return;
    const p = problems[0];
    const res = await solve(p as any, { maxDepth: undefined, timeLimitMs: 2000 });
    expect(res.id).toBe(String(p.id));
    expect(typeof res.timeMs).toBe("number");
    expect(typeof res.nodes).toBe("number");
  });
});
