import {
  BoardFile,
  BoardRank,
  Colors,
  Figurine,
  Rotations,
} from "canvas-chessboard/modules/es2018/canvasChessBoard";

import { Base64 } from "./base64";

export type XMLProblemTypesKeys =
  | "Direct"
  | "Help"
  | "Self"
  | "HelpSelf"
  | "Custom";

export const ProblemTypeCodes = {
  "-": "Direct",
  H: "Help",
  S: "Self",
  HS: "HelpSelf",
  R: "Reflex",
  HR: "HelpReflex",
} as const;

export const EndingTypeCodes = {
  "#": "Mate (#)",
  "=": "Stalemate (=)",
  "+": "Check (+)",
  "%": "Gain Piece (%)",
  "~": "(~)",
  "##": "Double mate (##)",
  "==": "Double stalemate (==)",
  "#=": "(#=)",
  "!=": "(!=)",
  "!#": "(!#)",
  "00": "(00)",
  ep: "(ep)",
  Zxy: "(Zxy)",
  x: "(x)",
  "##!": "(##!)",
  ct: "(ct)",
  "<>": "(&lt;>)",
  ctr: "(ctr)",
  "<>r": "(&lt;>r)",
  c81: "(c81)",
} as const;

export type XMLStipulationTypes = "Mate" | "Stalemate" | "Custom";

export type ProblemTypes = keyof typeof ProblemTypeCodes;
export const getProblemType = (
  original: XMLProblemTypesKeys | null = "Direct"
): ProblemTypes => {
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
};
export type EndingTypes = keyof typeof EndingTypeCodes;
export const getEndingType = (original: XMLStipulationTypes): EndingTypes => {
  switch (original) {
    case "Mate":
      return "#";
    case "Stalemate":
      return "=";
    default:
      return "#";
  }
};

export interface IStipulation {
  problemType: ProblemTypes;
  stipulationType: EndingTypes;
  maximum: boolean;
  serie: boolean;
  moves: number;
  completeStipulationDesc: string;
}

export interface IProblem {
  stipulation: Partial<IStipulation>;
  htmlSolution: string;
  textSolution: string;
  date: string;
  prizeRank: number;
  personalID: string;
  prizeDescription: string;
  source: string;
  authors: Array<Partial<Author>>;
  pieces: Array<Partial<IPiece>> | null;
  twins: Partial<ITwins> | null;
  conditions: string[];
  tags: string[];
  snapshots: { [key in string | number]: string };
}

export enum SequnceTypes {
  Normal = "Normal",
}
export const TwinTypes = [
  "Custom",
  "Diagram", // no values
  "MovePiece", // 2 values
  "RemovePiece", // 1 value
  "AddPiece", // 2 values
  "Substitute", // 3 values
  "SwapPieces", // 2 values
  "Rotation90", // no value
  "Rotation180", // no value
  "Rotation270", // no value
  "TraslateNormal", // 2 value
  "TraslateToroidal", // 2 value
  "Mirror", // 1 value
  "MirrorHorizontal",
  "MirrorVertical",
  "ChangeProblemType", // 2 value
  "Duplex", // no value
  "AfterKey", // no value
  "SwapColors", // no value
  "Stipulation", // 1 value
  "Condition", // no value
] as const;

export type TwinTypesKeys = typeof TwinTypes[number];
export enum TwinModes {
  Normal = "Normal",
  Combined = "Combined",
}
export type TwinModesKeys = keyof typeof TwinModes;

export interface ITwins {
  TwinSequenceTypes?: SequnceTypes;
  TwinList?: ITwin[];
}

export interface ITwin {
  TwinType: TwinTypesKeys;
  TwinModes: TwinModes;
  ValueA: string;
  ValueB: string;
  ValueC: string;
}

export interface Author {
  nameAndSurname: string;
  address: string;
  city: string;
  phone: string;
  zipCode: string;
  stateOrProvince: string;
  country: string;
  language: string;
}

export interface IPiece {
  appearance: Figurine | "";
  fairyCode: Array<{ code: string; params: string[] }>;
  color: PieceColors;
  column: Columns;
  traverse: Traverse;
  rotation: PieceRotation;
  fairyAttribute: string;
}

export interface ProblemDb {
  version: string;
  name: string;
  lastIndex: number;
  problems: IProblem[];
}

export const FairyAttributes = ["None"] as const;
export const Columns = [
  "ColA",
  "ColB",
  "ColC",
  "ColD",
  "ColE",
  "ColF",
  "ColG",
  "ColH",
] as const;
export type Columns = typeof Columns[number];

export const Traverse = [
  "Row8",
  "Row7",
  "Row6",
  "Row5",
  "Row4",
  "Row3",
  "Row2",
  "Row1",
] as const;
export type Traverse = typeof Traverse[number];
export const PieceColors = ["White", "Black", "Neutral"] as const;
export type PieceColors = typeof PieceColors[number];

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
  return Columns.indexOf(col) + 8 * Traverse.indexOf(row);
};
export const GetLocationFromIndex = (index: number): SquareLocation => ({
  column: Columns[index % 8],
  traverse: Traverse[Math.floor(index / 8)],
});

export const PieceRotation = [
  "NoRotation",
  "Clockwise45",
  "Clockwise90",
  "Clockwise135",
  "UpsideDown",
  "Counterclockwise135",
  "Counterclockwise90",
  "Counterclockwise45",
] as const;
export type PieceRotation = typeof PieceRotation[number];

export type SP2PieceName =
  | "King"
  | "Queen"
  | "Rook"
  | "Rock"
  | "Horse"
  | "Bishop"
  | "Pawn"
  | "HorseQueen"
  | "HorseTower"
  | "HorseBishop";

export const getCanvasRotation = (rotation: PieceRotation) => {
  switch (rotation) {
    case "NoRotation":
      return Rotations.NoRotation;
    case "Clockwise45":
      return Rotations.TopRight;
    case "Clockwise90":
      return Rotations.Right;
    case "Clockwise135":
      return Rotations.BottomRight;
    case "UpsideDown":
      return Rotations.UpsideDown;
    case "Counterclockwise135":
      return Rotations.BottomLeft;
    case "Counterclockwise90":
      return Rotations.Left;
    case "Counterclockwise45":
      return Rotations.TopLeft;
    default:
      return Rotations.NoRotation;
  }
};

export const getCanvasLocation = (x: Columns, y: Traverse) => {
  if (typeof x !== "string" || typeof y !== "string") {
    return { col: BoardFile.A, row: BoardRank.R1 };
  }
  return {
    col: getBoardFile(x),
    row: getBoardRank(y),
  };
};
export const getBoardFile = (x: string | Columns): BoardFile => {
  if (typeof x === "number") x = Columns[x];
  x = x.substr(3, 1); // extract col from "ColA";
  return BoardFile[x as keyof typeof BoardFile];
};
export const getBoardRank = (y: string | Traverse): BoardRank => {
  if (typeof y === "number") y = Traverse[y];
  y = y.substr(3, 1); // extract row from "Row8";
  return BoardRank[`R${y}` as keyof typeof BoardRank];
};

export const getCanvasColor = (c: PieceColors): Colors => {
  switch (c) {
    case "Black":
      return "black";
    case "Neutral":
      return "neutral";
    case "White":
    default:
      return "white";
  }
};

export const getFigurine = (appearance?: string): Figurine | null => {
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

const RotationsCodeMap: {
  [key in RotationsCodes]: PieceRotation;
} = {
  "+ ": "NoRotation",
  "+/": "Clockwise45",
  "+-": "Clockwise90",
  "+\\": "Clockwise135",
  "- ": "UpsideDown",
  "-/": "Counterclockwise135",
  "--": "Counterclockwise90",
  "-\\": "Counterclockwise45",
};

export const getRotationSymbol = (rotation: IPiece["rotation"]): string =>
  mapRotations[rotation];

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

export const GetSolutionFromElement = async (el: Element) => {
  let solText: HTMLElement[];

  const sol = el.querySelector("Solution")?.innerHTML;
  const solRft = el.querySelector("SolutionRtf");
  let solDec = sol ? Base64.decode(sol) : "";

  if (solRft != null && solRft.innerHTML.length > 0) {
    try {
      solText = await convertFromRtf(
        Base64.decode(solRft.innerHTML).replace(/[\r\n]+/g, "\n")
      );
    } catch (err) {
      console.error(err);
      solText = [];
    }
    if (solDec === "") solDec = solText.map(row => row.innerText).join("\n");
  } else {
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

export const rowToPieces = (row1: string): Array<Partial<IPiece> | null> => {
  const fairies = /\{[a-z]*\}/.exec(row1);
  const piecesStrings = getPiecesString(row1);

  const pieces: Array<Partial<IPiece> | null> = [];
  let f = 0;
  for (const c of piecesStrings) {
    // empty cell
    if (c === "#") {
      pieces.push(null);
      continue;
    }
    const isNeutral = c.startsWith("*");
    const pieceName = (isNeutral ? c.substring(1, 2) : c.substring(0, 1)) as Figurine;
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
    const fairyCode = fairy?.replace(/[{}]/g, "").split("+").map((fp) => ({ code: fp, params: [] }));
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
  const pieces = fenrows.map((f) => rowToPieces(f));
  const cells = pieces.reduce<Array<Partial<IPiece> | null>>(
    (a, b, i, m) => a.concat(b),
    []
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
  } else {
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
  } catch (err) {
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
    "{\\pard \\brdrb \\brdrs \\brdrw10 \\brsp20 \\par}\n{\\pard\\par}\n"
  );
  richText = richText.replace(
    /<(?:br)(?:\s+[^>]*)?\s*\/?>/gi,
    "{\\pard\\par}\n"
  );

  // Empty tags
  richText = richText.replace(
    /<(?:p|div|section|article)(?:\s+[^>]*)?\s*\/>/gi,
    "{\\pard\\par}\n"
  );
  richText = richText.replace(/<(?:[^>]+)\/>/g, "");

  // Hyperlinks
  richText = richText.replace(
    /<a(?:\s+[^>]*)?(?:\s+href=(["'])(?:javascript:void\(0?\);?|#|return false;?|void\(0?\);?|)\1)(?:\s+[^>]*)?>/gi,
    "{{{\n"
  );
  const tmpRichText = richText;
  richText = richText.replace(
    /<a(?:\s+[^>]*)?(?:\s+href=(["'])(.+)\1)(?:\s+[^>]*)?>/gi,
    '{\\field{\\*\\fldinst{HYPERLINK\n "$2"\n}}{\\fldrslt{\\ul\\cf1\n'
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
    "{\\pard\n"
  );

  // End tags
  richText = richText.replace(
    /<\/(?:p|div|section|article)(?:\s+[^>]*)?>/gi,
    "\n\\par}\n"
  );
  richText = richText.replace(
    /<\/(?:b|strong|i|em|u|ins|strike|del|sup|sub)(?:\s+[^>]*)?>/gi,
    "\n}"
  );

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
    "application/xml"
  );
  return dom.querySelector(elName) as Element;
};

export const prettifyXml = (sourceXml: string | Document) => {
  const xmlDoc = typeof sourceXml === "string" ? new DOMParser().parseFromString(sourceXml, "application/xml") : sourceXml;
  const xsltDoc = new DOMParser().parseFromString(
    [
      // describes how we want to modify the XML - indent everything
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '  <xsl:strip-space elements="*"/>',
      '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
      '    <xsl:value-of select="normalize-space(.)"/>',
      "  </xsl:template>",
      '  <xsl:template match="node()|@*">',
      '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
      "  </xsl:template>",
      '  <xsl:output indent="yes"/>',
      "</xsl:stylesheet>",
    ].join("\n"),
    "application/xml"
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
