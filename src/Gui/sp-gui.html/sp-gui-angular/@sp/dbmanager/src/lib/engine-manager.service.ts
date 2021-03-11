import { Injectable } from "@angular/core";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { BehaviorSubject } from "rxjs";
import { Problem } from "./models";

@Injectable({
  providedIn: "root",
})
export class EngineManagerService {
  solution$: BehaviorSubject<string> = new BehaviorSubject("");
  isSolving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  supportsSolve = true;

  constructor(private bridge: HostBridgeService) {
    this.bridge.Solver$.subscribe(msg => {
      this.solution$.next(msg);
    });
    this.bridge.solveInProgress$.subscribe(v => this.isSolving$.next(v));
  }

  public startSolving(problem: Problem): void {
    if (!problem) {
      throw new Error("unable to solve a null problem!");
    }
    if (this.bridge.supportsEngine(problem.engine)) {
      this.bridge.startSolve(problem);
      return;
    }
    throw new Error(`Engine ${problem.engine} not supported.`);
  }

  public stopSolving(): void {
    try {
      this.bridge.stopSolve();
    } catch {
    } finally {
    }
  }

}
