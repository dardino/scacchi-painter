import { ApplicationRef, inject, Injectable } from "@angular/core";
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

  private appRef = inject(ApplicationRef);

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

  availableEngines(): Engines[] {
    if (!window.Bridge) {
      return ["Popeye"];
    }
    return window.Bridge.availableEngines();
  }

  startSolve(CurrentProblem: Problem, engine: Engines, mode: SolveModes): Error | undefined {
    if (this.subscription?.closed) {
      this.subscription = null;
      this.solveInProgress.next(false);
    }

    if (this.subscription != null) {
      console.warn("[WARN] -> Solver already started!");
      return new Error("Solver already started!");
    }
    const obs = window.Bridge?.runSolve(CurrentProblem, engine, mode);
    if (!obs) return new Error("Engine not found!");
    if (obs instanceof Error) return obs;

    this.solveInProgress.next(true);

    let terminalEventBeforeAssignment = false;

    const subscription = obs.subscribe({
      next: (move) => {
        // Trigger change detection in zoneless mode
        if (!isEOF(move)) {
          this.solver$.next(move);
          this.appRef.tick();
          return;
        }

        console.warn("exited: ", move.message);
        this.solver$.next({
          rowtype: "log",
          moveTree: [],
          raw: `Engine process exited with code: ${move.exitCode}`,
        });
        this.solver$.next({
          raw: `${move.message}`,
          rowtype: "log",
          moveTree: [],
        });
        if (this.subscription == null) {
          terminalEventBeforeAssignment = true;
        }
        else {
          this.finalizeSolve();
        }
        this.appRef.tick();
      },
      error: (error) => {
        this.solver$.next({
          rowtype: "log",
          moveTree: [],
          raw: `Engine stream error: ${String(error)}`,
        });
        if (this.subscription == null) {
          terminalEventBeforeAssignment = true;
        }
        else {
          this.finalizeSolve();
        }
        this.appRef.tick();
      },
      complete: () => {
        if (this.subscription == null) {
          terminalEventBeforeAssignment = true;
        }
        else {
          this.finalizeSolve();
        }
        this.appRef.tick();
      },
    });

    this.subscription = subscription;

    if (terminalEventBeforeAssignment) {
      this.finalizeSolve();
    }

    return;
  }

  public async saveFile(content: File, type: "sp2" | "sp3") {
    if (window.Bridge) {
      return window.Bridge.saveFile(content);
    }
    else {
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

  private finalizeSolve() {
    const activeSubscription = this.subscription;
    this.subscription = null;
    if (activeSubscription && !activeSubscription.closed) {
      activeSubscription.unsubscribe();
    }
    this.solveInProgress.next(false);
  }
}

function isEOF(move: SolutionRow | EOF): move is EOF {
  return "exitCode" in move || "message" in move;
}
