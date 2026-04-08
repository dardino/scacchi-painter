// When using the Tauri API npm package:
import { parsePopeyeRow } from "@ph/moveParser";
import { problemToPopeye, problemToSpCore } from "@ph/problemToPopeye";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { EngineConfiguration } from "@sp/dbmanager/src/lib/models/engine";
import { invoke } from "@tauri-apps/api/core";
import { Event, listen } from "@tauri-apps/api/event";
import { BehaviorSubject, Observable } from "rxjs";
import { BridgeGlobal, Engines, EOF, SolutionRow, SolveModes } from "../lib/bridge-global";
import { formatSpCoreUnsupportedMessage, getSpCoreUnsupportedFeatures } from "../lib/spcore-support";

type RustSolverOptions = {
  maxSolutions?: number;
  refutationsTry?: number;
  showAllDefenses: boolean;
};

class TauriBridge implements BridgeGlobal {
  private solveEnded = true;
  private currentEngine: Engines = "Popeye";

  constructor() {
    listen("popeye-update", (event: Event<string>) => {
      if (this.currentEngine === "Popeye") {
        this.processData(event.payload ?? "");
      }
    });
    listen("spcore-update", (event: Event<string>) => {
      if (this.currentEngine === "SpCore") {
        this.processSpCoreData(event.payload ?? "");
      }
    });
  }

  private processData(data: string) {
    const mov = parsePopeyeRow(data, this.currentProblem.startMoveN);
    const halfMoves = mov.flatMap(m => m[1]).filter(move => !!move);
    this.solver$.next({ raw: data, rowtype: mov.length ? "data" : "log", moveTree: halfMoves });
    if (data.indexOf("solution finished") > -1) {
      this.endSolve({ exitCode: 0, message: `program exited with code: 0` });
    }
  }

  private processSpCoreData(data: string) {
    try {
      const msg = JSON.parse(data) as {
        type: "solution" | "done" | "error";
        index?: number;
        winning_line?: string[];
        winning_line_popeye?: string[];
        explored_nodes?: number;
        solutions_found?: number;
        stopped_early?: boolean;
        timed_out?: boolean;
        message?: string;
      };
      if (msg.type === "solution") {
        const popeyeLine = msg.winning_line_popeye ?? [];
        const raw = this.formatPopeyeLikeRow(popeyeLine);
        const mov = parsePopeyeRow(raw, this.currentProblem.startMoveN);
        const halfMoves = mov.flatMap(m => m[1]).filter(move => !!move);
        this.solver$.next({ raw, rowtype: mov.length ? "data" : "log", moveTree: halfMoves });
      }
      else if (msg.type === "done") {
        const raw = `SpCore: ${msg.solutions_found} solution(s), ${msg.explored_nodes} nodes${msg.stopped_early ? " (stopped early)" : ""}`;
        this.solver$.next({ raw, rowtype: "log", moveTree: [] });
        this.solver$.next({ raw: "solution finished", rowtype: "log", moveTree: [] });
        this.endSolve({ exitCode: 0, message: "program exited with code: 0" });
      }
      else if (msg.type === "error") {
        this.endSolve({ exitCode: -1, message: msg.message ?? "SpCore error" });
      }
    }
    catch {
      this.solver$.next({ raw: data, rowtype: "log", moveTree: [] });
    }
  }

  private formatPopeyeLikeRow(plies: string[]): string {
    if (plies.length === 0) {
      return "";
    }

    const startMove = this.currentProblem?.startMoveN ?? 1;
    if (startMove === 1.5) {
      // Keep a parse-friendly fallback for black-to-move problems.
      return `1. ${plies[0]}${plies.length > 1 ? ` ${plies.slice(1).join(" ")}` : ""}`;
    }

    const chunks: string[] = [];
    for (let i = 0; i < plies.length; i += 2) {
      const moveN = Math.floor(i / 2) + 1;
      const left = plies[i];
      const right = plies[i + 1];
      chunks.push(right ? `${moveN}. ${left} ${right}` : `${moveN}. ${left}`);
    }
    return chunks.join(" ");
  }

  private endSolve(reason: EOF) {
    if (!this.solver$ || this.solveEnded) {
      return;
    }
    this.solveEnded = true;
    this.solver$.next(reason);
    setTimeout(() => this.solver$.unsubscribe(), 500);
  }

  openFile(): File | PromiseLike<File | null> | null {
    alert("openFile not implemented");
    throw new Error("Method not implemented.");
  }

  saveFile(_content: File): string | Promise<string> {
    alert("saveFile not implemented");
    throw new Error("Method not implemented.");
  }

  closeApp?(): void {
    invoke("close_app");
  }

  stopSolve(): void {
    if (this.currentEngine === "Popeye") {
      invoke("stop_popeye").catch((error) => {
        console.warn("Failed to stop popeye process", error);
      });
    }
    else {
      invoke("stop_rust_solver").catch((error) => {
        console.warn("Failed to stop rust solver", error);
      });
    }
    this.endSolve({ exitCode: -1, message: "solution stopped!" });
  }

  private solver$: BehaviorSubject<SolutionRow | EOF>;
  private currentProblem: Problem;
  runSolve(CurrentProblem: Problem, engine: Engines, mode: SolveModes): Observable<SolutionRow | EOF> | Error {
    this.currentProblem = CurrentProblem;
    this.solveEnded = false;
    this.currentEngine = engine;

    this.solver$ = new BehaviorSubject<SolutionRow | EOF>(
      {
        raw: `starting engine <${engine}>`,
        rowtype: "log",
        moveTree: [],
      },
    );

    const problem = engine === "SpCore"
      ? problemToSpCore(CurrentProblem).join("\n")
      : problemToPopeye(CurrentProblem, mode).join("\n");
    if (engine === "Popeye") {
      this.startSolve(problem);
    }
    else if (engine === "SpCore") {
      const unsupported = getSpCoreUnsupportedFeatures(CurrentProblem, mode);
      if (unsupported.length > 0) {
        this.endSolve({
          exitCode: -1,
          message: formatSpCoreUnsupportedMessage(unsupported),
        });
        return this.solver$.asObservable();
      }
      this.startRustSolve(problem, this.getSpCoreSolverOptions(CurrentProblem.engineConfig));
    }
    else {
      return new Error(`Engine not found: ${engine}`);
    }

    return this.solver$.asObservable();
  }

  private startSolve(problem: string) {
    // Log del comando inviato all'host
    problem.split("\n").forEach((row) => {
      setTimeout(() => {
        this.solver$.next({ raw: row, rowtype: "log", moveTree: [] });
      }, 1);
    });
    invoke("run_popeye", { name: problem }).then((result) => {
      this.endSolve({ exitCode: 0, message: `program exited with code: 0 ${result}` });
    }).catch((error) => {
      this.endSolve({ exitCode: -1, message: `${error}` });
    });
  }

  private getSpCoreSolverOptions(config: EngineConfiguration | null | undefined): RustSolverOptions {
    const maxSolutionsRaw = config?.MaxSolutions?.[0]?.trim();
    const refutationsTryRaw = config?.RefutationsTry?.[0]?.trim();

    const maxSolutions = maxSolutionsRaw != null && maxSolutionsRaw !== "" ? Number.parseInt(maxSolutionsRaw, 10) : undefined;
    const refutationsTry = refutationsTryRaw != null && refutationsTryRaw !== "" ? Number.parseInt(refutationsTryRaw, 10) : undefined;

    return {
      maxSolutions: Number.isFinite(maxSolutions) && maxSolutions != null && maxSolutions > 0 ? maxSolutions : undefined,
      refutationsTry: Number.isFinite(refutationsTry) && refutationsTry != null && refutationsTry >= 0 ? refutationsTry : undefined,
      showAllDefenses: "ShowAllDefenses" in (config ?? {}),
    };
  }

  private startRustSolve(problem: string, options: RustSolverOptions) {
    invoke("run_rust_solver", { input: problem, options }).then(() => {
      this.endSolve({ exitCode: 0, message: "program exited with code: 0" });
    }).catch((error) => {
      this.endSolve({ exitCode: -1, message: `${error}` });
    });
  }

  supportsEngine(engine: Engines): boolean {
    return engine === "Popeye" || engine === "SpCore";
  }

  availableEngines(): Engines[] {
    return ["Popeye", "SpCore"];
  }
}

window.Bridge = new TauriBridge();
