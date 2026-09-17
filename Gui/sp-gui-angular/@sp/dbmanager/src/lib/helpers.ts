import {
  FairySquare,
  FenPosition,
  getEmptyBoardFen,
  parseFen,
  PiecesOnBoard,
  positionToFen,
  type ChessPieceColor,
  type ChessPieceRotation,
  type ChessPieceType,
} from "@dardino/chess-board";

import { Base64 } from "./base64";
import { FairyPiecesCodes } from "./models/fairesDB";
import { Columns, IPieceV4, IProblemV4, IStipulation, PieceColors, PieceRotation, Traverse } from "./SPX.v4";

export interface ProblemDb {
  version: string;
  name: string;
  lastIndex: number;
  problems: IProblemV4[];
}

export const FairyAttributes = ["None"] as const;

export type BoardFile = `a` | `b` | `c` | `d` | `e` | `f` | `g` | `h`;
export type BoardRank = `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8`;
export type SquareColors = "black" | "white";

export const GetSquareColor = (
  ...args: [loc: SquareLocation] | [col: Columns, row: Traverse]
): SquareColors => {
  let col = args[0];
  let row = args[1];
  if (col == null) {
    return "white";
  }
  if (typeof col !== "string") {
    row = col.traverse;
    col = col.column;
  }
  if (row == null) throw new Error("invalid parameters 'row'");

  return ((Columns.indexOf(col) % 2) + Traverse.indexOf(row)) % 2
    ? "black"
    : "white";
};

export interface SquareLocation {
  column: Columns;
  traverse: Traverse;
}

export const GetSquareIndex = (
  ...args: [loc: SquareLocation] | [col: Columns, row: Traverse]
): number => {
  let col = args[0];
  let row = args[1];
  if (col == null) {
    return -1;
  }
  if (typeof col !== "string") {
    row = col.traverse;
    col = col.column;
  }
  if (row == null) throw new Error("invalid parameters 'row'");
  return Columns.indexOf(col) + Columns.length * Traverse.indexOf(row);
};
export const GetLocationFromIndex = (index: number): SquareLocation => ({
  column: Columns[index % Columns.length],
  traverse: Traverse[Math.floor(index / Columns.length)],
});

export type SP2PieceName
  = | "King"
    | "Queen"
    | "Rook"
    | "Rock"
    | "Horse"
    | "Bishop"
    | "Pawn"
    | "HorseQueen"
    | "HorseTower"
    | "HorseBishop";

export const getCanvasRotation = (rotation: PieceRotation): ChessPieceRotation => {
  switch (rotation) {
    case "NoRotation":
      return "0";
    case "Clockwise45":
      return "45";
    case "Clockwise90":
      return "90";
    case "Clockwise135":
      return "135";
    case "UpsideDown":
      return "180";
    case "Counterclockwise135":
      return "225";
    case "Counterclockwise90":
      return "270";
    case "Counterclockwise45":
      return "315";
    default:
      return "0";
  }
};

export const getCanvasLocation = (x: Columns, y: Traverse): FairySquare | null => {
  if (!x || !y) {
    return null;
  }
  return `${getBoardFile(x)}${getBoardRank(y)}`;
};
export const getBoardFile = (x: string | Columns): BoardFile => {
  if (typeof x === "number") x = Columns[x];
  x = x.substr(3, 1).toLowerCase(); // extract col from "ColA";
  return x as BoardFile;
};
export const getBoardRank = (y: string | Traverse): BoardRank => {
  if (typeof y === "number") y = Traverse[y];
  y = y.substr(3, 1); // extract row from "Row8";
  return y as BoardRank;
};

export const getCanvasColor = (c: PieceColors): ChessPieceColor => {
  switch (c) {
    case "Black":
      return "b";
    case "Neutral":
      return "n";
    case "White":
    default:
      return "w";
  }
};

export const getPieceColor = (c: ChessPieceColor): PieceColors => {
  switch (c) {
    case "b":
      return "Black";
    case "n":
      return "Neutral";
    case "w":
    default:
      return "White";
  }
};

export const getFigurine = (appearance?: string): ChessPieceType | null => {
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
};

const mapRotations = {
  [PieceRotation[0]]: "",
  [PieceRotation[1]]: ":1",
  [PieceRotation[2]]: ":2",
  [PieceRotation[3]]: ":3",
  [PieceRotation[4]]: ":4",
  [PieceRotation[5]]: ":5",
  [PieceRotation[6]]: ":6",
  [PieceRotation[7]]: ":7",
} as const;
export const getRotationSymbol = (rotation: IPieceV4["rotation"]): string =>
  mapRotations[rotation];

const RotationsCodes = [
  "+ ",
  "+/",
  "+-",
  "+\\",
  "- ",
  "-/",
  "--",
  "-\\",
] as const;
type RotationsCodes = typeof RotationsCodes[number];

const RotationsCodeMap: Record<RotationsCodes, PieceRotation> = {
  "+ ": "NoRotation",
  "+/": "Clockwise45",
  "+-": "Clockwise90",
  "+\\": "Clockwise135",
  "- ": "UpsideDown",
  "-/": "Counterclockwise135",
  "--": "Counterclockwise90",
  "-\\": "Counterclockwise45",
};

const RotationsAngleMap: Record<ChessPieceRotation, PieceRotation> = {
  0: "NoRotation",
  45: "Clockwise45",
  90: "Clockwise90",
  135: "Clockwise135",
  180: "UpsideDown",
  225: "Counterclockwise135",
  270: "Counterclockwise90",
  315: "Counterclockwise45",
};
export const getRotationFromAngle = (rotation: ChessPieceRotation): IPieceV4["rotation"] =>
  RotationsAngleMap[rotation];

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
        <Language>it</Language>
      </Author>
      <Author>
        <NameAndSurname>Valerio Agostini</NameAndSurname>
        <Address/>
        <City/>
        <Phone/>
        <ZipCode/>
        <StateOrProvince/>
        <Country/>
        <Language>it</Language>
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

export const GetSolutionFromElement = async (el: Element) => {
  let solText: HTMLElement[];

  const sol = el.querySelector("Solution")?.innerHTML;
  const solRft = el.querySelector("SolutionRtf");
  let solDec = sol ? Base64.decode(sol) : "";

  if (solRft != null && solRft.innerHTML.length > 0) {
    try {
      solText = await convertFromRtf(
        Base64.decode(solRft.innerHTML).replace(/[\r\n]+/g, "\n"),
      );
    }
    catch (err) {
      console.error(err);
      solText = [];
    }
    if (solDec === "") solDec = solText.map(row => row.innerText).join("\n");
  }
  else {
    if (!sol) solText = [];
    else {
      solText = solDec
        .replace(/[\r\n]+/g, "\n")
        .split("\n")
        .map((txt) => {
          const div = document.createElement("div");
          div.innerText = txt;
          return div;
        });
    }
  }
  return { plain: solDec, html: solText.map(item => item.outerHTML).join("") };
};

export const GetTwins = (el: Element): Element[] => {
  const twins = el.querySelectorAll("Twin");
  return Array.from(twins);
};

export const getPiecesString = (row: string): string[] => {
  row = row.replace(/\{[a-z]*\}/g, "!");
  row = row.replace(/([QKRBNPAETqkrbnpaet]|^1)/g, "|$1");
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
  row = row.replace(/8/g, Array(9).join("|#"));
  row = row.replace(/7/g, Array(8).join("|#"));
  row = row.replace(/6/g, Array(7).join("|#"));
  row = row.replace(/5/g, Array(6).join("|#"));
  row = row.replace(/4/g, Array(5).join("|#"));
  row = row.replace(/3/g, Array(4).join("|#"));
  row = row.replace(/2/g, Array(3).join("|#"));
  row = row.replace(/1/g, "#");
  row = row.trim().substring(1);
  const piecesStrings = row.split("|");
  return piecesStrings;
};

export const rowToPieces = (row1: string): (Partial<IPieceV4> | null)[] => {
  const fairies = /\{[a-z]*\}/.exec(row1);
  const piecesStrings = getPiecesString(row1);

  const pieces: (Partial<IPieceV4> | null)[] = [];
  let f = 0;
  for (const c of piecesStrings) {
    // empty cell
    if (c === "#") {
      pieces.push(null);
      continue;
    }
    const isNeutral = c.startsWith("*");
    const pieceName = (isNeutral ? c.substring(1, 2) : c.substring(0, 1)) as ChessPieceType;
    const pieceRotation = c.substring(1, 3) as RotationsCodes;
    let rotation: PieceRotation = "NoRotation";
    let fairy: string | null = null;
    if (c.length >= 3) {
      rotation = RotationsCodeMap[pieceRotation];
      if (c.indexOf("!") > -1) {
        fairy = fairies?.[f] ?? "";
        f++;
      }
    }

    // TODO: in fen we haven't params for fairies?
    const fairyCode = fairy?.replace(/[{}]/g, "") as FairyPiecesCodes;
    const nonNeutralColor = pieceName.toLowerCase() !== pieceName ? "White" : "Black";
    const color = isNeutral ? "Neutral" : nonNeutralColor;

    pieces.push({
      appearance: pieceName,
      rotation,
      fairyCode,
      color,
    });
  }

  return pieces;
};

export const fenToChessBoard = (original: string) => {
  const [fen] = original.split(" ");
  const fenrows = fen.split("/");
  const pieces = fenrows.map(f => rowToPieces(f));
  const cells = pieces.reduce<(Partial<IPieceV4> | null)[]>(
    (a, b) => a.concat(b),
    [],
  );
  return cells;
};

export const notNull = <T>(v: T): v is Exclude<T, null | undefined> =>
  v != null;

const stringToArrayBuffer = (stringText: string) => {
  const buffer = new ArrayBuffer(stringText.length);
  const bufferView = new Uint8Array(buffer);
  for (let i = 0; i < stringText.length; i++) {
    bufferView[i] = stringText.charCodeAt(i);
  }
  return buffer;
};

export function prepare(element: HTMLElement): HTMLElement {
  if (element.tagName.toLocaleLowerCase() == "div") {
    const newEl = document.createElement("p");
    newEl.innerHTML = element.innerHTML;
    return newEl;
  }
  else {
    return element;
  }
}

export const convertFromRtf = async (rtf: string) => {
  const { EMFJS, RTFJS, WMFJS } = await import("rtf.js");
  RTFJS.loggingEnabled(false);
  WMFJS.loggingEnabled(false);
  EMFJS.loggingEnabled(false);
  try {
    const doc = new RTFJS.Document(stringToArrayBuffer(rtf), {});
    const htmlElements = await doc.render();
    return htmlElements.map(prepare);
  }
  catch (err) {
    console.warn(err, rtf);
    return rtf.split(/[\r\n]+/g).map((d) => {
      const div = document.createElement("p");
      div.innerText = d;
      return div;
    });
  }
};

export const convertToRtf = async (html: string): Promise<string | null> => {
  if (!(typeof html === "string" && html)) {
    return null;
  }

  let richText = html;

  // Singleton tags
  richText = richText.replace(
    /<(?:hr)(?:\s+[^>]*)?\s*\/?>/gi,
    "{\\pard \\brdrb \\brdrs \\brdrw10 \\brsp20 \\par}\n{\\pard\\par}\n",
  );
  richText = richText.replace(
    /<(?:br)(?:\s+[^>]*)?\s*\/?>/gi,
    "{\\pard\\par}\n",
  );

  // Empty tags
  richText = richText.replace(
    /<(?:p|div|section|article)(?:\s+[^>]*)?\s*\/>/gi,
    "{\\pard\\par}\n",
  );
  richText = richText.replace(/<(?:[^>]+)\/>/g, "");

  // Hyperlinks
  richText = richText.replace(
    /<a(?:\s+[^>]*)?(?:\s+href=(["'])(?:javascript:void\(0?\);?|#|return false;?|void\(0?\);?|)\1)(?:\s+[^>]*)?>/gi,
    "{{{\n",
  );
  const tmpRichText = richText;
  richText = richText.replace(
    /<a(?:\s+[^>]*)?(?:\s+href=(["'])(.+)\1)(?:\s+[^>]*)?>/gi,
    "{\\field{\\*\\fldinst{HYPERLINK\n \"$2\"\n}}{\\fldrslt{\\ul\\cf1\n",
  );
  const hasHyperlinks = richText !== tmpRichText;
  richText = richText.replace(/<a(?:\s+[^>]*)?>/gi, "{{{\n");
  richText = richText.replace(/<\/a(?:\s+[^>]*)?>/gi, "\n}}}");

  // Start tags
  richText = richText.replace(/<(?:b|strong)(?:\s+[^>]*)?>/gi, "{\\b\n");
  richText = richText.replace(/<(?:i|em)(?:\s+[^>]*)?>/gi, "{\\i\n");
  richText = richText.replace(/<(?:u|ins)(?:\s+[^>]*)?>/gi, "{\\ul\n");
  richText = richText.replace(/<(?:strike|del)(?:\s+[^>]*)?>/gi, "{\\strike\n");
  richText = richText.replace(/<sup(?:\s+[^>]*)?>/gi, "{\\super\n");
  richText = richText.replace(/<sub(?:\s+[^>]*)?>/gi, "{\\sub\n");
  richText = richText.replace(
    /<(?:p|div|section|article)(?:\s+[^>]*)?>/gi,
    "{\\pard\n",
  );

  // End tags
  richText = richText.replace(
    /<\/(?:p|div|section|article)(?:\s+[^>]*)?>/gi,
    "\n\\par}\n",
  );
  richText = richText.replace(
    /<\/(?:b|strong|i|em|u|ins|strike|del|sup|sub)(?:\s+[^>]*)?>/gi,
    "\n}",
  );

  // Strip any other remaining HTML tags [but leave their contents]
  richText = richText.replace(/<(?:[^>]+)>/g, "");

  // Prefix and suffix the rich text with the necessary syntax
  richText
    = "{\\rtf1\\ansi\n"
      + (hasHyperlinks ? "{\\colortbl\n;\n\\red0\\green0\\blue255;\n}\n" : "")
      + richText
      + "\n}";

  richText = richText.replace(/&gt;/gi, ">");
  richText = richText.replace(/&lt;/gi, "<");
  richText = richText.replace(/&amp;/gi, "&");
  richText = richText.replace(/&nbsp;/gi, " ");

  return richText;
};

export const notEmpty = <T>(v: T | null | undefined | ""): v is T =>
  v != null && v !== "";

export const newTextElement = (elName: string, content: string): Element => {
  const el = createXmlElement(elName);
  el.innerHTML = content;
  return el;
};

const parser = new DOMParser();
export const createXmlElement = (elName: string): Element => {
  const dom = parser.parseFromString(
    `<${elName}></${elName}>`,
    "application/xml",
  );
  return dom.querySelector(elName) as Element;
};

export const prettifyXml = (sourceXml: string | Document) => {
  const xmlDoc = typeof sourceXml === "string" ? new DOMParser().parseFromString(sourceXml, "application/xml") : sourceXml;
  const xsltDoc = new DOMParser().parseFromString(
    [
      // describes how we want to modify the XML - indent everything
      "<xsl:stylesheet xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\">",
      "  <xsl:strip-space elements=\"*\"/>",
      "  <xsl:template match=\"para[content-style][not(text())]\">", // change to just text() to strip space in text nodes
      "    <xsl:value-of select=\"normalize-space(.)\"/>",
      "  </xsl:template>",
      "  <xsl:template match=\"node()|@*\">",
      "    <xsl:copy><xsl:apply-templates select=\"node()|@*\"/></xsl:copy>",
      "  </xsl:template>",
      "  <xsl:output indent=\"yes\"/>",
      "</xsl:stylesheet>",
    ].join("\n"),
    "application/xml",
  );
  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  const resultXml = new XMLSerializer().serializeToString(resultDoc);
  return resultXml;
};

export const notationCasingByColor: Record<PieceColors, (piecename: string) => string> = {
  White: (txt: string) => txt.toUpperCase(),
  Black: (txt: string) => txt.toLowerCase(),
  Neutral: (txt: string) => `*${txt.toUpperCase()}`,
};

export function updatePositionFromFen(ffen: string, currentPosition?: IProblemV4): IProblemV4 {
  const position = parseFen(ffen);
  return {
    authors: [...currentPosition?.authors ?? []],
    conditions: [...currentPosition?.conditions ?? []],
    date: currentPosition?.date ?? new Date().toISOString(),
    engine: currentPosition?.engine,
    engineConfig: currentPosition?.engineConfig,
    engineConfigurationsByEngine: currentPosition?.engineConfigurationsByEngine,
    htmlSolution: currentPosition?.htmlSolution ?? "",
    textSolution: currentPosition?.textSolution ?? "",
    personalID: currentPosition?.personalID ?? "",
    pieces: Object.entries(position?.pieces ?? {}).map(([square, p]) => {
      if (!p) return null;
      return ({
        appearance: p.type,
        color: getPieceColor(p.color),
        column: `Col${square[0].toUpperCase()}` as Columns,
        traverse: `Row${square[1]}` as Traverse,
        fairyAttributes: p.fairyCondition ? [p.fairyCondition] : [],
        fairyCode: p.fairyName as FairyPiecesCodes ?? null,
        fairyParams: p.fairyName ? [] : [],
        rotation: getRotationFromAngle(p.rotation ?? "0"),
      } satisfies IPieceV4);
    }).filter(p => p !== null) ?? [],
    prizeDescription: currentPosition?.prizeDescription ?? "",
    prizeRank: currentPosition?.prizeRank ?? 0,
    source: currentPosition?.source ?? "",
    stipulation: { ...currentPosition?.stipulation },
    tags: [...currentPosition?.tags ?? []],
    snapshots: { ...currentPosition?.snapshots },
    twins: { ...currentPosition?.twins },
  } satisfies IProblemV4;
}

export function getStartingColor(stipulation: Partial<IStipulation> | null | undefined): "w" | "b" {
  if (!stipulation) return "w";
  const possibile = { "1": "w", "-1": "b" } as const;
  let start: 1 | -1 = 1;
  // help (mate or stalemate) starts with black, all other stipulations start with white
  if (stipulation.problemType === "H") start = start * -1;
  // if total moves is odd, starting color is opposite of the one defined by the stipulation
  if (stipulation.moves && stipulation.moves % 2 === 1) start = start * -1;
  return possibile[start.toString() as "1" | "-1"];
}

export function getFFenFromPosition(position?: Partial<IProblemV4> | null): string {
  if (!position) return getEmptyBoardFen();
  const pos: FenPosition = {
    activeColor: getStartingColor(position.stipulation),
    castlingRights: "KQkq",
    enPassantTarget: "-",
    fullmoveNumber: 1,
    halfmoveClock: 0,
    boardSize: { height: 8, width: 8 },
    pieces: position.pieces?.reduce((aggr: PiecesOnBoard, p) => {
      const square = getCanvasLocation(p.column ?? "ColA", p.traverse ?? "Row1");
      if (!square) return aggr;
      aggr[square] = {
        type: p.appearance || "p",
        color: getCanvasColor(p.color ?? "White"),
        rotation: getCanvasRotation(p.rotation ?? "NoRotation") === "0" ? undefined : getCanvasRotation(p.rotation ?? "NoRotation"),
        fairyCondition: p.fairyAttributes?.[0] === "None" ? undefined : (p.fairyAttributes?.[0] ?? ""),
        fairyName: p.fairyCode ?? "",
      };
      return aggr;
    }, {}) ?? {},
  };
  const fen = positionToFen(pos);
  return fen;
}

/**
 * Converts a SP2 FEN string to a new format if it is in the old FFEN format.
 * @param fen
 * @returns
 */
export const convertFen = (fen: string | null | undefined) => {
  if (!fen) return "";
  if (fen.split(" ")[0].includes(":") || fen.split(" ").pop()?.startsWith("[")) {
    // OLD FFEN format, convert to new format

    // Implement any conversion logic here if needed
    return fen.replace(/\w:1/g, match => "*:0.5" + match[0])
      .replace(/\w:2/g, match => "*1" + match[0])
      .replace(/\w:3/g, match => "*1.5" + match[0])
      .replace(/\w:4/g, match => "*2" + match[0])
      .replace(/\w:5/g, match => "*2.5" + match[0])
      .replace(/\w:6/g, match => "*3" + match[0])
      .replace(/\w:7/g, match => "*3.5" + match[0])
      .replace(/[[,](\w*)(\w\d)/g, "$2:$1:,")
      .replace(/,]/g, "");
  }
  return fen;
};
