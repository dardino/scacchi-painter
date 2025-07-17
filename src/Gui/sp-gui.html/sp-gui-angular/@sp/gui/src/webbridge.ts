import { parsePopeyeRow } from "@ph/moveParser";
import { problemToPopeye } from "@ph/problemToPopeye";
import { Problem } from "@sp/dbmanager/src/lib/models";
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

    const problem = problemToPopeye(CurrentProblem, mode).join("\n");
    this.startSolve(problem);
    this.ww.postMessage({ problem });

    return this.solver$.asObservable();
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
