import { Injectable, NgZone } from "@angular/core";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { Subject, Subscription } from "rxjs";
import { BridgeGlobal, SolveModes } from "./bridge-global";

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
  private solver$ = new Subject<string>();
  private subscription: Subscription | null = null;
  private solveInProgress = new Subject<boolean>();

  get Solver$() {
    return this.solver$.asObservable();
  }

  get solveInProgress$() {
    return this.solveInProgress.asObservable();
  }

  constructor(private zone: NgZone) {}

  getRecents(): string[] {
    return [];
  }

  stopSolve() {
    console.log("[LOG] -> stop solve: cancel subscriptions...");
    if (window.Bridge) window.Bridge.stopSolve();
  }

  supportsEngine(engine: string) {
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

    this.subscription = obs.subscribe((text) => {
      this.zone.run(() => {
        // needs to run in in angular zone to update the ui
        if (typeof text === "string") {
          console.log(text);
          this.solver$.next(text);
        } else {
          console.log(`exited: `, text);
          if (typeof text.exitCode !== "number") {
            this.solver$.next(text.message);
          } else {
            this.solver$.next(
              `Engine process exited with code: ${text.exitCode}`
            );
            this.solver$.next(`${text.message}`);
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
