import { inject, Injectable, signal } from "@angular/core";
import { Engines, SolutionRow, SolveModes } from "@sp/host-bridge/src/lib/bridge-global";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Problem } from "./models";

@Injectable({
  providedIn: "root",
})
export class EngineManagerService {
  solution = signal<SolutionRow | null>(null);
  isSolving = signal(false);
  supportsSolve = true;

  private bridge = inject(HostBridgeService);

  constructor() {
    this.bridge.Solver$.subscribe((msg) => {
      this.solution.set(msg);
    });
    this.bridge.solveInProgress$.subscribe(v => this.isSolving.set(v));
  }

  public startSolving(problem: Problem, mode: SolveModes): void {
    if (!problem) {
      throw new Error("unable to solve a null problem!");
    }
    if (this.bridge.supportsEngine(problem.engine)) {
      this.bridge.startSolve(problem, problem.engine, mode);
      return;
    }
    throw new Error(`Engine ${problem.engine} not supported.`);
  }

  public availableEngines(): Engines[] {
    return this.bridge.availableEngines();
  }

  public stopSolving(): void {
    try {
      this.bridge.stopSolve();
    }
    catch {
      // nope
    }
    finally {
      // nope
    }
  }
}
