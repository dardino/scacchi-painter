import { parsePopeyeRow } from "@ph/moveParser";
import { TwinModes, TwinTypesKeys } from "@sp/dbmanager/src/lib/helpers";
import { Piece, Problem } from "@sp/dbmanager/src/lib/models";
import { BridgeGlobal, EOF, SolutionRow, SolveModes } from "@sp/host-bridge/src/lib/bridge-global";
import { BehaviorSubject, Observable } from "rxjs";

class WebBridge implements BridgeGlobal {
  private solver$: BehaviorSubject<SolutionRow | EOF>;
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
        this.solver$.next({ raw: row, rowtype: "log", moveTree: [] });
      }, 1);
    });
    this.startWorker();
  }

  private error = (ev: ErrorEvent) => {
    this.solver$.next({ exitCode: -1, message: ev.message });
  };
  private message = (e: MessageEvent<string>) => {
    const mov = parsePopeyeRow(e.data);
    const halfMoves = mov.flatMap((m) => m[1]).filter(move => !!move);
    this.solver$.next({ raw: e.data, rowtype: mov.length ? "data" : "log", moveTree: halfMoves });
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
  saveFile(/* content: File */): string | Promise<string> {
    throw new Error("Method not implemented.");
  }
  stopSolve(): void {
    this.endSolve({ exitCode: -1, message: "solution stopped!" });
  }
  runSolve(
    CurrentProblem: Problem,
    engine: string,
    mode: SolveModes
  ): Observable<SolutionRow | EOF> | Error {
    if (engine !== "Popeye") {
      return new Error("Engine not found.");
    }
    this.solver$ = new BehaviorSubject<SolutionRow | EOF>(
      {
        raw: `starting engine <${engine}>`,
        rowtype: "log",
        moveTree: [],
      }
    );

    const problem = this.problemToPopeye(CurrentProblem, mode).join("\n");
    this.startSolve(problem);
    this.ww.postMessage({ problem });

    return this.solver$.asObservable();
  }
  public problemToPopeye(problem: Problem, mode: SolveModes): string[] {
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
    (["White", "Black", "Neutral"] as Piece["color"][]).forEach(
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
    if (mode === "try") extraOptions.push("PostKeyPlay");
    rows.push(
      `Stipulation ${problem.stipulation.simpleStipulationDesc}${dmoves}`
    );

    // Options
    extraOptions.push(...["NoBoard", "Try", "Set", "Variation"]);
    rows.push(`Option ${extraOptions.join(" ")}`);

    // Twins
    problem.twins.TwinList.forEach((t) => {
      if (t.TwinType === "Diagram") return;
      rows.push(
        `Twin ${t.TwinModes === TwinModes.Combined ? "Cont " : ""}${popeyeTwinMapper[
          t.TwinType
        ](t.ValueA, t.ValueB, t.ValueC)}`
      );
    });

    rows.push(`EndProblem`);
    return rows;
  }
}

const handleFiles = async (files: HandledFile[]) => {
    for (const file of files) {
        const blob = await file.getFile();
        // blob.handle = file;
        const text = await blob.text();
        // TODO: open the file
        console.warn(`${file.name} handled, content: ${text}`);
    }
};

export const polyfillBridge = () => {
  if ("launchQueue" in window) {
    console.warn("File Handling API is supported!");
    window.launchQueue?.setConsumer((launchParams) => {
      handleFiles(launchParams.files);
    });
  } else {
    console.error("File Handling API is not supported!");
  }

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

export const popeyeTwinMapper: Record<TwinTypesKeys, (...args: string[]) => string> = {
  Custom: (...args: string[]) => args.join(" ").trim(),
  Diagram: () => `Diagram`,
  MovePiece: (...args: string[]) => `Move ${args.join(" ")}`.trim(),
  RemovePiece: (...args: string[]) => `Remove ${args[0]}`.trim(),
  AddPiece: (...args: string[]) => `Add ${args.join(" ")}`.trim(),
  Substitute: (...args: string[]) =>
    `Substitute ${args[0]} ==> ${args[1]}`.trim(),
  SwapPieces: (...args: string[]) =>
    `Exchange ${args[0]} <-> ${args[1]}`.trim(),
  Rotation90: () => `Rotate 90`,
  Rotation180: () => `Rotate 180`,
  Rotation270: () => `Rotate 270`,
  TraslateNormal: (...args: string[]) =>
    `Shift: ${args[0]} -> ${args[1]}`.trim(),
  TraslateToroidal: (...args: string[]) =>
    `Shift: ${args[0]} -> ${args[1]}`.trim(),
  MirrorHorizontal: () => `Mirror a1<-->a8`,
  MirrorVertical: () => `Mirror a1<-->h1`,
  Stipulation: (...args: string[]) =>
    `Stipulation > ${args.join(" ")}`.trim(),
  ChangeProblemType: (...args: string[]) =>
    `Stipulation > ${args.join(" ")}`.trim(),
  Duplex: () => `Duplex`,
  AfterKey: () => `After Key`,
  SwapColors: () => `PolishType`,
  Condition: (...args: string[]) => `Condition ${args.join(" ")}`.trim(),
  Mirror: (...args: string[]) => `Mirror ${args.join(" ")}`.trim()
};
