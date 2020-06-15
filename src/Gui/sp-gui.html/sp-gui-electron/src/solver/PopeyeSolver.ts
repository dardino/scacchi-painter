import { ISolver } from "./Solver";
import { IApplicationConfig } from "../settings/IApplicationConfig";
import {
  Problem,
  Piece,
} from "../../../sp-gui-angular/@sp/dbmanager/src/lib/models";
import { EOF } from "../../../sp-gui-angular/@sp/host-bridge/src/lib/bridge-global";
import {
  TwinTypes,
  TwinModes,
} from "../../../sp-gui-angular/@sp/dbmanager/src/lib/helpers";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

function pieceSortByName(a: Piece, b: Piece): -1 | 0 | 1 {
  return 0;
}

export class PopeyeSolver implements ISolver {
  readonly key: string = "Popeye";
  constructor(private cfg: IApplicationConfig) {}
  get running(): boolean {
    return false;
  }
  stop(): void {
    throw new Error("Method not implemented.");
  }
  start(
    problem: Problem,
    cbOut: (text: string) => void,
    done: (eof: EOF) => void
  ): void {
    this.writeTempFile(problem).then(() => {
      this.runProcess().then((p) => {
        p.stdout.on("data", (data) => {
          console.log("[stdout] " + data);
          cbOut(data);
        });
        p.stderr.on("data", (data) => {
          console.error("[stderr] " + data);
        });
        p.on("close", (code) => {
          console.log(`[closed] program exited with code: ${code}`);
          done({
            exitCode: code,
            message: `program exited with code: ${code}`,
          });
        });
      });
    });
  }

  private async writeTempFile(problem: Problem): Promise<void> {
    const content = this.problemToPopeye(problem);
    await fs.promises.writeFile(path.join(__dirname, "problem.txt"), content);
  }

  private async runProcess() {
    const p = spawn(this.cfg.problemSolvers.Popeye.executablePath, {
      argv0: "problem.txt",
      cwd: __dirname,
    });
    return p;
  }

  private problemToPopeye(problem: Problem): Buffer {
    const rows: string[] = [];

    const extraOptions: string[] = [];

    // BeginProblem
    rows.push("BeginProblem");
    // Condition
    if (problem.conditions.length > 0)
      rows.push(`Condition ${problem.conditions.join(" ")}`);
    // Pieces
    rows.push("Pieces");
    (["White", "Black", "Neutral"] as Array<Piece["color"]>).forEach(
      (color) => {
        const withAttr = problem.pieces
          .filter((c) => c.color === color)
          .sort(pieceSortByName);
        rows.push(`${color} ${withAttr.join(" ")}`);
      }
    );

    // Stipulation
    const dmoves = Math.floor(problem.stipulation.moves);
    if (dmoves !== problem.stipulation.moves) extraOptions.push("WhiteToPlay");
    rows.push(
      `Stipulation ${problem.stipulation.completeStipulationDesc.replace(
        /[,.5]/,
        ""
      )}`
    );

    // Twins
    problem.twins.Twins.forEach((t) => {
      if (t.TwinType === TwinTypes.Diagram) return;
      rows.push(
        `Twin ${t.TwinModes === TwinModes.Combined ? "Cont " : ""}${
          twinmapper[t.TwinType]
        }`
      );
    });

    if (extraOptions.length === 0) {
      extraOptions.push("NoBoard");
      extraOptions.push("Try");
      extraOptions.push("Set");
      extraOptions.push("Variation");
    }
    rows.push(`Option ${extraOptions.join(" ")}`);
    rows.push(`EndProblem`);

    return Buffer.from(rows);
  }
}

const twinmapper = {
  [TwinTypes.Custom           ]: (...args: string[]) => args.join(" ").trim(),
  [TwinTypes.Diagram          ]: ()                  => `Diagram`,
  [TwinTypes.MovePiece        ]: (...args: string[]) => `Move ${args[0]} -> ${args[1]}`.trim(),
  [TwinTypes.RemovePiece      ]: (...args: string[]) => `Remove ${args[0]}`.trim(),
  [TwinTypes.AddPiece         ]: (...args: string[]) => `Add ${args.join(" ")}`.trim(),
  [TwinTypes.Substitute       ]: (...args: string[]) => `Substitute ${args[0]} ==> ${args[1]}`.trim(),
  [TwinTypes.SwapPieces       ]: (...args: string[]) => `Exchange ${args[0]} <-> ${args[1]}`.trim(),
  [TwinTypes.Rotation90       ]: ()                  => `Rotate 90`,
  [TwinTypes.Rotation180      ]: ()                  => `Rotate 180`,
  [TwinTypes.Rotation270      ]: ()                  => `Rotate 270`,
  [TwinTypes.TraslateNormal   ]: (...args: string[]) => `Shift: ${args[0]} -> ${args[1]}`.trim(),
  [TwinTypes.TraslateToroidal ]: (...args: string[]) => `Shift: ${args[0]} -> ${args[1]}`.trim(),
  [TwinTypes.MirrorHorizontal ]: ()                  => `Mirror a1<-->a8`,
  [TwinTypes.MirrorVertical   ]: ()                  => `Mirror a1<-->h1`,
  [TwinTypes.Stipulation      ]: (...args: string[]) => `Stipulation > ${args.join(" ")}`.trim(),
  [TwinTypes.ChangeProblemType]: (...args: string[]) => `Stipulation > ${args.join(" ")}`.trim(),
  [TwinTypes.Duplex           ]: ()                  => `Duplex`,
  [TwinTypes.AfterKey         ]: ()                  => `After Key`,
  [TwinTypes.SwapColors       ]: ()                  => `PolishType`,
} as const;
