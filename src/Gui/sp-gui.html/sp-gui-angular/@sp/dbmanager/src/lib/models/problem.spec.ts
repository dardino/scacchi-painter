import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Problem } from "./problem";

describe("Snapshots", () => {
  const problem = Problem.fromFen("8/Rr6/8/4k3/5K2/8/2Q5/8");

  beforeEach(() => {
    const fen = problem.getCurrentFen();
    expect(fen).toBe("8/Rr6/8/4k3/5K2/8/2Q5/8");
  });

  afterEach(() => {
    problem.loadMainSnapshot(true);
    problem.snapshots = {};
    problem.saveAsMainSnapshot();
  });

  it("Save Snapshot", () => {
    problem.saveSnapshot();
    expect(Object.keys(problem.snapshots).length).toBe(2);
    problem.saveSnapshot();
    expect(Object.keys(problem.snapshots).length).toBe(3);
    problem.saveSnapshot();
    expect(Object.keys(problem.snapshots).length).toBe(4);

    expect(Object.keys(problem.snapshots).join(",")).toBe(
      "1,2,3,$_MAIN_$"
    );
  });

  it("Reload from main snapshot", () => {
    problem.GetPieceAt("ColA", "Row7")?.SetLocation("ColA", "Row8");
    let fen = problem.getCurrentFen();
    expect(fen).toBe("R7/1r6/8/4k3/5K2/8/2Q5/8");
    problem.loadSnapshot(undefined, true);
    fen = problem.getCurrentFen();
    expect(fen).toBe("8/Rr6/8/4k3/5K2/8/2Q5/8");
  });

  it("Reload from current snapshot", () => {
    problem.GetPieceAt("ColA", "Row7")?.SetLocation("ColA", "Row8");
    let fen = problem.getCurrentFen();
    expect(fen).toBe("R7/1r6/8/4k3/5K2/8/2Q5/8");
    problem.saveSnapshot(); // save the move

    problem.GetPieceAt("ColA", "Row8")?.SetLocation("ColB", "Row8");
    fen = problem.getCurrentFen();
    expect(fen).toBe("1R6/1r6/8/4k3/5K2/8/2Q5/8");

    problem.loadSnapshot(undefined, true);
    fen = problem.getCurrentFen();
    expect(fen).toBe("R7/1r6/8/4k3/5K2/8/2Q5/8");
  });
});
