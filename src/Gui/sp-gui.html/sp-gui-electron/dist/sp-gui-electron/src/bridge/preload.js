"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// in preload scripts, we have access to node.js and electron APIs
// the remote web app will not have access, so this is safe
const electron_1 = require("electron");
const Bridge_1 = require("./Bridge");
const PopeyeSolver_1 = require("../solver/PopeyeSolver");
const fs_1 = __importDefault(require("fs"));
init();
function init() {
    const cfg = {
        problemSolvers: {
            Popeye: {
                enabled: true,
                executablePath: `D:\\dev\\scacchi-painter\\src\\Gui\\sp-gui.html\\sp-gui-electron\\engines\\popeye_\\pywin64.exe`,
                extraOptions: [`Try`, `NoBoard`, `SetPlay`, `Variation`],
            },
        },
    };
    const closeApp = () => electron_1.remote.getCurrentWindow().close();
    const openFile = () => __awaiter(this, void 0, void 0, function* () {
        const data = yield electron_1.remote.dialog.showOpenDialog({
            filters: [{ name: "Scacchi Painter", extensions: ["sp2", "sp3"] }],
            message: "Select your problems database file",
            properties: ["openFile"],
            title: "Open Database file",
        });
        if (data.canceled || data.filePaths.length !== 1)
            return null;
        const buffer = fs_1.default.readFileSync(data.filePaths[0]);
        const file = new File([buffer], data.filePaths[0]);
        return file;
    });
    // Expose a bridging API to by setting an global on `window`.
    // We'll add methods to it here first, and when the remote web app loads,
    // it'll add some additional methods as well.
    //
    // !CAREFUL! do not expose any functionality or APIs that could compromise the
    // user's computer. E.g. don't directly expose core Electron (even IPC) or node.js modules.
    window.Bridge = new Bridge_1.Bridge(closeApp, [new PopeyeSolver_1.PopeyeSolver(cfg)], openFile);
    // we get this message from the main process
    electron_1.ipcRenderer.on("markAllComplete", () => {
        // the todo app defines this function
        // window.Bridge.markAllComplete();
    });
}
//# sourceMappingURL=preload.js.map