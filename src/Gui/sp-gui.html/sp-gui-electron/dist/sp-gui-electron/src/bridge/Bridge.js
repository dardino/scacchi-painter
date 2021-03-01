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
exports.Bridge = void 0;
const rxjs_1 = require("rxjs");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class Bridge {
    constructor(closeApp, solvers, open) {
        this.closeApp = closeApp;
        this.solvers = solvers;
        this.open = open;
        this.solver$ = new rxjs_1.BehaviorSubject("");
        this.interval = null;
    }
    runSolve(problem, engine) {
        const solver = this.solvers.find((f) => f.key === engine);
        if (!solver) {
            return new Error(`engine <${engine}> not supported, available values are: ${this.solvers
                .map((f) => f.key)
                .join("; ")}!`);
        }
        else {
            this.solver$ = new rxjs_1.BehaviorSubject(`starting engine <${engine}>`);
            solver.start(problem, (msg) => {
                this.solver$.next(msg);
            }, (eof) => {
                this.solver$.next(eof);
                this.solver$.unsubscribe();
            });
            return this.solver$.asObservable();
        }
    }
    stopSolve() {
        if (this.interval)
            clearInterval(this.interval);
        this.solvers.forEach((s) => s.stop());
        this.solver$.next({ exitCode: 2, message: "solution stopped!" });
        setTimeout(() => this.solver$.unsubscribe(), 500);
    }
    saveFile(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const f2s = path_1.default.join(content.path, content.name);
            if (fs_1.default.existsSync(f2s))
                fs_1.default.unlinkSync(f2s);
            fs_1.default.writeFileSync(f2s, yield content.text());
            return "OK";
        });
    }
    openFile() {
        return this.open();
    }
}
exports.Bridge = Bridge;
//# sourceMappingURL=Bridge.js.map