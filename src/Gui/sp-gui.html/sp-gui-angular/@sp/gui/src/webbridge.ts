import { TwinModes, TwinTypes } from "@sp/dbmanager/src/lib/helpers";
import { Piece, Problem } from "@sp/dbmanager/src/lib/models";
import { BridgeGlobal, EOF } from "@sp/host-bridge/src/lib/bridge-global";
import { BehaviorSubject, Observable } from "rxjs";

class WebBridge implements BridgeGlobal {
  private solver$: BehaviorSubject<string | EOF>;
  private ww: Worker = new Worker("./assets/engine/popeye_ww.js");

  private startWorker() {
    this.ww = new Worker("./assets/engine/popeye_ww.js");
    this.ww.addEventListener("error", this.error);
    this.ww.addEventListener("message", this.message);
    this.ww.addEventListener("messageerror", this.messageError);
  }
  private stopWorker() {
    this.ww.removeEventListener("error", this.error);
    this.ww.removeEventListener("message", this.message);
    this.ww.removeEventListener("messageerror", this.messageError);
    this.ww.terminate();
  }

  private endSolve(reason: EOF) {
    this.solver$.next(reason);
    this.stopWorker();
    setTimeout(() => this.solver$.unsubscribe(), 500);
  }
  private startSolve(problem: string) {
    problem.split("\n").forEach((row) => {
      setTimeout(() => {
        this.solver$.next(row);
      }, 1);
    });
    this.startWorker();
  }

  private error = (ev: ErrorEvent) => {
    this.solver$.next({ exitCode: -1, message: ev.message });
  };
  private message = (e: MessageEvent<string>) => {
    this.solver$.next(e.data);
    if (e.data.indexOf("solution finished") > -1) {
      this.endSolve({ exitCode: 0, message: `program exited with code: 0` });
    }
  };
  private messageError = (e: MessageEvent<string>) => {
    this.solver$.next({ exitCode: -1, message: e.data });
  };
  supportsEngine(engine: string): boolean {
    return engine === "Popeye";
  }
  openFile(): File | PromiseLike<File | null> | null {
    throw new Error("Method not implemented.");
  }
  saveFile(content: File): string | Promise<string> {
    throw new Error("Method not implemented.");
  }
  stopSolve(): void {
    this.endSolve({ exitCode: -1, message: "solution stopped!" });
  }
  runSolve(
    CurrentProblem: Problem,
    engine: string
  ): Observable<string | EOF> | Error {
    if (engine !== "Popeye") {
      return new Error("Engine not found.");
    }
    this.solver$ = new BehaviorSubject<string | EOF>(
      `starting engine <${engine}>`
    );

    const problem = this.problemToPopeye(CurrentProblem).join("\n");
    this.startSolve(problem);
    this.ww.postMessage({ problem });

    return this.solver$.asObservable();
  }
  public problemToPopeye(problem: Problem): string[] {
    const rows: string[] = [];

    const extraOptions: string[] = [];

    // BeginProblem
    rows.push("BeginProblem");
    // Condition
    if (problem.conditions.filter((f) => f !== "").length > 0) {
      rows.push(`Condition ${problem.conditions.join(" ")}`);
    }
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
      `Stipulation ${problem.stipulation.simpleStipulationDesc}${dmoves}`
    );

    // Options
    extraOptions.push(...["NoBoard", "Try", "Set", "Variation"]);
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

export const polyfillBridge = () => {
  if (!window.Bridge) {
    window.Bridge = new WebBridge();
  }
};

const pieceSortByName = (a: Piece, b: Piece): -1 | 0 | 1 => {
  const na = a.ToNotation();
  const nb = b.ToNotation();
  return na < nb ? -1 : na > nb ? 1 : 0;
};

const toPopeyePiece = (a: Piece): string =>
  [
    (a.fairyCode[0] ?? {}).code?.toUpperCase() ||
      a.appearance.toUpperCase().replace("N", "S"),
    a.column[3].toLowerCase(),
    a.traverse[3],
  ].join("");

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
