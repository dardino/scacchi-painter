import { type SolverOptions } from "@dardino-chess/core";
import { parsePopeyeRow } from "@ph/moveParser";
import { problemToPopeye } from "@ph/problemToPopeye";
import { Problem } from "@sp/dbmanager/src/lib/models";
import {
  AsmPopeyeEngine,
  BridgeGlobal,
  Engines,
  EOF,
  NativePopeyeEngine,
  SolutionRow,
  SolveModes,
  SpCoreJsEngine,
  SpCoreJsEngineLabel,
} from "@sp/host-bridge/src/lib/bridge-global";
import { BehaviorSubject, Observable } from "rxjs";

class WebBridge implements BridgeGlobal {
  private problem: Problem;
  private solver$: BehaviorSubject<SolutionRow | EOF>;
  private solveEnded = true;
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
    if (!this.solver$ || this.solveEnded) {
      return;
    }
    this.solveEnded = true;
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
    const mov = parsePopeyeRow(e.data, this.problem.startMoveN);
    const halfMoves = mov.flatMap(m => m[1]).filter(move => !!move);
    this.solver$.next({ raw: e.data, rowtype: mov.length ? "data" : "log", moveTree: halfMoves });
    if (e.data.indexOf("solution finished") > -1) {
      this.endSolve({ exitCode: 0, message: `program exited with code: 0` });
    }
  };

  private messageError = (e: MessageEvent<string>) => {
    this.solver$.next({ exitCode: -1, message: e.data });
  };

  private normalizeEngine(engine: Engines): Engines {
    return engine === NativePopeyeEngine ? AsmPopeyeEngine : engine;
  }

  supportsEngine(engine: Engines): boolean {
    const normalized = this.normalizeEngine(engine);
    return normalized === AsmPopeyeEngine || normalized === SpCoreJsEngine;
  }

  availableEngines(): Engines[] {
    return [AsmPopeyeEngine, SpCoreJsEngine];
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
    engine: Engines,
    mode: SolveModes,
  ): Observable<SolutionRow | EOF> | Error {
    const normalizedEngine = this.normalizeEngine(engine);
    if (normalizedEngine === AsmPopeyeEngine) {
      this.problem = CurrentProblem;
      this.solveEnded = false;
      this.solver$ = new BehaviorSubject<SolutionRow | EOF>(
        {
          raw: `starting engine <${normalizedEngine}>`,
          rowtype: "log",
          moveTree: [],
        },
      );

      const problem = problemToPopeye(CurrentProblem, mode).join("\n");
      this.startSolve(problem);
      this.ww.postMessage({ problem });

      return this.solver$.asObservable();
    }

    if (normalizedEngine === SpCoreJsEngine) {
      this.problem = CurrentProblem;
      this.solveEnded = false;
      this.solver$ = new BehaviorSubject<SolutionRow | EOF>(
        {
          raw: `starting engine <${SpCoreJsEngineLabel}>`,
          rowtype: "log",
          moveTree: [],
        },
      );

      (async () => {
        try {
          // dynamic import so bundler includes CoreJS only when used
          const coreModule = await import("@dardino-chess/core/browser");
          const maybeDefault = "default" in coreModule ? coreModule.default : undefined;
          const maybeModuleExports = "module.exports" in coreModule
            ? (coreModule as Record<string, unknown>)["module.exports"]
            : undefined;
          const solve = coreModule.solve
            ?? (typeof maybeDefault === "function" ? maybeDefault : undefined)
            ?? (typeof maybeDefault === "object" && maybeDefault !== null
              ? (maybeDefault as { solve?: unknown }).solve
              : undefined)
            ?? (typeof maybeModuleExports === "object" && maybeModuleExports !== null
              ? (maybeModuleExports as { solve?: unknown }).solve
              : undefined);

          if (typeof solve !== "function") {
            throw new Error(`Unable to resolve CoreJS solve() export from @dardino-chess/core. keys=${Object.keys(coreModule).join(",")}`);
          }

          // build ProblemInput expected by CoreJS
          const side = this.problem.startMoveN === 1.5 ? "b" : "w";
          const baseFen = this.problem.getCurrentFen().split(" [", 1)[0];
          const fen = `${baseFen} ${side} - - 0 1`;
          const input = {
            id: String((this.problem).personalID ?? Math.random().toString(36).slice(2)),
            fen,
            stipulation: this.problem.stipulation?.completeStipulationDesc ?? undefined,
            popeye: problemToPopeye(this.problem, mode).join("\n"),
          };

          const opts = {} as SolverOptions; // could be wired from engine config later
          const res = await solve(input, opts);

          // Emit a SpCore-like JSON message so existing UI parsers can handle it
          const donePayload = JSON.stringify({
            type: "done",
            elapsed_ms: res.timeMs,
            solutions_found: res.solved ? 1 : 0,
            winning_line_popeye: res.bestLine ?? [],
          });

          this.solver$.next({ raw: donePayload, rowtype: "log", moveTree: [] });
          // give consumers a small log message with time
          this.solver$.next({ raw: `Time: ${res.timeMs}ms`, rowtype: "log", moveTree: [] });
          this.solver$.next({ raw: "solution finished", rowtype: "log", moveTree: [] });
          this.endSolve({ exitCode: 0, message: `program exited with code: 0` });
        }
        catch (err) {
          if (err instanceof Error) {
            this.solver$.next({ raw: String(err?.message || err), rowtype: "log", moveTree: [] });
            this.endSolve({ exitCode: -1, message: String(err?.message || err) });
          }
          else {
            this.solver$.next({ raw: String(err), rowtype: "log", moveTree: [] });
            this.endSolve({ exitCode: -1, message: String(err) });
          }
        }
      })();

      return this.solver$.asObservable();
    }

    return new Error("Engine not found.");
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
  }
  else {
    console.error("File Handling API is not supported!");
  }

  if (!window.Bridge) {
    window.Bridge = new WebBridge();
  }
};
