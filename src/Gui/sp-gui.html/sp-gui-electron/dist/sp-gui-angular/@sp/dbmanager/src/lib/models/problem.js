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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Problem = void 0;
const piece_1 = require("./piece");
const helpers_1 = require("../helpers");
const twins_1 = require("./twins");
const stipulation_1 = require("./stipulation");
const author_1 = require("./author");
const SP2_1 = require("../SP2");
const base64_1 = require("../base64");
// tslint:disable-next-line: variable-name
const main_snapshot = "$_MAIN_$";
class Problem {
    constructor() {
        this.rtfSolution = "";
        this.textSolution = "";
        this.date = new Date().toLocaleString();
        this.stipulation = stipulation_1.Stipulation.fromJson({});
        this.prizeRank = 0;
        this.personalID = "";
        this.prizeDescription = "";
        this.source = "";
        this.authors = [];
        this.pieces = [];
        this.twins = twins_1.Twins.fromJson({});
        this.htmlSolution = "";
        this.htmlElements = [];
        this.conditions = [];
        this.fairyCells = [];
        this.snapshots = {};
        this.currentSnapshotId = main_snapshot;
    }
    get snap_keys() {
        return Object.keys(this.snapshots).filter((f) => this.snapshots[f] != null);
    }
    static fromElement(source) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            const p = new Problem();
            p.stipulation = stipulation_1.Stipulation.fromElement(source);
            p.pieces = Array.from(source.querySelectorAll("Piece")).map(piece_1.Piece.fromSP2Xml);
            p.twins = twins_1.Twins.fromElement((_a = source.querySelector("Twins")) !== null && _a !== void 0 ? _a : null);
            const sol = yield helpers_1.GetSolutionFromElement(source);
            p.textSolution = (_b = sol.plain) !== null && _b !== void 0 ? _b : "";
            p.rtfSolution = (_c = sol.rtf) !== null && _c !== void 0 ? _c : "";
            p.htmlElements = sol.html;
            p.htmlSolution = p.htmlElements.map((f) => f.outerHTML).join("");
            p.date = (_d = source.getAttribute("Date")) !== null && _d !== void 0 ? _d : "";
            p.prizeRank = parseInt((_e = source.getAttribute("PrizeRank")) !== null && _e !== void 0 ? _e : "0", 10);
            p.personalID = (_f = source.getAttribute("PersonalID")) !== null && _f !== void 0 ? _f : "";
            p.prizeDescription = (_g = source.getAttribute("PrizeDescription")) !== null && _g !== void 0 ? _g : "";
            p.source = (_h = source.getAttribute("Source")) !== null && _h !== void 0 ? _h : "";
            p.authors = Array.from(source.querySelectorAll("Author")).map((a) => author_1.Author.fromElement(a));
            p.conditions = Array.from((_j = source.querySelectorAll("Conditions")) !== null && _j !== void 0 ? _j : []).map((el) => { var _a; return (_a = el.nodeValue) !== null && _a !== void 0 ? _a : ""; }).filter(helpers_1.notEmpty);
            p.fairyCells = [];
            p.snapshots = {};
            p.saveSnapshot(main_snapshot);
            return p;
        });
    }
    static fromJson(jsonObj) {
        const p = new Problem();
        Problem.applyJson(jsonObj, p);
        p.snapshots = Object.assign({}, jsonObj.snapshots);
        if (Object.keys(p.snapshots).length === 0)
            p.saveSnapshot(main_snapshot);
        return p;
    }
    static fromFen(original) {
        const extractInfo = helpers_1.fenToChessBoard(original);
        const p = new Problem();
        p.pieces = extractInfo
            .map((el, sqi) => piece_1.Piece.fromPartial(el, helpers_1.GetLocationFromIndex(sqi)))
            .filter(helpers_1.notNull);
        p.saveSnapshot(main_snapshot);
        return p;
    }
    static applyJson(a, b) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        b.authors =
            ((_b = (_a = a.authors) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0)
                ? ((_c = b.authors) !== null && _c !== void 0 ? _c : []).map((p) => author_1.Author.fromJson(p))
                : [];
        b.pieces =
            ((_e = (_d = a.pieces) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0)
                ? ((_f = a.pieces) !== null && _f !== void 0 ? _f : []).map((p) => piece_1.Piece.fromJson(p))
                : [];
        b.stipulation =
            a.stipulation != null
                ? stipulation_1.Stipulation.fromJson((_g = a.stipulation) !== null && _g !== void 0 ? _g : {})
                : stipulation_1.Stipulation.fromJson({});
        b.twins = a.twins ? twins_1.Twins.fromJson(a.twins) : twins_1.Twins.fromJson({});
        b.htmlSolution = a.htmlSolution ? a.htmlSolution : "";
        b.date = a.date ? a.date : new Date().toISOString();
        b.personalID = a.personalID ? a.personalID : "";
        b.prizeRank = (_h = a.prizeRank) !== null && _h !== void 0 ? _h : 0;
        b.prizeDescription = a.prizeDescription ? a.prizeDescription : "";
        b.source = a.source ? a.source : "";
        b.conditions = (a.conditions ? [...a.conditions] : []).filter(helpers_1.notEmpty);
    }
    toJson() {
        const json = {};
        if (this.authors.length > 0) {
            json.authors = this.authors.map((a) => a.toJson());
        }
        if (this.pieces.length > 0) {
            json.pieces = this.pieces.map((p) => p.toJson());
        }
        if (this.stipulation != null)
            json.stipulation = this.stipulation.toJson();
        if (this.twins)
            json.twins = this.twins.toJson();
        if (this.htmlSolution)
            json.htmlSolution = this.htmlSolution;
        if (this.date)
            json.date = this.date;
        if (this.personalID)
            json.personalID = this.personalID;
        if (this.prizeRank)
            json.prizeRank = this.prizeRank;
        if (this.prizeDescription)
            json.prizeDescription = this.prizeDescription;
        if (this.source)
            json.source = this.source;
        if (this.conditions)
            json.conditions = this.conditions;
        if (this.snap_keys.length > 0) {
            json.snapshots = this.snap_keys.reduce((a, k) => (Object.assign(Object.assign({}, a), { [k]: this.snapshots[k] })), {});
        }
        return json;
    }
    clone() {
        return Problem.fromJson(this.toJson());
    }
    toSP2Xml() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const item = helpers_1.createXmlElement("SP_Item");
            SP2_1.SP2.setProblemType(item, this.stipulation.getXMLProblemType());
            SP2_1.SP2.setMoves(item, this.stipulation.moves);
            SP2_1.SP2.setDate(item, this.date);
            SP2_1.SP2.setPersonalID(item, this.personalID);
            SP2_1.SP2.setStipulation(item, this.stipulation.getXMLEndingType());
            SP2_1.SP2.setSerie(item, this.stipulation.serie);
            SP2_1.SP2.setMaximum(item, this.stipulation.maximum);
            SP2_1.SP2.setSource(item, this.source);
            SP2_1.SP2.setPrizeRank(item, this.prizeRank);
            SP2_1.SP2.setPrizeDescription(item, this.prizeDescription);
            SP2_1.SP2.setCompleteStipulationDesc(item, this.stipulation.completeStipulationDesc);
            SP2_1.SP2.setAuthors(item, this.authors.map((a) => a.toSP2Xml()));
            SP2_1.SP2.setPieces(item, this.pieces.map((p) => p.toSP2Xml()));
            SP2_1.SP2.setTwins(item, this.twins.toSP2Xml());
            SP2_1.SP2.setConditions(item, this.conditions);
            SP2_1.SP2.setSolution(item, this.textSolution);
            // SP2.setHtmlSolution(item, this.htmlSolution);
            SP2_1.SP2.setRtfSolution(item, (_a = (yield helpers_1.convertToRtf(this.htmlSolution))) !== null && _a !== void 0 ? _a : "");
            return item;
        });
    }
    saveSnapshot(snapshotId) {
        const _a = this.toJson(), { snapshots } = _a, prob = __rest(_a, ["snapshots"]);
        const snap = base64_1.Base64.encode(JSON.stringify(prob));
        if (snapshotId == null) {
            const newKey = this.getNextId(this.currentSnapshotId);
            this.snapshots[newKey] = snap;
            this.currentSnapshotId = newKey;
        }
        else {
            this.snapshots[snapshotId] = snap;
            this.currentSnapshotId = snapshotId;
        }
    }
    saveAsMainSnapshot() {
        this.saveSnapshot(main_snapshot);
    }
    getNextId(currentSnapshotId) {
        if (currentSnapshotId === main_snapshot) {
            currentSnapshotId = -1;
        }
        if (typeof currentSnapshotId === "number") {
            return (Math.max(currentSnapshotId, 0, ...this.snap_keys.filter(filterNumber)) +
                1);
        }
        else {
            return currentSnapshotId + "*";
        }
    }
    deleteSnapshot(id) {
        if (!this.snapshots[id]) {
            throw new Error("Snapshot not found!");
        }
        delete this.snapshots[id];
    }
    loadSnapshot(id, ignoreChanges = false) {
        if (id == null)
            id = this.currentSnapshotId;
        if (!ignoreChanges)
            this.saveSnapshot();
        const prob = JSON.parse(base64_1.Base64.decode(this.snapshots[id]));
        Problem.applyJson(prob, this);
        this.currentSnapshotId = id;
    }
    loadMainSnapshot(ignoreChanges = false) {
        this.loadSnapshot(main_snapshot, ignoreChanges);
    }
    getPieceCounter() {
        return `(${this.whitePieces}+${this.blackPieces}${this.neutralPieces ? "+" + this.neutralPieces : ""})`;
    }
    get whitePieces() {
        var _a, _b;
        return (_b = (_a = this.pieces) === null || _a === void 0 ? void 0 : _a.filter((f) => f.color === "White").length) !== null && _b !== void 0 ? _b : 0;
    }
    get blackPieces() {
        var _a, _b;
        return (_b = (_a = this.pieces) === null || _a === void 0 ? void 0 : _a.filter((f) => f.color === "Black").length) !== null && _b !== void 0 ? _b : 0;
    }
    get neutralPieces() {
        var _a, _b;
        return (_b = (_a = this.pieces) === null || _a === void 0 ? void 0 : _a.filter((f) => f.color === "Neutral").length) !== null && _b !== void 0 ? _b : 0;
    }
    getCurrentFen() {
        const rows = [];
        for (let r = 7; r >= 0; r--) {
            let empty = 0;
            let row = "";
            for (let c = 0; c <= 7; c++) {
                const p = this.getPieceAt(r, c);
                if (p) {
                    if (empty > 0)
                        row += empty.toString();
                    row += p.ToNotation();
                    empty = 0;
                }
                else {
                    empty++;
                }
            }
            if (empty > 0) {
                row += empty.toString();
            }
            rows.push(row);
        }
        return rows.join("/") + this.getFairiesFen();
    }
    getFairiesFen() {
        const fps = this.pieces.filter((p) => p.isFairy());
        if (fps.length === 0)
            return ``;
        return ` [${fps.map((p) => p.ToFairyNotation()).join(",")}]`;
    }
    getPieceAt(row, col) {
        var _a;
        const p = (_a = this.pieces) === null || _a === void 0 ? void 0 : _a.find((f) => helpers_1.Columns.indexOf(f.column) === col &&
            helpers_1.Traverse.indexOf(f.traverse) === 8 - row - 1);
        return p;
    }
    GetPieceAt(column, traverse) {
        var _a;
        const p = (_a = this.pieces) === null || _a === void 0 ? void 0 : _a.find((f) => f.column === column && f.traverse === traverse);
        return p;
    }
    setCellFairyAttribute(location, attribute) {
        this.fairyCells[helpers_1.GetSquareIndex(location)] = attribute;
    }
}
exports.Problem = Problem;
function filterNumber(v) {
    return typeof v === "number";
}
//# sourceMappingURL=problem.js.map