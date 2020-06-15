import { Injectable } from "@angular/core";
import { BridgeGlobal, EOF } from "./bridge-global";
import { Observable, BehaviorSubject, Subject, Subscription } from "rxjs";
import { Problem } from "@sp/dbmanager/src/lib/models";

declare global {
  interface Window {
    Bridge?: BridgeGlobal;
  }
}

@Injectable({
  providedIn: "root",
})
export class HostBridgeService {
  private solver$ = new Subject<string>();
  private subscription: Subscription | null = null;
  get Solver$() {
    return this.solver$.asObservable();
  }

  stopSolve() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    return window.Bridge?.stopSolve();
  }
  runSolve(CurrentProblem: Problem): Error | undefined {
    if (this.subscription) return new Error("Solver already started!");
    const obs = window.Bridge?.runSolve(CurrentProblem, "Popeye");
    if (!obs) return new Error("Engine not found!");
    if (obs instanceof Error) return obs;
    this.subscription = obs.subscribe((text) => {
      if (typeof text === "string") {
        this.solver$.next(text);
      } else {
        if (text.exitCode === 0) {
          this.solver$.next(text.message);
        } else {
          this.solver$.next(
            `Engine process exited with code: ${text.exitCode}`
          );
          this.solver$.next(`${text.message}`);
          if (this.subscription) this.subscription.unsubscribe();
          this.subscription = null;
        }
      }
    });

    return;
  }
  public async saveFile(content: File) {
    return window.Bridge?.saveFile(content);
  }
  public get supportsClose(): boolean {
    return typeof window.Bridge?.closeApp === "function";
  }
  public closeApp() {
    if (window.Bridge) return window.Bridge.closeApp?.();
  }
}
