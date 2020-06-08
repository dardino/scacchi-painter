import { BridgeGlobal } from "../sp-gui-angular/@sp/host-bridge/src/lib/bridge-global";

export class Bridge implements BridgeGlobal {
  constructor(public closeApp: () => void) {}
  saveFile(content: File): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
