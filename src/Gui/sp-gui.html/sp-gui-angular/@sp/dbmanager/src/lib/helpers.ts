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
export const FairyAttributes = ["None"];
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
  return 1 + Columns.indexOf(col) + 8 * Traverse.indexOf(row);
}
export function GetLocationFromIndex(index: number): SquareLocation {
  return {
    column: Columns[index % 8],
    traverse: Traverse[Math.floor(index / 8)],
  };
}
