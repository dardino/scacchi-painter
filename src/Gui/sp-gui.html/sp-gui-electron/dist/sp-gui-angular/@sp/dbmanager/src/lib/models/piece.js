"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Piece = void 0;
const helpers_1 = require("../helpers");
const SP2_1 = require("../SP2");
class Piece {
    constructor() {
        this.appearance = "";
        this.fairyCode = [];
        this.color = "White";
        this.column = "ColA";
        this.traverse = "Row1";
        this.rotation = "NoRotation";
        this.fairyAttribute = "";
    }
    static fromSP2Xml(source) {
        var _a, _b;
        const p = new Piece();
        p.appearance = SP2_1.SP2.getAppearance(source);
        p.color = SP2_1.SP2.getColor(source);
        p.column = (_a = SP2_1.SP2.getColum(source)) !== null && _a !== void 0 ? _a : helpers_1.Columns[0];
        p.fairyAttribute = SP2_1.SP2.getFairyAttribute(source);
        p.fairyCode = SP2_1.SP2.getFairyCodes(source);
        p.rotation = SP2_1.SP2.getRotation(source);
        p.traverse = (_b = SP2_1.SP2.getTraverse(source)) !== null && _b !== void 0 ? _b : helpers_1.Traverse[0];
        return p;
    }
    static fromJson(fromJson) {
        var _a, _b, _c, _d, _e, _f, _g;
        const p = new Piece();
        p.appearance = (_a = fromJson.appearance) !== null && _a !== void 0 ? _a : "";
        p.color = (_b = fromJson.color) !== null && _b !== void 0 ? _b : "White";
        p.column = (_c = fromJson.column) !== null && _c !== void 0 ? _c : "ColA";
        p.fairyAttribute = (_d = fromJson.fairyAttribute) !== null && _d !== void 0 ? _d : "";
        p.fairyCode = (_e = fromJson.fairyCode) !== null && _e !== void 0 ? _e : [];
        p.rotation = (_f = fromJson.rotation) !== null && _f !== void 0 ? _f : "NoRotation";
        p.traverse = (_g = fromJson.traverse) !== null && _g !== void 0 ? _g : "Row1";
        return p;
    }
    static fromPartial(data, l) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (data == null)
            return null;
        const p = new Piece();
        p.appearance = (_a = data.appearance) !== null && _a !== void 0 ? _a : "";
        p.color = (_b = data.color) !== null && _b !== void 0 ? _b : "White";
        p.column = (_d = (_c = data.column) !== null && _c !== void 0 ? _c : l === null || l === void 0 ? void 0 : l.column) !== null && _d !== void 0 ? _d : "ColA";
        p.fairyAttribute = (_e = data.fairyAttribute) !== null && _e !== void 0 ? _e : "";
        p.fairyCode = (_f = data.fairyCode) !== null && _f !== void 0 ? _f : [];
        p.rotation = (_g = data.rotation) !== null && _g !== void 0 ? _g : "NoRotation";
        p.traverse = (_j = (_h = data.traverse) !== null && _h !== void 0 ? _h : l === null || l === void 0 ? void 0 : l.traverse) !== null && _j !== void 0 ? _j : "Row1";
        return p;
    }
    toSP2Xml() {
        const p = helpers_1.createXmlElement("Piece");
        SP2_1.SP2.setAppearance(p, this.appearance);
        SP2_1.SP2.setColor(p, this.color);
        SP2_1.SP2.setColum(p, this.column);
        SP2_1.SP2.setTraverse(p, this.traverse);
        SP2_1.SP2.setRotation(p, this.rotation);
        SP2_1.SP2.setFairyAttribute(p, this.fairyAttribute);
        SP2_1.SP2.setFairyCode(p, this.fairyCode);
        return p;
    }
    ConvertToCanvasPiece() {
        return {
            figurine: helpers_1.getFigurine(this.appearance),
            color: helpers_1.getCanvasColor(this.color),
            loc: helpers_1.getCanvasLocation(this.column, this.traverse),
            rot: helpers_1.getCanvasRotation(this.rotation),
        };
    }
    SetLocation(newCol = this.column, newRow = this.traverse) {
        this.column = newCol;
        this.traverse = newRow;
    }
    GetLocation() {
        return {
            column: this.column,
            traverse: this.traverse,
        };
    }
    ToNotation() {
        const parts = [];
        parts.push(this.color === "White"
            ? this.appearance.toUpperCase()
            : this.color === "Black"
                ? this.appearance.toLowerCase()
                : "*" + this.appearance.toUpperCase());
        if (this.rotation !== "NoRotation") {
            parts.push(helpers_1.getRotationSymbol(this.rotation));
        }
        return parts.join("");
    }
    ToFairyNotation() {
        if (!this.isFairy())
            return "";
        return `${this.fairyCode
            .map((c) => c.code)
            .join("/")}${this.column[3].toLowerCase()}${this.traverse[3]}`;
    }
    isFairy() {
        var _a, _b;
        return (((_a = this.fairyCode) !== null && _a !== void 0 ? _a : []).length > 0 || ((_b = this.fairyAttribute) !== null && _b !== void 0 ? _b : "None") !== "None");
    }
    toJson() {
        const json = {};
        if (this.appearance)
            json.appearance = this.appearance;
        if (this.color)
            json.color = this.color;
        if (this.column)
            json.column = this.column;
        if (this.fairyAttribute)
            json.fairyAttribute = this.fairyAttribute;
        if (this.fairyCode)
            json.fairyCode = this.fairyCode;
        if (this.rotation)
            json.rotation = this.rotation;
        if (this.traverse)
            json.traverse = this.traverse;
        return json;
    }
    cursor() {
        return `${this.color === "White" ? "w" : this.color === "Black" ? "b" : "n"}_${this.appearance}`;
    }
}
exports.Piece = Piece;
//# sourceMappingURL=piece.js.map