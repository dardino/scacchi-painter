"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SP2 = void 0;
const helpers_1 = require("./helpers");
const base64_1 = require("./base64");
function invertMap(o) {
    const keys = Object.keys(o);
    return keys.reduce((m, k) => (Object.assign(Object.assign({}, m), { [o[k]]: k })), {});
}
const mapAppearance = {
    Bishop: "b",
    Horse: "n",
    HorseBishop: "a",
    HorseQueen: "e",
    HorseTower: "t",
    King: "k",
    Pawn: "p",
    Queen: "q",
    Rock: "r",
    /* @deprecated */ Rook: "r",
};
const mapAppearanceRe = invertMap(mapAppearance);
const mapColors = {
    Both: "Neutral",
    Neutral: "Neutral",
    White: "White",
    Black: "Black",
};
const mapColorsRe = invertMap(mapColors);
class SP2 {
    static setRtfSolution(item, rtfSolution) {
        const node = helpers_1.createXmlElement("SolutionRtf");
        node.innerHTML = base64_1.Base64.encode(rtfSolution);
        item.appendChild(node);
    }
    static setHtmlSolution(item, htmlSolution) {
        const node = helpers_1.createXmlElement("SolutionHTML");
        node.innerHTML = base64_1.Base64.encode(htmlSolution);
        item.appendChild(node);
    }
    static setSolution(item, textSolution) {
        const node = helpers_1.createXmlElement("Solution");
        node.innerHTML = base64_1.Base64.encode(textSolution);
        item.appendChild(node);
    }
    static setConditions(item, conditions) {
        const list = helpers_1.createXmlElement("Conditions");
        conditions.filter(helpers_1.notEmpty).forEach((c) => {
            const cx = helpers_1.createXmlElement("Condition");
            cx.setAttribute("Value", c);
            list.appendChild(cx);
        });
        item.appendChild(list);
    }
    static setTwins(item, twins) {
        item.appendChild(twins);
    }
    //#region PROBLEM
    static setPieces(item, pieces) {
        const pieceList = helpers_1.createXmlElement("Pieces");
        pieces.forEach((p) => {
            pieceList.appendChild(p);
        });
        item.appendChild(pieceList);
    }
    static setAuthors(item, authors) {
        const auList = helpers_1.createXmlElement("Authors");
        authors.forEach((a) => {
            auList.appendChild(a);
        });
        item.appendChild(auList);
    }
    static setCompleteStipulationDesc(item, csd) {
        item.setAttribute("CompleteStipulationDesc", csd);
    }
    static setPrizeDescription(item, prizeDescription) {
        item.setAttribute("PrizeDescription", prizeDescription);
    }
    static setPrizeRank(item, prizeRank) {
        item.setAttribute("PrizeRank", prizeRank.toFixed(0));
    }
    static setSource(item, source) {
        item.setAttribute("Source", source !== null && source !== void 0 ? source : "");
    }
    static setMaximum(item, maximum) {
        item.setAttribute("Maximum", maximum ? "true" : "false");
    }
    static setSerie(item, serie) {
        item.setAttribute("Serie", serie ? "true" : "false");
    }
    static setStipulation(item, stipulationType) {
        item.setAttribute("Stipulation", stipulationType);
    }
    static setPersonalID(item, personalID) {
        item.setAttribute("PersonalID", personalID);
    }
    static setDate(item, date) {
        item.setAttribute("Date", date);
    }
    static setMoves(item, moves) {
        item.setAttribute("Moves", moves.toFixed(1));
    }
    static setProblemType(item, problemType) {
        item.setAttribute("ProblemType", problemType);
    }
    //#endregion
    // fairy
    static getFairyCodes(f) {
        const ft = f.querySelectorAll("FairyType");
        if (ft.length > 0) {
            return Array.from(ft).map((c) => {
                var _a;
                return {
                    code: (_a = c.getAttribute("code")) !== null && _a !== void 0 ? _a : "",
                    params: Array.from(c.querySelectorAll("Param"))
                        .map((el, i, all) => {
                        const byIndex = all.find((parm) => parm.getAttribute("id") === i.toFixed(0));
                        if (!byIndex)
                            return null;
                        return byIndex.getAttribute("value");
                    })
                        .filter(helpers_1.notNull),
                };
            });
        }
        else {
            return [];
        }
    }
    static setFairyCode(el, fairyCode) {
        if (fairyCode == null)
            return;
        fairyCode.forEach((fc) => {
            const fel = helpers_1.createXmlElement("FairyType");
            fel.setAttribute("code", fc.code); // retrocompatibility
            fc.params.forEach((p, i) => {
                const felParm = helpers_1.createXmlElement("Param");
                felParm.setAttribute("id", i.toFixed(0));
                felParm.setAttribute("value", p);
                fel.appendChild(felParm);
            });
            el.appendChild(fel);
        });
    }
    static getFairyAttribute(f) {
        var _a;
        return (_a = f.getAttribute("FairyAttribute")) !== null && _a !== void 0 ? _a : "";
    }
    static setFairyAttribute(el, fairyAttribute) {
        el.setAttribute("FairyAttribute", fairyAttribute);
    }
    // Piece rotation
    static setRotation(el, source) {
        el.setAttribute("Rotation", source);
    }
    static getRotation(rotation) {
        var _a;
        return helpers_1.PieceRotation[Math.max(helpers_1.PieceRotation.indexOf((_a = rotation.getAttribute("Rotation")) !== null && _a !== void 0 ? _a : "NoRotation"), 0)];
    }
    // Piece traverse
    static setTraverse(el, traverse) {
        el.setAttribute("Traverse", traverse);
    }
    static getTraverse(f) {
        return helpers_1.Traverse[Math.max(helpers_1.Traverse.indexOf(f.getAttribute("Traverse") || "Row1"), 0)];
    }
    // Piece column
    static setColum(el, column) {
        el.setAttribute("Column", column);
    }
    static getColum(f) {
        return helpers_1.Columns[Math.max(helpers_1.Columns.indexOf(f.getAttribute("Column") || "ColA"), 0)]; // double map to coalesce a valid value
    }
    // Piece color
    static setColor(el, color) {
        if (color === "")
            return;
        let tp = mapColorsRe[color];
        if (tp === "Both")
            tp = "Neutral";
        el.setAttribute("Color", tp);
    }
    static getColor(c) {
        var _a;
        return mapColors[((_a = c.getAttribute("Color")) !== null && _a !== void 0 ? _a : "White")];
    }
    // Piece type
    static getAppearance(f) {
        var _a;
        const pieceName = f.getAttribute("Type");
        return (_a = mapAppearance[pieceName]) !== null && _a !== void 0 ? _a : "";
    }
    static setAppearance(el, f) {
        if (f === "")
            return;
        let tp = mapAppearanceRe[f];
        if (tp === "Rook")
            tp = "Rock"; // retrocompatibility
        el.setAttribute("Type", tp);
    }
}
exports.SP2 = SP2;
//# sourceMappingURL=SP2.js.map