// When using the Tauri API npm package:
import { parsePopeyeRow } from "@ph/moveParser";
import { problemToPopeye, problemToSpCore } from "@ph/problemToPopeye";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { EngineConfiguration } from "@sp/dbmanager/src/lib/models/engine";
import { invoke } from "@tauri-apps/api/core";
import { Event, listen } from "@tauri-apps/api/event";
import { BehaviorSubject, Observable } from "rxjs";
import {
  AsmPopeyeEngine,
  BridgeGlobal,
  Engines,
  EOF,
  NativePopeyeEngine,
  SolutionRow,
  SolveModes,
  SpCoreEngine,
  SpCoreEngineLabel,
  SpCoreJsEngine,
  SpCoreJsEngineLabel,
} from "../lib/bridge-global";
import { formatSpCoreUnsupportedMessage, getSpCoreUnsupportedFeatures } from "../lib/spcore-support";

type RustSolverOptions = {
  maxSolutions?: number;
  refutationsCount?: number;
  showAllDefenses: boolean;
  showAttempts: boolean;
};

type SpCoreDefense = {
  black_move: string;
  continuation: string[];
};

type SpCoreSolution = {
  key_move: string;
  defenses: SpCoreDefense[];
};

class TauriBridge implements BridgeGlobal {
  private solveEnded = true;
  private currentEngine: Engines = AsmPopeyeEngine;
  private ww: Worker | null = null;
  private hostEngines: Engines[] = [NativePopeyeEngine, SpCoreEngine];

  constructor() {
    this.refreshAvailableEnginesFromHost();

    listen("popeye-update", (event: Event<string>) => {
      if (this.currentEngine === NativePopeyeEngine) {
        this.processData(event.payload ?? "");
      }
    });
    listen("spcore-update", (event: Event<string>) => {
      if (this.currentEngine === SpCoreEngine) {
        this.processSpCoreData(event.payload ?? "");
      }
    });
  }

  private refreshAvailableEnginesFromHost() {
    invoke<string[]>("available_engines")
      .then((engines) => {
        const accepted = engines.filter((engine): engine is Engines => {
          return engine === NativePopeyeEngine || engine === SpCoreEngine;
        });
        this.hostEngines = accepted;
      })
      .catch((error) => {
        console.warn("Failed to retrieve engines from tauri host", error);
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
        type: "solution" | "done" | "error" | "try";
        index?: number;
        winning_line?: string[];
        winning_line_popeye?: string[];
        solution?: SpCoreSolution;
        explored_nodes?: number;
        solutions_found?: number;
        stopped_early?: boolean;
        timed_out?: boolean;
        message?: string;
        try_move?: string;
        threat_moves?: string[];
        threats?: SpCoreDefense[];
        refutations?: string[];
        elapsed_ms?: number;
      };
      if (msg.type === "solution") {
        if (msg.solution) {
          this.emitSpCoreSolution(msg.solution);
        }
        else {
          this.solver$.next({ raw: "", rowtype: "log", moveTree: [] });
          const popeyeLine = msg.winning_line_popeye ?? [];
          const raw = this.formatPopeyeLikeRow(popeyeLine);
          const mov = parsePopeyeRow(raw, this.currentProblem.startMoveN);
          const halfMoves = mov.flatMap(m => m[1]).filter(move => !!move);
          this.solver$.next({ raw, rowtype: mov.length ? "data" : "log", moveTree: halfMoves });
        }
      }
      else if (msg.type === "try") {
        this.emitSpCoreTry(msg);
      }
      else if (msg.type === "done") {
        const raw = `${SpCoreEngineLabel}: ${msg.solutions_found} solution(s), ${msg.explored_nodes} nodes${msg.stopped_early ? " (stopped early)" : ""}`;
        this.solver$.next({ raw, rowtype: "log", moveTree: [] });
        if (msg.elapsed_ms !== undefined) {
          this.solver$.next({ raw: `Time: ${msg.elapsed_ms}ms`, rowtype: "log", moveTree: [] });
        }
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

  private continuationToThreat(continuation: string[]): string | undefined {
    return continuation.length > 0 ? continuation.join(" ") : undefined;
  }

  private normalizeThreatMove(move: string): string {
    return move
      .replace(/[+#?!]/g, "")
      .replace(/[x*]/g, "")
      .trim()
      .toLowerCase();
  }

  private normalizeThreatSequence(threat: string): string {
    return threat
      .trim()
      .split(/\s+/)
      .map(move => this.normalizeThreatMove(move))
      .join(" ");
  }

  private equivalentThreat(defenseThreat: string | undefined, primaryThreat: string | undefined): boolean {
    if (!defenseThreat || !primaryThreat) {
      return false;
    }

    const normalizedDefense = this.normalizeThreatSequence(defenseThreat);
    const normalizedPrimary = this.normalizeThreatSequence(primaryThreat);
    if (normalizedDefense === normalizedPrimary) {
      return true;
    }

    const defenseFirstPly = normalizedDefense.split(" ")[0];
    const primaryFirstPly = normalizedPrimary.split(" ")[0];
    return defenseFirstPly.length > 0 && defenseFirstPly === primaryFirstPly;
  }

  private formatDefenseLine(blackMove: string, continuation: string[]): string {
    const second = continuation.length > 0 ? `2.${continuation.join(" ")}` : "";
    return second.length > 0 ? `    1... ${blackMove} ${second}` : `    1... ${blackMove}`;
  }

  private emitSpCoreSolution(solution: SpCoreSolution) {
    this.solver$.next({ raw: "", rowtype: "log", moveTree: [] });

    const threatCounts = new Map<string, number>();
    for (const defense of solution.defenses) {
      const threat = this.continuationToThreat(defense.continuation);
      if (!threat) {
        continue;
      }
      threatCounts.set(threat, (threatCounts.get(threat) ?? 0) + 1);
    }

    let primaryThreat: string | undefined;
    let maxCount = -1;
    for (const [threat, count] of threatCounts) {
      if (count > maxCount) {
        maxCount = count;
        primaryThreat = threat;
      }
    }

    const header = primaryThreat
      ? `1. ${solution.key_move} ! (threat: 2. ${primaryThreat})`
      : `1. ${solution.key_move} !`;
    this.solver$.next({ raw: header, rowtype: "log", moveTree: [] });

    for (const defense of solution.defenses) {
      const defenseThreat = this.continuationToThreat(defense.continuation);
      if (this.equivalentThreat(defenseThreat, primaryThreat)) {
        continue;
      }
      this.solver$.next({ raw: this.formatDefenseLine(defense.black_move, defense.continuation), rowtype: "log", moveTree: [] });
    }
  }

  private emitSpCoreTry(msg: {
    try_move?: string;
    threat_moves?: string[];
    threats?: SpCoreDefense[];
    refutations?: string[];
  }) {
    this.solver$.next({ raw: "", rowtype: "log", moveTree: [] });

    const tryMove = msg.try_move ?? "";
    const primaryThreat = msg.threat_moves?.[0];
    const header = primaryThreat
      ? `1. ${tryMove} ? (threat: 2. ${primaryThreat})`
      : `1. ${tryMove} ?`;
    this.solver$.next({ raw: header, rowtype: "log", moveTree: [] });

    for (const defense of msg.threats ?? []) {
      const defenseThreat = this.continuationToThreat(defense.continuation);
      if (this.equivalentThreat(defenseThreat, primaryThreat)) {
        continue;
      }
      this.solver$.next({ raw: this.formatDefenseLine(defense.black_move, defense.continuation), rowtype: "log", moveTree: [] });
    }

    if ((msg.refutations?.length ?? 0) > 0) {
      this.solver$.next({ raw: "but:", rowtype: "log", moveTree: [] });
      for (const ref of msg.refutations ?? []) {
        this.solver$.next({ raw: `    1... ${ref} !`, rowtype: "log", moveTree: [] });
      }
    }
  }

  private endSolve(reason: EOF) {
    if (!this.solver$ || this.solveEnded) {
      return;
    }
    this.solveEnded = true;
    this.solver$.next(reason);
    this.stopAsmWorker();
    setTimeout(() => this.solver$.unsubscribe(), 500);
  }

  private startAsmWorker() {
    this.ww = new Worker("./assets/engine/popeye_ww.js");
    this.ww.addEventListener("error", this.asmError);
    this.ww.addEventListener("message", this.asmMessage);
    this.ww.addEventListener("messageerror", this.asmMessageError);
  }

  private stopAsmWorker() {
    if (!this.ww) {
      return;
    }
    this.ww.removeEventListener("error", this.asmError);
    this.ww.removeEventListener("message", this.asmMessage);
    this.ww.removeEventListener("messageerror", this.asmMessageError);
    this.ww.terminate();
    this.ww = null;
  }

  private asmError = (ev: ErrorEvent) => {
    this.endSolve({ exitCode: -1, message: ev.message });
  };

  private asmMessage = (e: MessageEvent<string>) => {
    this.processData(e.data);
  };

  private asmMessageError = (e: MessageEvent<string>) => {
    this.endSolve({ exitCode: -1, message: String(e.data) });
  };

  private startAsmSolve(problem: string) {
    problem.split("\n").forEach((row) => {
      setTimeout(() => {
        this.solver$.next({ raw: row, rowtype: "log", moveTree: [] });
      }, 1);
    });

    this.stopAsmWorker();
    this.startAsmWorker();
    this.ww?.postMessage({ problem });
  }

  private supportedEngines(): Engines[] {
    return [NativePopeyeEngine, AsmPopeyeEngine, ...this.hostEngines.filter(engine => engine !== NativePopeyeEngine && engine !== AsmPopeyeEngine), SpCoreJsEngine];
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
    if (this.currentEngine === NativePopeyeEngine) {
      invoke("stop_popeye").catch((error) => {
        console.warn("Failed to stop popeye process", error);
      });
    }
    else if (this.currentEngine === SpCoreEngine) {
      invoke("stop_rust_solver").catch((error) => {
        console.warn("Failed to stop rust solver", error);
      });
    }
    this.endSolve({ exitCode: -1, message: "solution stopped!" });
  }

  private solver$: BehaviorSubject<SolutionRow | EOF>;
  private currentProblem: Problem;
  runSolve(CurrentProblem: Problem, engine: Engines, mode: SolveModes): Observable<SolutionRow | EOF> | Error {
    if (!this.supportsEngine(engine)) {
      return new Error(`Engine not found: ${engine}`);
    }

    this.currentProblem = CurrentProblem;
    this.solveEnded = false;
    this.currentEngine = engine;

    this.solver$ = new BehaviorSubject<SolutionRow | EOF>(
      {
        raw: `starting engine <${this.currentEngine === SpCoreEngine ? SpCoreEngineLabel : this.currentEngine === SpCoreJsEngine ? SpCoreJsEngineLabel : this.currentEngine}>`,
        rowtype: "log",
        moveTree: [],
      },
    );

    const problem = engine === SpCoreEngine
      ? problemToSpCore(CurrentProblem).join("\n")
      : problemToPopeye(CurrentProblem, mode).join("\n");
    if (this.currentEngine === NativePopeyeEngine) {
      this.startSolve(problem);
    }
    else if (this.currentEngine === AsmPopeyeEngine) {
      this.startAsmSolve(problem);
    }
    else if (this.currentEngine === SpCoreEngine) {
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
    else if (this.currentEngine === SpCoreJsEngine) {
      this.startJsSolve(CurrentProblem, mode);
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
    const refutationsCountRaw = config?.RefutationsCount?.[0]?.trim();
    const showAttempts = "ShowAttempts" in (config ?? {});

    const maxSolutions = maxSolutionsRaw != null && maxSolutionsRaw !== "" ? Number.parseInt(maxSolutionsRaw, 10) : undefined;
    const explicitRefutationsCount = refutationsCountRaw != null && refutationsCountRaw !== "" ? Number.parseInt(refutationsCountRaw, 10) : undefined;
    const refutationsCount = showAttempts
      ? (Number.isFinite(explicitRefutationsCount) && explicitRefutationsCount != null && explicitRefutationsCount >= 1
          ? explicitRefutationsCount
          : 1) // defaulting to 1 if showAttempts is true
      : undefined;

    return {
      maxSolutions: Number.isFinite(maxSolutions) && maxSolutions != null && maxSolutions > 0 ? maxSolutions : undefined,
      refutationsCount,
      showAllDefenses: "ShowAllDefenses" in (config ?? {}),
      showAttempts,
    };
  }

  private startRustSolve(problem: string, options: RustSolverOptions) {
    invoke("run_rust_solver", { input: problem, options }).then(() => {
      this.endSolve({ exitCode: 0, message: "program exited with code: 0" });
    }).catch((error) => {
      this.endSolve({ exitCode: -1, message: `${error}` });
    });
  }

  private startJsSolve(problem: Problem, mode: SolveModes) {
    const currentProblem = problem;
    void (async () => {
      try {
        const coreModule = await import("@dardino-chess/core");
        const solve = coreModule.solve
          ?? ("default" in coreModule && typeof coreModule.default === "object" ? (coreModule.default as { solve?: unknown }).solve : undefined);

        if (typeof solve !== "function") {
          throw new Error("Unable to resolve CoreJS solve() export from @dardino-chess/core.");
        }

        const side = currentProblem.startMoveN === 1.5 ? "b" : "w";
        const baseFen = currentProblem.getCurrentFen().split(" [", 1)[0];
        const fen = `${baseFen} ${side} - - 0 1`;
        const input = {
          id: String(currentProblem.personalID ?? Math.random().toString(36).slice(2)),
          fen,
          stipulation: currentProblem.stipulation?.completeStipulationDesc ?? undefined,
          popeye: problemToPopeye(currentProblem, mode).join("\n"),
        };

        const res = await solve(input, undefined);
        const donePayload = JSON.stringify({
          type: "done",
          elapsed_ms: res.timeMs,
          solutions_found: res.solved ? 1 : 0,
          winning_line_popeye: res.bestLine ?? [],
        });

        this.processSpCoreData(donePayload);
      }
      catch (error) {
        this.endSolve({ exitCode: -1, message: error instanceof Error ? error.message : String(error) });
      }
    })();
  }

  supportsEngine(engine: Engines): boolean {
    return this.supportedEngines().includes(engine);
  }

  availableEngines(): Engines[] {
    return this.supportedEngines();
  }
}

window.Bridge = new TauriBridge();
