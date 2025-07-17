import { inject, Injectable } from "@angular/core";
import { SolutionRow, SolveModes } from "@sp/host-bridge/src/lib/bridge-global";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { BehaviorSubject } from "rxjs";
import { Problem } from "./models";

@Injectable({
  providedIn: "root",
})
export class EngineManagerService {
  solution$ = new BehaviorSubject<SolutionRow | null>(null);
  isSolving$ = new BehaviorSubject(false);
  supportsSolve = true;

  private bridge = inject(HostBridgeService);

  constructor() {
    this.bridge.Solver$.subscribe((msg) => {
      this.solution$.next(msg);
    });
    this.bridge.solveInProgress$.subscribe((v) => this.isSolving$.next(v));
  }

  public startSolving(problem: Problem, mode: SolveModes): void {
    if (!problem) {
      throw new Error("unable to solve a null problem!");
    }
    if (this.bridge.supportsEngine(problem.engine)) {
      this.bridge.startSolve(problem, mode);
      return;
    }
    throw new Error(`Engine ${problem.engine} not supported.`);
  }

  public stopSolving(): void {
    try {
      this.bridge.stopSolve();
    } catch {
      // nope
    } finally {
      // nope
    }
  }
}
