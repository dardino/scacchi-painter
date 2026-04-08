import { Problem } from "@sp/dbmanager/src/lib/models";
import { describe, expect, it } from "vitest";
import { problemToSpCore } from "./problemToPopeye";

describe("problemToSpCore", () => {
  it("emits stipulation and a complete white-to-move FEN", () => {
    const problem = Problem.fromFen("8/8/8/8/8/8/8/4K3");

    const rows = problemToSpCore(problem);

    expect(rows).toEqual([
      "Stipulation #2",
      "FEN 8/8/8/8/8/8/8/4K3 w - - 0 1",
    ]);
  });

  it("uses black to move when the problem starts at move 1.5", () => {
    const problem = Problem.fromFen("8/8/8/8/8/8/8/4K3");
    problem.stipulation.moves = 2.5;
    problem.stipulation.completeStipulationDesc = "h#2.5";

    const rows = problemToSpCore(problem);

    expect(rows).toEqual([
      "Stipulation h#2.5",
      "FEN 8/8/8/8/8/8/8/4K3 b - - 0 1",
    ]);
  });

  it("emits configured SpCore options", () => {
    const problem = Problem.fromFen("8/8/8/8/8/8/8/4K3");
    problem.engine = "SpCore";
    problem.engineConfig = {
      MaxSolutions: ["3"],
      RefutationsCount: ["2"],
      ShowAllDefenses: [],
    };

    const rows = problemToSpCore(problem);

    expect(rows).toEqual([
      "Stipulation #2",
      "FEN 8/8/8/8/8/8/8/4K3 w - - 0 1",
      "Option MaxSolutions 3 RefutationsCount 2 ShowAllDefenses",
    ]);
  });
});
