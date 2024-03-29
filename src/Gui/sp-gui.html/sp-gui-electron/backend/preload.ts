// in preload scripts, we have access to node.js and electron APIs
// the remote web app will not have access, so this is safe
import { ipcRenderer as ipc, remote } from "electron";
import { Bridge } from "./bridge/Bridge";
import { PopeyeSolver } from "./solver/PopeyeSolver";
import { IApplicationConfig } from "./settings/IApplicationConfig";
import fs from "fs";

init();
declare global {
  interface Window {
    Bridge: Bridge;
  }
}
function init() {

  const cfg: IApplicationConfig = {
    problemSolvers: {
      Popeye: {
        enabled: true,
        executablePath:
          `D:\\dev\\scacchi-painter\\src\\Gui\\sp-gui.html\\sp-gui-electron\\engines\\popeye_\\pywin64.exe`,
        extraOptions: [`Try`, `NoBoard`, `SetPlay`, `Variation`],
      },
    },
  };

  const closeApp = () => remote.getCurrentWindow().close();

  const openFile = async () => {
    const data = await remote.dialog.showOpenDialog({
      filters: [{ name: "Scacchi Painter", extensions: ["sp2", "sp3"] }],
      message: "Select your problems database file",
      properties: ["openFile"],
      title: "Open Database file",
    });
    if (data.canceled || data.filePaths.length !== 1) return null;
    const buffer = fs.readFileSync(data.filePaths[0]);
    const file = new File([buffer], data.filePaths[0]);
    return file;
  };

  // Expose a bridging API to by setting an global on `window`.
  // We'll add methods to it here first, and when the remote web app loads,
  // it'll add some additional methods as well.
  //
  // !CAREFUL! do not expose any functionality or APIs that could compromise the
  // user's computer. E.g. don't directly expose core Electron (even IPC) or node.js modules.
  window.Bridge = new Bridge(
    closeApp,
    [new PopeyeSolver(cfg)],
    openFile
  );

  // we get this message from the main process
  ipc.on("markAllComplete", () => {
    // the todo app defines this function
    // window.Bridge.markAllComplete();
  });
}
