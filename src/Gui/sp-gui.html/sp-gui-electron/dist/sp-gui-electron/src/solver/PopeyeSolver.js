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
exports.PopeyeSolver = void 0;
const helpers_1 = require("../../../sp-gui-angular/@sp/dbmanager/src/lib/helpers");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const txtName = `problem.txt`;
function pieceSortByName(a, b) {
    const na = a.ToNotation();
    const nb = b.ToNotation();
    return na < nb ? -1 : na > nb ? 1 : 0;
}
function toPopeyePiece(a) {
    var _a, _b;
    return [
        ((_b = ((_a = a.fairyCode[0]) !== null && _a !== void 0 ? _a : {}).code) === null || _b === void 0 ? void 0 : _b.toUpperCase()) ||
            a.appearance.toUpperCase().replace("N", "S"),
        a.column[3].toLowerCase(),
        a.traverse[3],
    ].join("");
}
class PopeyeSolver {
    constructor(cfg) {
        this.cfg = cfg;
        this.childProcess = null;
        this.key = "Popeye";
        this.txtFileName = "";
    }
    get running() {
        return false;
    }
    stop() {
        console.log("[POPEYE SOLVER] -> try to kill process...");
        if (this.childProcess && !this.childProcess.killed)
            this.childProcess.kill();
        this.childProcess = null;
    }
    start(problem, cbOut, done) {
        if (this.childProcess)
            this.childProcess.kill();
        this.writeTempFile(problem)
            .then((textContent) => __awaiter(this, void 0, void 0, function* () {
            cbOut(textContent.join("\r"));
            this.childProcess = yield this.runProcess();
            if (!this.childProcess) {
                done({
                    exitCode: -1,
                    message: "Process disconnected!",
                });
                return;
            }
            this.childProcess.on("error", (err) => {
                console.error(err);
                cbOut(err.message);
                this.stop();
            });
            this.childProcess.on("exit", (code, signal) => {
                console.log("exit", code, signal);
                this.deleteFile();
            });
            if (this.childProcess.stdout)
                this.childProcess.stdout.on("data", (data) => {
                    console.log(data);
                    cbOut(data.toString("utf8"));
                });
            if (this.childProcess.stderr)
                this.childProcess.stderr.on("data", (data) => {
                    console.log(data);
                    cbOut(`ERR: ${data.toString("utf8")}`);
                });
            this.childProcess.on("close", (code) => {
                this.childProcess = null;
                done({
                    exitCode: code,
                    message: `program exited with code: ${code}`,
                });
            });
        }))
            .catch((err) => {
            done({
                exitCode: -1,
                message: err.message,
            });
        });
    }
    deleteFile() {
        try {
            fs_1.default.unlinkSync(this.txtFileName);
        }
        catch (err) {
            console.log(err);
        }
    }
    writeTempFile(problem) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.problemToPopeye(problem);
            this.txtFileName = path_1.default.join(os_1.default.tmpdir(), txtName);
            if (fs_1.default.existsSync(this.txtFileName))
                this.deleteFile();
            fs_1.default.writeFileSync(this.txtFileName, content.join("\n"));
            return content;
        });
    }
    runProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            const p = child_process_1.spawn(this.cfg.problemSolvers.Popeye.executablePath, [txtName], {
                cwd: os_1.default.tmpdir(),
                detached: false,
                serialization: "json",
                stdio: ["pipe"]
            });
            return p;
        });
    }
    problemToPopeye(problem) {
        var _a;
        const rows = [];
        const extraOptions = [];
        // BeginProblem
        rows.push("BeginProblem");
        // Condition
        if (problem.conditions.filter((f) => f != "").length > 0)
            rows.push(`Condition ${problem.conditions.join(" ")}`);
        // Pieces
        rows.push("Pieces");
        ["White", "Black", "Neutral"].forEach((color) => {
            const withAttr = problem.pieces
                .filter((c) => c.color === color)
                .sort(pieceSortByName)
                .map(toPopeyePiece);
            if (withAttr.length > 0)
                rows.push(`${color} ${withAttr.join(" ")}`);
        });
        // Stipulation
        let dmoves = Math.floor(problem.stipulation.moves);
        if (dmoves !== problem.stipulation.moves) {
            extraOptions.push("WhiteToPlay");
            dmoves++;
        }
        rows.push(`Stipulation ${problem.stipulation.completeStipulationDesc}${dmoves}`);
        // Options
        extraOptions.push(...((_a = this.cfg.problemSolvers.Popeye.extraOptions) !== null && _a !== void 0 ? _a : [
            "NoBoard",
            "Try",
            "Set",
            "Variation",
        ]));
        rows.push(`Option ${extraOptions.join(" ")}`);
        // Twins
        problem.twins.TwinList.forEach((t) => {
            if (t.TwinType === helpers_1.TwinTypes.Diagram)
                return;
            rows.push(`Twin ${t.TwinModes === helpers_1.TwinModes.Combined ? "Cont " : ""}${twinmapper[t.TwinType](t.ValueA, t.ValueB, t.ValueC)}`);
        });
        rows.push(`EndProblem`);
        console.log(rows);
        return rows;
    }
}
exports.PopeyeSolver = PopeyeSolver;
const twinmapper = {
    [helpers_1.TwinTypes.Custom]: (...args) => args.join(" ").trim(),
    [helpers_1.TwinTypes.Diagram]: () => `Diagram`,
    [helpers_1.TwinTypes.MovePiece]: (...args) => `Move ${args.join(" ")}`.trim(),
    [helpers_1.TwinTypes.RemovePiece]: (...args) => `Remove ${args[0]}`.trim(),
    [helpers_1.TwinTypes.AddPiece]: (...args) => `Add ${args.join(" ")}`.trim(),
    [helpers_1.TwinTypes.Substitute]: (...args) => `Substitute ${args[0]} ==> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.SwapPieces]: (...args) => `Exchange ${args[0]} <-> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.Rotation90]: () => `Rotate 90`,
    [helpers_1.TwinTypes.Rotation180]: () => `Rotate 180`,
    [helpers_1.TwinTypes.Rotation270]: () => `Rotate 270`,
    [helpers_1.TwinTypes.TraslateNormal]: (...args) => `Shift: ${args[0]} -> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.TraslateToroidal]: (...args) => `Shift: ${args[0]} -> ${args[1]}`.trim(),
    [helpers_1.TwinTypes.MirrorHorizontal]: () => `Mirror a1<-->a8`,
    [helpers_1.TwinTypes.MirrorVertical]: () => `Mirror a1<-->h1`,
    [helpers_1.TwinTypes.Stipulation]: (...args) => `Stipulation > ${args.join(" ")}`.trim(),
    [helpers_1.TwinTypes.ChangeProblemType]: (...args) => `Stipulation > ${args.join(" ")}`.trim(),
    [helpers_1.TwinTypes.Duplex]: () => `Duplex`,
    [helpers_1.TwinTypes.AfterKey]: () => `After Key`,
    [helpers_1.TwinTypes.SwapColors]: () => `PolishType`,
};
//# sourceMappingURL=PopeyeSolver.js.map