import { PopeyeSolver } from "./PopeyeSolver";
import { Problem } from "../../../sp-gui-angular/@sp/dbmanager/src/lib/models";
import { IProblem } from "../../../sp-gui-angular/@sp/dbmanager/src/lib/helpers";
import path from "path";

jest.setTimeout(30000);

describe("Popeye solver tests", () => {
  it("build", async (done) => {
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
          )
        }
      }
    });

    let solutions: string[] = [];
    runner.start(
      problem,
      (msg) => {
        solutions.push(msg);
      },
      () => {
        expect(solutions.length).toBeGreaterThan(0);
        done();
      }
    );
  });
});
