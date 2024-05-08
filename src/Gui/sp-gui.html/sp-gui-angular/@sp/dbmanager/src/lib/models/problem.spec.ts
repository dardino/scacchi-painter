import { IProblem, TwinModes } from "../helpers";
import { Problem } from "./problem";
import { Twin } from "./twin";

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

describe("applyJson", () => {
  let problem: Problem;

  beforeEach(() => {
    problem = Problem.fromJson({});
  });

  it("should apply JSON properties to the problem instance", () => {
    const json: Partial<IProblem> = {
      authors: [
        { nameAndSurname: "Author 1", country: "Country 1" },
        { nameAndSurname: "Author 2", country: "Country 2" },
      ],
      pieces: [
        { appearance: "k", color: "White", column: "ColA", traverse: "Row1" },
        { appearance: "k", color: "Black", column: "ColH", traverse: "Row2" },
      ],
      stipulation: { stipulationType: "#", completeStipulationDesc: "#2", problemType: "-", moves: 2 },
      twins: { TwinList: [Twin.fromJson({ TwinType: "Diagram", TwinModes: TwinModes.Normal})] },
      htmlSolution: "<p>Solution</p>",
      textSolution: "Solution",
      date: "2022-01-01",
      personalID: "123",
      prizeRank: 1,
      prizeDescription: "First prize",
      source: "Source",
      conditions: ["Condition 1", "Condition 2"],
      tags: ["Tag 1", "Tag 2"],
    };

    Problem.applyJson(json, problem);
    expect(problem.twins.TwinList.length).toBe(1);
  });

});
