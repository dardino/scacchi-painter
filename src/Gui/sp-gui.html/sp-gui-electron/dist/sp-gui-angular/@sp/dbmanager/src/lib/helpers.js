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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createXmlElement = exports.newTextElement = exports.notEmpty = exports.convertToRtf = exports.convertFromRtf = exports.notNull = exports.fenToChessBoard = exports.rowToPieces = exports.GetTwins = exports.GetSolutionFromElement = exports.getRotationSymbol = exports.getFigurine = exports.getCanvasColor = exports.getBoardRank = exports.getBoardFile = exports.getCanvasLocation = exports.getCanvasRotation = exports.PieceRotation = exports.GetLocationFromIndex = exports.GetSquareIndex = exports.GetSquareColor = exports.PieceColors = exports.Traverse = exports.Columns = exports.FairyAttributes = exports.TwinModes = exports.TwinTypes = exports.SequnceTypes = exports.getEndingType = exports.getProblemType = exports.EndingTypeCodes = exports.ProblemTypeCodes = void 0;
const canvasChessBoard_1 = require("canvas-chessboard/modules/es2018/canvasChessBoard");
const base64_1 = require("./base64");
exports.ProblemTypeCodes = {
    "-": "Direct",
    H: "Help",
    S: "Self",
    HS: "HelpSelf",
    R: "Reflex",
    HR: "HelpReflex",
};
exports.EndingTypeCodes = {
    "#": `Mate (#)`,
    "=": `Stalemate (=)`,
    "+": `Check (+)`,
    "%": `Gain Piece (%)`,
    "~": `(~)`,
    "##": `Double mate (##)`,
    "==": `Double stalemate (==)`,
    "#=": `(#=)`,
    "!=": `(!=)`,
    "!#": `(!#)`,
    "00": `(00)`,
    ep: `(ep)`,
    Zxy: `(Zxy)`,
    x: `(x)`,
    "##!": `(##!)`,
    ct: `(ct)`,
    "<>": `(&lt;>)`,
    ctr: `(ctr)`,
    "<>r": `(&lt;>r)`,
    c81: `(c81)`,
};
function getProblemType(original = "Direct") {
    switch (original) {
        case "Direct":
            return "-";
        case "Help":
            return "H";
        case "HelpSelf":
            return "HS";
        case "Self":
            return "S";
        default:
            return "-";
    }
}
exports.getProblemType = getProblemType;
function getEndingType(original) {
    switch (original) {
        case "Mate":
            return "#";
        case "Stalemate":
            return "=";
        default:
            return "#";
    }
}
exports.getEndingType = getEndingType;
var SequnceTypes;
(function (SequnceTypes) {
    SequnceTypes["Normal"] = "Normal";
})(SequnceTypes = exports.SequnceTypes || (exports.SequnceTypes = {}));
var TwinTypes;
(function (TwinTypes) {
    TwinTypes["Custom"] = "Custom";
    TwinTypes["Diagram"] = "Diagram";
    TwinTypes["MovePiece"] = "MovePiece";
    TwinTypes["RemovePiece"] = "RemovePiece";
    TwinTypes["AddPiece"] = "AddPiece";
    TwinTypes["Substitute"] = "Substitute";
    TwinTypes["SwapPieces"] = "SwapPieces";
    TwinTypes["Rotation90"] = "Rotation90";
    TwinTypes["Rotation180"] = "Rotation180";
    TwinTypes["Rotation270"] = "Rotation270";
    TwinTypes["TraslateNormal"] = "TraslateNormal";
    TwinTypes["TraslateToroidal"] = "TraslateToroidal";
    TwinTypes["MirrorHorizontal"] = "MirrorHorizontal";
    TwinTypes["MirrorVertical"] = "MirrorVertical";
    TwinTypes["ChangeProblemType"] = "ChangeProblemType";
    TwinTypes["Duplex"] = "Duplex";
    TwinTypes["AfterKey"] = "AfterKey";
    TwinTypes["SwapColors"] = "SwapColors";
    TwinTypes["Stipulation"] = "Stipulation";
})(TwinTypes = exports.TwinTypes || (exports.TwinTypes = {}));
var TwinModes;
(function (TwinModes) {
    TwinModes["Normal"] = "Normal";
    TwinModes["Combined"] = "Combined";
})(TwinModes = exports.TwinModes || (exports.TwinModes = {}));
exports.FairyAttributes = ["None"];
exports.Columns = [
    "ColA",
    "ColB",
    "ColC",
    "ColD",
    "ColE",
    "ColF",
    "ColG",
    "ColH",
];
exports.Traverse = [
    "Row8",
    "Row7",
    "Row6",
    "Row5",
    "Row4",
    "Row3",
    "Row2",
    "Row1",
];
exports.PieceColors = ["White", "Black", "Neutral"];
function GetSquareColor(col, row = exports.Traverse[0]) {
    if (col == null) {
        return "white";
    }
    if (typeof col !== "string") {
        row = col.traverse;
        col = col.column;
    }
    return ((exports.Columns.indexOf(col) % 2) + exports.Traverse.indexOf(row)) % 2
        ? "black"
        : "white";
}
exports.GetSquareColor = GetSquareColor;
function GetSquareIndex(col, row = exports.Traverse[0]) {
    if (col == null) {
        return -1;
    }
    if (typeof col !== "string") {
        row = col.traverse;
        col = col.column;
    }
    return exports.Columns.indexOf(col) + 8 * exports.Traverse.indexOf(row);
}
exports.GetSquareIndex = GetSquareIndex;
function GetLocationFromIndex(index) {
    return {
        column: exports.Columns[index % 8],
        traverse: exports.Traverse[Math.floor(index / 8)],
    };
}
exports.GetLocationFromIndex = GetLocationFromIndex;
exports.PieceRotation = [
    "NoRotation",
    "Clockwise45",
    "Clockwise90",
    "Clockwise135",
    "UpsideDown",
    "Counterclockwise135",
    "Counterclockwise90",
    "Counterclockwise45",
];
function getCanvasRotation(rotation) {
    switch (rotation) {
        case "NoRotation":
            return canvasChessBoard_1.Rotations.NoRotation;
        case "Clockwise45":
            return canvasChessBoard_1.Rotations.TopRight;
        case "Clockwise90":
            return canvasChessBoard_1.Rotations.Right;
        case "Clockwise135":
            return canvasChessBoard_1.Rotations.BottomRight;
        case "UpsideDown":
            return canvasChessBoard_1.Rotations.UpsideDown;
        case "Counterclockwise135":
            return canvasChessBoard_1.Rotations.BottomLeft;
        case "Counterclockwise90":
            return canvasChessBoard_1.Rotations.Left;
        case "Counterclockwise45":
            return canvasChessBoard_1.Rotations.TopLeft;
        default:
            return canvasChessBoard_1.Rotations.NoRotation;
    }
}
exports.getCanvasRotation = getCanvasRotation;
function getCanvasLocation(x, y) {
    if (typeof x !== "string" || typeof y !== "string") {
        return { col: canvasChessBoard_1.BoardFile.A, row: canvasChessBoard_1.BoardRank.R1 };
    }
    return {
        col: getBoardFile(x),
        row: getBoardRank(y),
    };
}
exports.getCanvasLocation = getCanvasLocation;
function getBoardFile(x) {
    if (typeof x === "number")
        x = exports.Columns[x];
    x = x.substr(3, 1); // extract col from "ColA";
    return canvasChessBoard_1.BoardFile[x];
}
exports.getBoardFile = getBoardFile;
function getBoardRank(y) {
    if (typeof y === "number")
        y = exports.Traverse[y];
    y = y.substr(3, 1); // extract row from "Row8";
    return canvasChessBoard_1.BoardRank[`R${y}`];
}
exports.getBoardRank = getBoardRank;
function getCanvasColor(c) {
    switch (c) {
        case "Black":
            return "black";
        case "Neutral":
            return "neutral";
        case "White":
        default:
            return "white";
    }
}
exports.getCanvasColor = getCanvasColor;
function getFigurine(appearance) {
    switch (appearance) {
        case "K":
        case "k":
            return "k";
        case "Q":
        case "q":
            return "q";
        case "R":
        case "r":
            return "r";
        case "S":
        case "s":
        case "N":
        case "n":
            return "n";
        case "B":
        case "b":
            return "b";
        case "P":
        case "p":
            return "p";
        case "E":
        case "e":
            return "e";
        case "T":
        case "t":
            return "t";
        case "A":
        case "a":
            return "a";
        default:
            return null;
    }
}
exports.getFigurine = getFigurine;
const mapRotations = {
    [exports.PieceRotation[0]]: "",
    [exports.PieceRotation[1]]: ":1",
    [exports.PieceRotation[2]]: ":2",
    [exports.PieceRotation[3]]: ":3",
    [exports.PieceRotation[4]]: ":4",
    [exports.PieceRotation[5]]: ":5",
    [exports.PieceRotation[6]]: ":6",
    [exports.PieceRotation[7]]: ":7",
};
const RotationsCodes = [
    "+ ",
    "+/",
    "+-",
    "+\\",
    "- ",
    "-/",
    "--",
    "-\\",
];
const RotationsCodeMap = {
    "+ ": "NoRotation",
    "+/": "Clockwise45",
    "+-": "Clockwise90",
    "+\\": "Clockwise135",
    "- ": "UpsideDown",
    "-/": "Counterclockwise135",
    "--": "Counterclockwise90",
    "-\\": "Counterclockwise45",
};
function getRotationSymbol(rotation) {
    return mapRotations[rotation];
}
exports.getRotationSymbol = getRotationSymbol;
/*
<SP_Item
ProblemType="Help"
Moves="2"
Date="2018-08-21T22:00:00Z"
Maximum="false"
Serie="false"
PrizeRank="0"
CompleteStipulationDesc="H#"
PersonalID="214"
PrizeDescription=""
Source="Thematic Tourney of e4-e5 [squirrel]"
Stipulation="Mate"
>
    <Authors>
      <Author>
        <NameAndSurname>Gabriele Brunori</NameAndSurname>
        <Address/>
        <City/>
        <Phone/>
        <ZipCode/>
        <StateOrProvince/>
        <Country/>
        <Language>it-IT</Language>
      </Author>
      <Author>
        <NameAndSurname>Valerio Agostini</NameAndSurname>
        <Address/>
        <City/>
        <Phone/>
        <ZipCode/>
        <StateOrProvince/>
        <Country/>
        <Language>it-IT</Language>
      </Author>
    </Authors>
    <Pieces>
      <Piece Type="Queen" Color="White" Column="ColD" Traverse="Row8" Rotation="Clockwise90" FairyAttribute="None">
        <FairyType code="sq"/>
      </Piece>
      <Piece Type="Pawn" Color="White" Column="ColB" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Pawn" Color="White" Column="ColD" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Pawn" Color="White" Column="ColE" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Pawn" Color="White" Column="ColF" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Horse" Color="Black" Column="ColE" Traverse="Row5" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="King" Color="Black" Column="ColD" Traverse="Row4" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Pawn" Color="White" Column="ColB" Traverse="Row4" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Pawn" Color="Black" Column="ColD" Traverse="Row2" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Bishop" Color="Black" Column="ColD" Traverse="Row1" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Rock" Color="Black" Column="ColA" Traverse="Row2" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="Rock" Color="White" Column="ColF" Traverse="Row3" Rotation="NoRotation" FairyAttribute="None"/>
      <Piece Type="King" Color="White" Column="ColF" Traverse="Row1" Rotation="NoRotation" FairyAttribute="None"/>
    </Pieces>
    <Twins TwinSequenceTypes="Normal">
      <Twin TwinType="AddPiece" ValueA="white" ValueB="Bh5" ValueC="" TwinModes="Normal"/>
    </Twins>
    <Conditions/>
    <Tags>
      <Tag Value="Squirrel"/>
      <Tag Value="Duale evitato attivo"/>
      <Tag Value="Duale evitato passivo"/>
    </Tags>
    <Solution>CgogIDEuQmQxLWIzIGQ2LWQ3ISAoZTYtZTc/KSAgMi5CYjMtZDUgU1FkOC1kNiAjIChhY3RpdmUgZH
    VhbCBhdm9pZGFuY2UpCiAgMS5SYTItYTUgZTYtZTchIChkNi1kNz8pICAyLlJhNS1kNSBTUWQ4LWU2ICMgKGFjdG
    l2ZSBkdWFsIGF2b2lkYW5jZSkKCiAgMS5CZDEtYzIhIChCZDEqZjM/KSBiNi1iNyEgKGY2LWY3PykgIDIuQmMyLW
    U0IFNRZDgtYjYgIyAocGFzc2l2ZSBkdWFsIGF2b2lkYW5jZSkKICAxLlJhMi1jMiEgKEFkMS1iMz8pIGY2LWY3IS
    AoYjYtYjc/KSAgMi5SYzItYzQgU1FkOC1mNiAjIChwYXNzaXZlIGR1YWwgYXZvaWRhbmNlKQoKU3F1aXJyZWwgZD
    gKCg==</Solution>
    <SolutionRtf>e1xydGYxXGFuc2lcYW5zaWNwZzEyNTJcZGVmZjBcZGVmbGFuZzEwNDB7XGZvbnR0Ymx7XGYwXGZ
    uaWxcZmNoYXJzZXQwIE1pY3Jvc29mdCBTYW5zIFNlcmlmO319DQpcdmlld2tpbmQ0XHVjMVxwYXJkXGlcZjBcZnM
    xOFxwYXINClxwYXINClxpMFxmczIwICAgMS5CZDEtYjMgZDYtZDchIChlNi1lNz8pICAyLkJiMy1kNSBTUWQ4LWQ
    2ICMgKGFjdGl2ZSBkdWFsIGF2b2lkYW5jZSlccGFyDQpccGFyZFxmczIwICAgMS5SYTItYTUgZTYtZTchIChkNi1
    kNz8pICAyLlJhNS1kNSBTUWQ4LWU2ICMgKGFjdGl2ZSBkdWFsIGF2b2lkYW5jZSlccGFyDQpccGFyDQpccGFyZFx
    mczIwICAgMS5CZDEtYzIhIChCZDEqZjM/KSBiNi1iNyEgKGY2LWY3PykgIDIuQmMyLWU0IFNRZDgtYjYgIyAocGF
    zc2l2ZSBkdWFsIGF2b2lkYW5jZSlccGFyDQpccGFyZCAgIDEuUmEyLWMyISAoQWQxLWIzPykgZjYtZjchIChiNi1
    iNz8pICAyLlJjMi1jNCBTUWQ4LWY2ICNcZnMyMCAgKHBhc3NpdmUgZHVhbCBhdm9pZGFuY2UpXHBhcg0KXHBhcmR
    cZnMyMFxwYXINClNxdWlycmVsIGQ4XHBhcg0KXGlcZnMxOFxwYXINClxwYXINCn0NCg==</SolutionRtf>
  </SP_Item>
  */
function GetSolutionFromElement(el) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let solText;
        const sol = (_a = el.querySelector("Solution")) === null || _a === void 0 ? void 0 : _a.innerHTML;
        const solRft = el.querySelector("SolutionRtf");
        if (solRft != null && solRft.innerHTML.length > 0) {
            solText = yield convertFromRtf(base64_1.Base64.decode(solRft.innerHTML).replace(/\r/g, ""));
        }
        else {
            if (!sol)
                solText = [];
            else {
                solText = base64_1.Base64.decode(sol)
                    .replace(/\r\n/g, "\r")
                    .split("\r")
                    .map((txt) => {
                    const div = document.createElement("div");
                    div.innerText = txt;
                    return div;
                });
            }
        }
        return { plain: sol, html: solText, rtf: solRft === null || solRft === void 0 ? void 0 : solRft.innerHTML };
    });
}
exports.GetSolutionFromElement = GetSolutionFromElement;
function GetTwins(el) {
    const twins = el.querySelectorAll("Twin");
    return Array.from(twins);
}
exports.GetTwins = GetTwins;
function rowToPieces(row) {
    var _a;
    const fairies = row.match(/\{[a-z]*\}/);
    row = row.replace(/\{[a-z]*\}/g, "!");
    row = row.replace(/([QKRTBNPAETqkrtbnpaet]|^1)/g, "|$1");
    row = row.replace(/([^:|])1/g, "$1|1");
    row = row.replace(/\*\|(.)/g, "|*$1");
    row = row.replace(/:0/g, RotationsCodes[0]);
    row = row.replace(/:1/g, RotationsCodes[1]);
    row = row.replace(/:2/g, RotationsCodes[2]);
    row = row.replace(/:3/g, RotationsCodes[3]);
    row = row.replace(/:4/g, RotationsCodes[4]);
    row = row.replace(/:5/g, RotationsCodes[5]);
    row = row.replace(/:6/g, RotationsCodes[6]);
    row = row.replace(/:7/g, RotationsCodes[7]);
    row = row.replace(/[8]/g, Array(9).join("|#"));
    row = row.replace(/[7]/g, Array(8).join("|#"));
    row = row.replace(/[6]/g, Array(7).join("|#"));
    row = row.replace(/[5]/g, Array(6).join("|#"));
    row = row.replace(/[4]/g, Array(5).join("|#"));
    row = row.replace(/[3]/g, Array(4).join("|#"));
    row = row.replace(/[2]/g, Array(3).join("|#"));
    row = row.replace(/[1]/g, "#");
    row = row.trim().substr(1);
    const piecesStrings = row.split("|");
    const pieces = [];
    let f = 0;
    for (const c of piecesStrings) {
        // empty cell
        if (c === "#") {
            pieces.push(null);
            continue;
        }
        const isNeutral = c[0] === "*";
        const pieceName = (isNeutral ? c.substr(1, 1) : c.substr(0, 1));
        const pieceRotation = c.substr(1, 2);
        let rotation = "NoRotation";
        let fairy = "";
        if (c.length >= 3) {
            rotation = RotationsCodeMap[pieceRotation];
            if (c.indexOf("!") > -1) {
                fairy = (_a = fairies === null || fairies === void 0 ? void 0 : fairies[f]) !== null && _a !== void 0 ? _a : "";
                f++;
            }
        }
        pieces.push({
            appearance: pieceName,
            rotation,
            // TODO: in fen we haven't params for fairies?
            fairyCode: fairy
                .replace(/[\{\}]/g, "")
                .split("+")
                .map((fp) => ({ code: fp, params: [] })),
            color: isNeutral
                ? "Neutral"
                : pieceName.toLowerCase() !== pieceName
                    ? "White"
                    : "Black",
        });
    }
    return pieces;
}
exports.rowToPieces = rowToPieces;
function fenToChessBoard(original) {
    const [fen, fairies] = original.split(" ");
    const fenrows = fen.split("/");
    const pieces = fenrows.map((f) => rowToPieces(f));
    const cells = pieces.reduce((a, b, i, m) => a.concat(b), []);
    return cells;
}
exports.fenToChessBoard = fenToChessBoard;
function notNull(v) {
    return v != null;
}
exports.notNull = notNull;
function stringToArrayBuffer(stringText) {
    const buffer = new ArrayBuffer(stringText.length);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < stringText.length; i++) {
        bufferView[i] = stringText.charCodeAt(i);
    }
    return buffer;
}
function convertFromRtf(rtf) {
    return __awaiter(this, void 0, void 0, function* () {
        const { EMFJS, RTFJS, WMFJS } = yield Promise.resolve().then(() => __importStar(require("rtf.js")));
        RTFJS.loggingEnabled(false);
        WMFJS.loggingEnabled(false);
        EMFJS.loggingEnabled(false);
        try {
            const doc = new RTFJS.Document(stringToArrayBuffer(rtf), {});
            const htmlElements = yield doc.render();
            return htmlElements;
        }
        catch (err) {
            console.warn(err, rtf);
            return rtf.split("\n").map((d) => {
                const div = document.createElement("div");
                div.innerText = d;
                return div;
            });
        }
    });
}
exports.convertFromRtf = convertFromRtf;
function convertToRtf(html) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(typeof html === "string" && html)) {
            return null;
        }
        let richText = html;
        let tmpRichText;
        let hasHyperlinks;
        // Singleton tags
        richText = richText.replace(/<(?:hr)(?:\s+[^>]*)?\s*[\/]?>/gi, "{\\pard \\brdrb \\brdrs \\brdrw10 \\brsp20 \\par}\n{\\pard\\par}\n");
        richText = richText.replace(/<(?:br)(?:\s+[^>]*)?\s*[\/]?>/gi, "{\\pard\\par}\n");
        // Empty tags
        richText = richText.replace(/<(?:p|div|section|article)(?:\s+[^>]*)?\s*[\/]>/gi, "{\\pard\\par}\n");
        richText = richText.replace(/<(?:[^>]+)\/>/g, "");
        // Hyperlinks
        richText = richText.replace(/<a(?:\s+[^>]*)?(?:\s+href=(["'])(?:javascript:void\(0?\);?|#|return false;?|void\(0?\);?|)\1)(?:\s+[^>]*)?>/gi, "{{{\n");
        tmpRichText = richText;
        richText = richText.replace(/<a(?:\s+[^>]*)?(?:\s+href=(["'])(.+)\1)(?:\s+[^>]*)?>/gi, `{\\field{\\*\\fldinst{HYPERLINK\n "$2"\n}}{\\fldrslt{\\ul\\cf1\n`);
        hasHyperlinks = richText !== tmpRichText;
        richText = richText.replace(/<a(?:\s+[^>]*)?>/gi, "{{{\n");
        richText = richText.replace(/<\/a(?:\s+[^>]*)?>/gi, "\n}}}");
        // Start tags
        richText = richText.replace(/<(?:b|strong)(?:\s+[^>]*)?>/gi, "{\\b\n");
        richText = richText.replace(/<(?:i|em)(?:\s+[^>]*)?>/gi, "{\\i\n");
        richText = richText.replace(/<(?:u|ins)(?:\s+[^>]*)?>/gi, "{\\ul\n");
        richText = richText.replace(/<(?:strike|del)(?:\s+[^>]*)?>/gi, "{\\strike\n");
        richText = richText.replace(/<sup(?:\s+[^>]*)?>/gi, "{\\super\n");
        richText = richText.replace(/<sub(?:\s+[^>]*)?>/gi, "{\\sub\n");
        richText = richText.replace(/<(?:p|div|section|article)(?:\s+[^>]*)?>/gi, "{\\pard\n");
        // End tags
        richText = richText.replace(/<\/(?:p|div|section|article)(?:\s+[^>]*)?>/gi, "\n\\par}\n");
        richText = richText.replace(/<\/(?:b|strong|i|em|u|ins|strike|del|sup|sub)(?:\s+[^>]*)?>/gi, "\n}");
        // Strip any other remaining HTML tags [but leave their contents]
        richText = richText.replace(/<(?:[^>]+)>/g, "");
        // Prefix and suffix the rich text with the necessary syntax
        richText =
            "{\\rtf1\\ansi\n" +
                (hasHyperlinks ? "{\\colortbl\n;\n\\red0\\green0\\blue255;\n}\n" : "") +
                richText +
                "\n}";
        richText = richText.replace(/&gt;/gi, ">");
        richText = richText.replace(/&lt;/gi, "<");
        richText = richText.replace(/&amp;/gi, "&");
        richText = richText.replace(/&nbsp;/gi, " ");
        return richText;
    });
}
exports.convertToRtf = convertToRtf;
function notEmpty(v) {
    return v != null && v !== "";
}
exports.notEmpty = notEmpty;
function newTextElement(elName, content) {
    const el = createXmlElement(elName);
    el.innerHTML = content;
    return el;
}
exports.newTextElement = newTextElement;
const parser = new DOMParser();
function createXmlElement(elName) {
    const dom = parser.parseFromString(`<${elName}></${elName}>`, "application/xml");
    return dom.querySelector(elName);
    // const newdiv = document.createElementNS("http://www.w3.org/1999/xml", elName);
    // return newdiv;
}
exports.createXmlElement = createXmlElement;
//# sourceMappingURL=helpers.js.map