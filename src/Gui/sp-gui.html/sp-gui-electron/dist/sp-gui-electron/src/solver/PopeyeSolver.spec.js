"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const PopeyeSolver_1 = require("./PopeyeSolver");
const models_1 = require("../../../sp-gui-angular/@sp/dbmanager/src/lib/models");
const path_1 = __importDefault(require("path"));
jest.setTimeout(40000);
describe("Popeye solver tests", () => {
    it("convert", (done) => __awaiter(void 0, void 0, void 0, function* () {
        const expected = [
            `BeginProblem`,
            `Pieces`,
            `White Kd1 Re2 Be1 Pc2 Sd3`,
            `Black Pg2 Rg1 Bh5 Kb6 Pb5 Pg6 Pa6 Bh6 Pc3 Sa2 Pa5 Qa3 Sc6 Rc5`,
            `Stipulation H#4`,
            `Option WhiteToPlay Try NoBoard SetPlay Variation`,
            `Twin Move d3 b2`,
            `EndProblem`,
        ].join("\n");
        const jsonProblem = (yield Promise.resolve().then(() => __importStar(require("./test1.json"))));
        const problem = models_1.Problem.fromJson(jsonProblem);
        const runner = new PopeyeSolver_1.PopeyeSolver({
            problemSolvers: {
                Popeye: {
                    enabled: true,
                    executablePath: "",
                    extraOptions: [`Try`, `NoBoard`, `SetPlay`, `Variation`],
                },
            },
        });
        const buffer = runner.problemToPopeye(problem).join("\n");
        expect(buffer).toBe(expected);
        done();
    }));
    it("resolve problem", (done) => __awaiter(void 0, void 0, void 0, function* () {
        const jsonProblem = (yield Promise.resolve().then(() => __importStar(require("./test1.json"))));
        const problem = models_1.Problem.fromJson(jsonProblem);
        const runner = new PopeyeSolver_1.PopeyeSolver({
            problemSolvers: {
                Popeye: {
                    enabled: true,
                    executablePath: path_1.default.join(path_1.default.resolve(__dirname, "..", ".."), "engines", "popeye", "pywin64.exe"),
                },
            },
        });
        const solutions = [];
        yield new Promise((resolve) => {
            runner.start(problem, (msg) => {
                solutions.push(...msg.split("\n").map(r => r.trimRight()));
            }, () => {
                expect(solutions.length).toBeGreaterThan(0);
                resolve();
            });
        });
        console.log(solutions);
        done();
    }));
});
//# sourceMappingURL=PopeyeSolver.spec.js.map