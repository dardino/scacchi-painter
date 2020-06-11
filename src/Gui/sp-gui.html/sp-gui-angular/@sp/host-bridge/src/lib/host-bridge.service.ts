import { Injectable } from "@angular/core";
import { BridgeGlobal } from "./bridge-global";
import { Observable } from "rxjs";
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
  stopSolve() {
    throw new Error("Method not implemented.");
  }
  runSolve(CurrentProblem: Problem): Observable<string> {
    throw new Error("Method not implemented.");
  }
  public async saveFile(content: File) {
    return window.Bridge?.saveFile(content);
  }
  public get supportsClose(): boolean {
    return typeof window.Bridge?.closeApp === "function";
  }
  public closeApp() {
    window.Bridge?.closeApp?.();
  }
}
