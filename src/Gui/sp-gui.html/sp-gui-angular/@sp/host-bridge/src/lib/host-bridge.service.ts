import { inject, Injectable, NgZone } from "@angular/core";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { Subject, Subscription } from "rxjs";
import { BridgeGlobal, Engines, EOF, SolutionRow, SolveModes } from "./bridge-global";

declare global {
  interface HandledFile {
    getFile(): Promise<Blob>;
    name: string;
  }
  interface FileHandlerAPIParams {
    files: HandledFile[];
  }
  interface Window {
    Bridge?: BridgeGlobal;
    launchQueue?: {
      setConsumer(callback: (params: FileHandlerAPIParams) => void): void;
    };
  }
}

@Injectable({
  providedIn: "root",
})
export class HostBridgeService {
  private solver$ = new Subject<SolutionRow>();
  private subscription: Subscription | null = null;
  private solveInProgress = new Subject<boolean>();

  get Solver$() {
    return this.solver$.asObservable();
  }

  get solveInProgress$() {
    return this.solveInProgress.asObservable();
  }

  private zone = inject(NgZone);

  getRecents(): string[] {
    return [];
  }

  stopSolve() {
    console.warn("[LOG] -> stop solve: cancel subscriptions...");
    if (window.Bridge) window.Bridge.stopSolve();
  }

  supportsEngine(engine: Engines) {
    return window.Bridge?.supportsEngine(engine);
  }

  startSolve(CurrentProblem: Problem, mode: SolveModes): Error | undefined {
    if (this.subscription != null) {
      console.warn("[WARN] -> Solver already started!");
      return new Error("Solver already started!");
    }
    const obs = window.Bridge?.runSolve(CurrentProblem, "Popeye", mode);
    if (!obs) return new Error("Engine not found!");
    if (obs instanceof Error) return obs;

    this.solveInProgress.next(true);

    this.subscription = obs.subscribe((move) => {
      this.zone.run(() => {
        // needs to run in in angular zone to update the ui
        if (!isEOF(move)) {
          this.solver$.next(move);
        } else {
          console.warn(`exited: `, move.message);
          if (typeof move.exitCode !== "number") {
            this.solver$.next({
              raw: move.message,
              rowtype: "log",
              moveTree: [],
            });
          } else {
            this.solver$.next({
              rowtype: "log",
              moveTree: [],
              raw: `Engine process exited with code: ${move.exitCode}`
            });
            this.solver$.next({
              raw: `${move.message}`,
              rowtype: "log",
              moveTree: [],
            });
            if (this.subscription) this.subscription.unsubscribe();
            this.subscription = null;
            this.solveInProgress.next(false);
          }
        }
      });
    });

    return;
  }

  public async saveFile(content: File, type: "sp2" | "sp3") {
    if (window.Bridge) {
      return window.Bridge.saveFile(content);
    } else {
      const fls = await import("file-saver");
      fls.saveAs(content, content.name + `.${type}`);
      return "OK";
    }
  }
  public get supportsClose(): boolean {
    return typeof window.Bridge?.closeApp === "function";
  }
  public get supportsSolve(): boolean {
    return typeof window.Bridge?.runSolve === "function";
  }
  public get supportsOpen(): boolean {
    return typeof window.Bridge?.openFile === "function";
  }
  public closeApp() {
    if (window.Bridge) return window.Bridge.closeApp?.();
  }
  public async openFile(): Promise<File | null> {
    if (window.Bridge) return await window.Bridge.openFile();
    return null;
  }
}

function isEOF(move: SolutionRow | EOF): move is EOF {
  return "exitCode" in move || "message" in move;
}
