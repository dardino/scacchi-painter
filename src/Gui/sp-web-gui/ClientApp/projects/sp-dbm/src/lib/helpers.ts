
export interface Problem {
  stipulationType: string;
  moves: string;
  date: string;
  maximum: boolean;
  serie: boolean;
  prizeRank: string;
  completeStipulationDesc: string;
  personalID: string;
  prizeDescription: string;
  source: string;
  stipulation: string;
  authors: Author[];
  pieces: Piece[];
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

export interface Piece {
  appearance: string;
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
  problems: Problem[];
}

export enum PieceRotation {
  NoRotation = "NoRotation",
  Clockwise45 = "Clockwise45",
  Clockwise90 = "Clockwise90",
  Clockwise135 = "Clockwise135",
  UpsideDown = "UpsideDown",
  Counterclockwise135 = "Counterclockwise135",
  Counterclockwise90 = "Counterclockwise90",
  Counterclockwise45 = "Counterclockwise45"
}
export enum PieceColors {
  White = "White",
  Black = "Black",
  Neutral = "Neutral"
}
export const FairyAttributes = ["None"];
export type Columns =
  | "ColA"
  | "ColB"
  | "ColC"
  | "ColD"
  | "ColE"
  | "ColF"
  | "ColG"
  | "ColH";
export const Columns: [
  "ColA",
  "ColB",
  "ColC",
  "ColD",
  "ColE",
  "ColF",
  "ColG",
  "ColH"
] = ["ColA", "ColB", "ColC", "ColD", "ColE", "ColF", "ColG", "ColH"];

export type Traverse =
  | "Row1"
  | "Row2"
  | "Row3"
  | "Row4"
  | "Row5"
  | "Row6"
  | "Row7"
  | "Row8";
export const Traverse: [
  "Row8",
  "Row7",
  "Row6",
  "Row5",
  "Row4",
  "Row3",
  "Row2",
  "Row1"
] = ["Row8", "Row7", "Row6", "Row5", "Row4", "Row3", "Row2", "Row1"];

export type SquareColors = "black" | "white";

export function GetSquareColor(loc: SquareLocation): SquareColors;
export function GetSquareColor(col: Columns, row: Traverse): SquareColors;

export function GetSquareColor(
  col: Columns | SquareLocation,
  row?: Traverse
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
  row?: Traverse
): number {
  if (col == null) {
    return -1;
  }

  if (typeof col !== "string") {
    row = col.traverse;
    col = col.column;
  }
  return 1 + Columns.indexOf(col) + 8 * Traverse.indexOf(row);
}
export function GetLocationFromIndex(index: number): SquareLocation {
  return {
    column: Columns[(index - 1) % 8],
    traverse: Traverse[Math.floor((index - 1) / 8)]
  };
}
