"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stipulation = void 0;
const helpers_1 = require("../helpers");
class Stipulation {
    constructor() {
        this.problemType = "-";
        this.stipulationType = "#";
        this.maximum = false;
        this.serie = false;
        this.moves = 2;
        this.completeStipulationDesc = "#2";
        this.colorStarter = "White";
    }
    static fromElement(source) {
        var _a, _b;
        const p = new Stipulation();
        p.problemType = helpers_1.getProblemType(source.getAttribute("ProblemType"));
        p.moves = parseFloat((_a = source.getAttribute("Moves")) !== null && _a !== void 0 ? _a : "2");
        p.maximum = source.getAttribute("Maximum") === "true";
        p.serie = source.getAttribute("Serie") === "true";
        p.stipulationType = helpers_1.getEndingType(source.getAttribute("Stipulation"));
        p.completeStipulationDesc =
            (_b = source.getAttribute("CompleteStipulationDesc")) !== null && _b !== void 0 ? _b : "#2";
        return p;
    }
    static fromJson(stipulation) {
        var _a, _b, _c, _d, _e, _f;
        const p = new Stipulation();
        if (!stipulation)
            return p;
        p.problemType = (_a = stipulation.problemType) !== null && _a !== void 0 ? _a : "-";
        p.stipulationType = (_b = stipulation.stipulationType) !== null && _b !== void 0 ? _b : "#";
        p.maximum = (_c = stipulation.maximum) !== null && _c !== void 0 ? _c : false;
        p.serie = (_d = stipulation.serie) !== null && _d !== void 0 ? _d : false;
        p.moves = (_e = stipulation.moves) !== null && _e !== void 0 ? _e : 2;
        p.completeStipulationDesc = (_f = stipulation.completeStipulationDesc) !== null && _f !== void 0 ? _f : "#2";
        return p;
    }
    toJson() {
        const json = {};
        if (this.problemType !== "-")
            json.problemType = this.problemType;
        if (this.stipulationType !== "#") {
            json.stipulationType = this.stipulationType;
        }
        if (this.maximum === true)
            json.maximum = this.maximum;
        if (this.serie === true)
            json.serie = this.serie;
        if (this.moves !== 2)
            json.moves = this.moves;
        if (this.completeStipulationDesc !== "#2") {
            json.completeStipulationDesc = this.completeStipulationDesc;
        }
        return json;
    }
    getXMLEndingType() {
        switch (this.stipulationType) {
            case "#": return "Mate";
            case "=": return "Stalemate";
            default: return "Custom";
        }
    }
    getXMLProblemType() {
        switch (this.problemType) {
            case "-": return "Direct";
            case "H": return "Help";
            case "S": return "Self";
            case "HS": return "HelpSelf";
            case "R": return "Custom";
            case "HR": return "Custom";
            default: return "Direct";
        }
    }
}
exports.Stipulation = Stipulation;
//# sourceMappingURL=stipulation.js.map