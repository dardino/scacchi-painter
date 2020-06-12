import {
  Rotations,
  Colors,
  BoardRank,
  BoardFile,
  Figurine
} from "canvas-chessboard/modules/es2018/canvasChessBoard";

export enum ProblemTypes {
  Direct,
  Help,
  HelpSelf,
  Self,
}
export type ProblemTypesKeys = keyof typeof ProblemTypes;

export enum StipulationTypes {
  Mate,
  Stale,
}

export interface IStipulation {
  problemType: ProblemTypes;
  stipulationType: StipulationTypes;
  maximum: boolean;
  serie: boolean;
  moves: number;
  completeStipulationDesc: string;
}

export interface XmlProblem {
  stipulation: IStipulation;
  htmlSolution: string;
  date: string;
  prizeRank: string;
  personalID: string;
  prizeDescription: string;
  source: string;
  authors: Author[];
  pieces: IPiece[] | null;
  twins: ITwins | null;
}

export enum SequnceTypes {
  Normal,
}
export enum TwinTypes {
  Custom = -1,
  Diagram = 0, // no values
  MovePiece = 1, // 2 values
  RemovePiece = 2, // 1 value
  AddPiece = 3, // 2 values
  Substitute = 4, // 3 values
  SwapPieces = 5, // 2 values
  Rotation90 = 6, // no value
  Rotation180 = 7, // no value
  Rotation270 = 8, // no value
  TraslateNormal = 9, // 2 value
  TraslateToroidal = 10, // 2 value
  MirrorHorizontal = 11, // no value
  MirrorVertical = 12, // no value
  ChangeProblemType = 13, // 2 value
  Duplex = 14, // no value
  AfterKey = 15, // no value
  SwapColors = 16, // no value
  Stipulation = 17, // 1 value
}

export type TwinTypesKeys = keyof typeof TwinTypes;
export enum TwinModes {
  Normal,
}
export type TwinModesKeys = keyof typeof TwinModes;

export interface ITwins {
  TwinSequenceTypes: SequnceTypes;
  Twins: ITwin[];
}

export interface ITwin {
  TwinType: TwinTypes;
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
  fairyCode: string;
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
  problems: XmlProblem[];
}

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
export const PieceColors = ["White", "Black", "Neutral"] as const;
export type PieceColors = typeof PieceColors[number];
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

export type SquareColors = "black" | "white";

export function GetSquareColor(loc: SquareLocation): SquareColors;
export function GetSquareColor(col: Columns, row: Traverse): SquareColors;

export function GetSquareColor(
  col: Columns | SquareLocation,
  row: Traverse = Traverse[0]
): SquareColors {
  if (col == null) {
    return "white";
  }
  if (typeof col !== "string") {
    row = col.traverse;
    col = col.column;
  }

  return ((Columns.indexOf(col) % 2) + Traverse.indexOf(row)) % 2
    ? "black"
    : "white";
}

export interface SquareLocation {
  column: Columns;
  traverse: Traverse;
}

export function GetSquareIndex(loc: SquareLocation): number;
export function GetSquareIndex(col: Columns, row: Traverse): number;
export function GetSquareIndex(
  col: Columns | SquareLocation,
  row: Traverse = Traverse[0]
): number {
  if (col == null) {
    return -1;
  }
  if (typeof col !== "string") {
    row = col.traverse;
    col = col.column;
  }
  return Columns.indexOf(col) + 8 * Traverse.indexOf(row);
}
export function GetLocationFromIndex(index: number): SquareLocation {
  return {
    column: Columns[index % 8],
    traverse: Traverse[Math.floor(index / 8)],
  };
}

export function getTraverse(f: Element): Traverse | null {
  return Traverse[
    Math.max(
      Traverse.indexOf((f.getAttribute("Traverse") as Traverse) || "Row1"),
      0
    )
  ];
}

export function getFairyCode(f: Element): string {
  const ft = f.querySelectorAll("FairyType");
  if (ft.length > 0) {
    // TODO: supporto MultiType
    return ft[0].getAttribute("code") ?? "";
  } else {
    return "";
  }
}

export function getFairyAttribute(f: Element): string {
  return f.getAttribute("FairyAttribute") ?? "";
}

export function getColum(f: Element): Columns | null {
  return Columns[
    Math.max(
      Columns.indexOf((f.getAttribute("Column") as Columns) || "ColA"),
      0
    )
  ];
}

export function getAppearance(f: Element): Figurine | "" {
  const pieceName = f.getAttribute("Type");
  switch (pieceName) {
    case "King":
      return "k";
    case "Queen":
      return "q";
    case "Rook":
    /* @deprecated */ case "Rock":
      return "r";
    case "Horse":
      return "n";
    case "Bishop":
      return "b";
    case "Pawn":
      return "p";
    case "HorseQueen":
      return "e";
    case "HorseTower":
      return "t";
    case "HorseBishop":
      return "a";
    default:
      return "";
  }
}

export function getRotation(rotation: Element) {
  return (rotation.getAttribute("Rotation") as PieceRotation) ?? "NoRotation";
}

export function getCanvasRotation(rotation: PieceRotation) {
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
}

export function getCanvasLocation(x: Columns, y: Traverse) {
  if (typeof x !== "string" || typeof y !== "string") {
    return { col: BoardFile.A, row: BoardRank.R1 };
  }
  return {
    col: getBoardFile(x),
    row: getBoardRank(y),
  };
}
export function getBoardFile(x: string | Columns): BoardFile {
  if (typeof x === "number") x = Columns[x];
  x = x.substr(3, 1); // extract col from "ColA";
  return BoardFile[x as keyof typeof BoardFile];
}
export function getBoardRank(y: string | Traverse): BoardRank {
  if (typeof y === "number") y = Traverse[y];
  y = y.substr(3, 1); // extract row from "Row8";
  return BoardRank[`R${y}` as keyof typeof BoardRank];
}

export function getColor(c: Element): PieceColors {
  return c.getAttribute("Color") as PieceColors;
}

export function getCanvasColor(c: PieceColors): Colors {
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

export function getFigurine(appearance?: string): Figurine | null {
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

export function getRotationSymbol(rotation: IPiece["rotation"]): string {
  return mapRotations[rotation];
}

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

export function GetSolutionFromElement(el: Element): string {
  const sol = el.querySelector("Solution");
  if (!sol) return "";
  return atob(sol.innerHTML);
}

export function GetTwins(el: Element): Element[] {
  const twins = el.querySelectorAll("Twin");
  return Array.from(twins);
}
