import child, { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import {
  TwinModes,
  TwinTypes,
} from "../../../sp-gui-angular/@sp/dbmanager/src/lib/helpers";
import {
  Piece,
  Problem,
} from "../../../sp-gui-angular/@sp/dbmanager/src/lib/models";
import { EOF } from "../../../sp-gui-angular/@sp/host-bridge/src/lib/bridge-global";
import { IApplicationConfig } from "../settings/IApplicationConfig";
import { ISolver } from "./Solver";

const txtName = `problem.txt`;

function pieceSortByName(a: Piece, b: Piece): -1 | 0 | 1 {
  const na = a.ToNotation();
  const nb = b.ToNotation();
  return na < nb ? -1 : na > nb ? 1 : 0;
}

function toPopeyePiece(a: Piece): string {
  return [
    (a.fairyCode[0] ?? {}).code?.toUpperCase() ||
    a.appearance.toUpperCase().replace("N", "S"),
    a.column[3].toLowerCase(),
    a.traverse[3],
  ].join("");
}

export class PopeyeSolver implements ISolver {
  private childProcess: child.ChildProcessWithoutNullStreams | null = null;
  readonly key: string = "Popeye";
  constructor(private cfg: IApplicationConfig) { }
  get running(): boolean {
    return false;
  }
  stop(): void {
    console.log("[POPEYE SOLVER] -> try to kill process...");
    if (this.childProcess && !this.childProcess.killed)
      this.childProcess.kill();
    this.childProcess = null;
  }
  start(
    problem: Problem,
    cbOut: (text: string) => void,
    done: (eof: EOF) => void
  ): void {
    if (this.childProcess) this.childProcess.kill();

    this.writeTempFile(problem)
      .then(async (textContent) => {
        cbOut(textContent.join("\n"));
        this.childProcess = await this.runProcess();

        if (!this.childProcess) {
          done({
            exitCode: -1,
            message: "Process disconnected!",
          });
          return;
        }

        this.childProcess.on("error", (err) => {
          console.error(err);
          cbOut(err.message);
          this.stop();
        });

        this.childProcess.on("exit", (code, signal) => {
          console.log("exit", code, signal);
          this.deleteFile();
        });

        if (this.childProcess.stdout)
          this.childProcess.stdout.on("data", (data: Buffer) => {
            console.log(data);
            cbOut(data.toString("utf8"));
          });
        if (this.childProcess.stderr)
          this.childProcess.stderr.on("data", (data: Buffer) => {
            console.log(data);
            cbOut(`ERR: ${data.toString("utf8")}`);
          });

        this.childProcess.on("close", (code) => {
          this.childProcess = null;
          done({
            exitCode: code,
            message: `program exited with code: ${code}`,
          });
        });
      })
      .catch((err) => {
        done({
          exitCode: -1,
          message: err.message,
        });
      });
  }
  private deleteFile() {
    try {
      fs.unlinkSync(this.txtFileName);
    } catch (err) {
      console.log(err);
    }
  }
  txtFileName = "";
  private async writeTempFile(problem: Problem): Promise<string[]> {
    const content = this.problemToPopeye(problem);
    this.txtFileName = path.join(os.tmpdir(), txtName);
    if (fs.existsSync(this.txtFileName)) this.deleteFile();
    fs.writeFileSync(this.txtFileName, content.join("\n"));
    return content;
  }

  private async runProcess() {
    const p = spawn(this.cfg.problemSolvers.Popeye.executablePath, [txtName], {
      cwd: os.tmpdir(),
      detached: false,
      stdio: ["pipe"]
    });
    return p;
  }

  public problemToPopeye(problem: Problem): string[] {
    const rows: string[] = [];

    const extraOptions: string[] = [];

    // BeginProblem
    rows.push("BeginProblem");
    // Condition
    if (problem.conditions.filter((f) => f != "").length > 0)
      rows.push(`Condition ${problem.conditions.join(" ")}`);
    // Pieces
    rows.push("Pieces");
    (["White", "Black", "Neutral"] as Array<Piece["color"]>).forEach(
      (color) => {
        const withAttr = problem.pieces
          .filter((c) => c.color === color)
          .sort(pieceSortByName)
          .map(toPopeyePiece);
        if (withAttr.length > 0) rows.push(`${color} ${withAttr.join(" ")}`);
      }
    );

    // Stipulation
    let dmoves = Math.floor(problem.stipulation.moves);
    if (dmoves !== problem.stipulation.moves) {
      extraOptions.push("WhiteToPlay");
      dmoves++;
    }
    rows.push(
      `Stipulation ${problem.stipulation.completeStipulationDesc}${dmoves}`
    );

    // Options
    extraOptions.push(
      ...(this.cfg.problemSolvers.Popeye.extraOptions ?? [
        "NoBoard",
        "Try",
        "Set",
        "Variation",
      ])
    );
    rows.push(`Option ${extraOptions.join(" ")}`);

    // Twins
    problem.twins.TwinList.forEach((t) => {
      if (t.TwinType === TwinTypes.Diagram) return;
      rows.push(
        `Twin ${t.TwinModes === TwinModes.Combined ? "Cont " : ""}${twinmapper[
          t.TwinType
        ](t.ValueA, t.ValueB, t.ValueC)}`
      );
    });

    rows.push(`EndProblem`);
    console.log(rows);
    return rows;
  }
}

const twinmapper = {
  [TwinTypes.Custom]: (...args: string[]) => args.join(" ").trim(),
  [TwinTypes.Diagram]: () => `Diagram`,
  [TwinTypes.MovePiece]: (...args: string[]) => `Move ${args.join(" ")}`.trim(),
  [TwinTypes.RemovePiece]: (...args: string[]) => `Remove ${args[0]}`.trim(),
  [TwinTypes.AddPiece]: (...args: string[]) => `Add ${args.join(" ")}`.trim(),
  [TwinTypes.Substitute]: (...args: string[]) =>
    `Substitute ${args[0]} ==> ${args[1]}`.trim(),
  [TwinTypes.SwapPieces]: (...args: string[]) =>
    `Exchange ${args[0]} <-> ${args[1]}`.trim(),
  [TwinTypes.Rotation90]: () => `Rotate 90`,
  [TwinTypes.Rotation180]: () => `Rotate 180`,
  [TwinTypes.Rotation270]: () => `Rotate 270`,
  [TwinTypes.TraslateNormal]: (...args: string[]) =>
    `Shift: ${args[0]} -> ${args[1]}`.trim(),
  [TwinTypes.TraslateToroidal]: (...args: string[]) =>
    `Shift: ${args[0]} -> ${args[1]}`.trim(),
  [TwinTypes.MirrorHorizontal]: () => `Mirror a1<-->a8`,
  [TwinTypes.MirrorVertical]: () => `Mirror a1<-->h1`,
  [TwinTypes.Stipulation]: (...args: string[]) =>
    `Stipulation > ${args.join(" ")}`.trim(),
  [TwinTypes.ChangeProblemType]: (...args: string[]) =>
    `Stipulation > ${args.join(" ")}`.trim(),
  [TwinTypes.Duplex]: () => `Duplex`,
  [TwinTypes.AfterKey]: () => `After Key`,
  [TwinTypes.SwapColors]: () => `PolishType`,
} as const;
