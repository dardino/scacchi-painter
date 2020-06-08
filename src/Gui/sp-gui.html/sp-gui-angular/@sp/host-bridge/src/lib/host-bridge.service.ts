import { Injectable } from "@angular/core";
import { BridgeGlobal } from "./bridge-global";

declare global {
  interface Window {
    Bridge?: BridgeGlobal;
  }
}

@Injectable({
  providedIn: "root",
})
export class HostBridgeService {
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
