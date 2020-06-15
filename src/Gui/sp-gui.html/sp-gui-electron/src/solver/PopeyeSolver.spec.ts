import { PopeyeSolver } from "./PopeyeSolver";
import { Problem } from "../../../sp-gui-angular/@sp/dbmanager/src/lib/models";
import { IProblem } from "../../../sp-gui-angular/@sp/dbmanager/src/lib/helpers";
import path from "path";

jest.setTimeout(40000);

describe("Popeye solver tests", () => {
  it("convert", async (done) => {
    const expected = [
      `BeginProblem`,
      `Pieces`,
      `White Kd1 Re2 Be1 Pc2 Sd3`,
      `Black Pg2 Rg1 Bh5 Kb6 Pb5 Pg6 Pa6 Bh6 Pc3 Sa2 Pa5 Qa3 Sc6 Rc5`,
      `Stipulation H#4`,
      `Option WhiteToPlay Try NoBoard SetPlay Variation`,
      `Twin Move d3 b2`,
      `EndProblem`,
    ].join("\n");
    const jsonProblem = (await import("./test1.json")) as Partial<IProblem>;
    const problem = Problem.fromJson(jsonProblem);
    const runner = new PopeyeSolver({
      problemSolvers: {
        Popeye: {
          enabled: true,
          executablePath: "",
          extraOptions: [`Try`, `NoBoard`, `SetPlay`, `Variation`],
        },
      },
    });

    const buffer = runner.problemToPopeye(problem).join("\n");

    expect(buffer).toBe(expected);

    done();
  });

  it("resolve problem", async (done) => {
    const jsonProblem = (await import("./test1.json")) as Partial<IProblem>;
    const problem = Problem.fromJson(jsonProblem);
    const runner = new PopeyeSolver({
      problemSolvers: {
        Popeye: {
          enabled: true,
          executablePath: path.join(
            path.resolve(__dirname, "..", ".."),
            "engines",
            "popeye",
            "pywin64.exe"
          ),
        },
      },
    });

    let solutions: string[] = [];
    await new Promise((resolve, reject) => {
      runner.start(
        problem,
        (msg: string) => {
          solutions.push(...msg.split("\n").map(r => r.trimRight()));
        },
        () => {
          expect(solutions.length).toBeGreaterThan(0);
          resolve();
        }
      );
    });

    console.log(solutions);

    done();
  });
});
