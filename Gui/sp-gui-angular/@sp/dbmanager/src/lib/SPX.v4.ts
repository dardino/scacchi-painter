import { type ChessPieceType } from "@dardino/chess-board";
import { Engines } from "@sp/host-bridge/src/lib/bridge-global";
import { EngineConfiguration, EngineConfigurationsByEngine } from "./models/engine";
import { FairyPiecesCodes } from "./models/fairesDB";

/**
 * This file contains the types and interfaces used in the SPX module.
 */

// Types of Stipulations
export const ProblemTypeCodes = {
  "-": "Direct",
  "H": "Help",
  "S": "Self",
  "HS": "HelpSelf",
  "R": "Reflex",
  "HR": "HelpReflex",
} as const;
export type ProblemTypes = keyof typeof ProblemTypeCodes;

// Stipulation ending types
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
  "ep": "(ep)",
  "Zxy": "(Zxy)",
  "x": "(x)",
  "##!": "(##!)",
  "ct": "(ct)",
  "<>": "(&lt;>)",
  "ctr": "(ctr)",
  "<>r": "(&lt;>r)",
  "c81": "(c81)",
} as const;
export type EndingTypes = keyof typeof EndingTypeCodes;

// Stipulation interface
export interface IStipulation {
  problemType: ProblemTypes;
  stipulationType: EndingTypes;
  maximum: boolean;
  serie: boolean;
  moves: number;
  completeStipulationDesc: string;
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

// #region Piece properties
export const PieceColors = ["White", "Black", "Neutral"] as const;
export type PieceColors = typeof PieceColors[number];
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

export interface IPieceV4 {
  appearance: ChessPieceType | "";
  color: PieceColors;
  column: Columns;
  traverse: Traverse;
  rotation: PieceRotation;
  fairyCode: FairyPiecesCodes | null;
  fairyParams: string[];
  fairyAttributes: string[];
}
// #endregion

// #region Twin properties

export enum SequenceTypes {
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
  "MirrorDiagonalA1H8",
  "MirrorDiagonalA8H1",
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

export interface ITwin {
  TwinType: TwinTypesKeys;
  TwinModes: TwinModes;
  ValueA: string;
  ValueB: string;
  ValueC: string;
}

export interface ITwins {
  TwinSequenceTypes?: SequenceTypes;
  TwinList?: ITwin[];
}
// #endregion

export interface IProblemV4 {
  engine?: Engines;
  stipulation: Partial<IStipulation>;
  htmlSolution: string;
  textSolution: string;
  date: string;
  prizeRank: number;
  personalID: string;
  prizeDescription: string;
  source: string;
  authors: Partial<Author>[];
  pieces: Partial<IPieceV4>[] | null;
  twins: Partial<ITwins> | null;
  engineConfig?: EngineConfiguration | null;
  engineConfigurationsByEngine?: EngineConfigurationsByEngine | null;
  conditions: string[];
  tags: string[];
  snapshots: Record<string, string>;
}

export interface IDbSpX_V4 {
  lastIndex: number;
  name: string;
  problems: Partial<IProblemV4>[];
  version: 4;
}

export function isV4(obj: unknown): obj is IDbSpX_V4 {
  return "version" in (obj as Record<string, unknown>) && (obj as Record<string, unknown>).version === 4;
}

const fullIsoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
export function adjustDate(date: string | null | undefined): string | null {
  if (!date) return null;
  // if date matches reges of full iso date let them unchanged
  if (fullIsoDateRegex.test(date)) return date;
  // if the date string does not include milliseconds, add them
  // this date: 2010-12-16T23:00:00Z
  // should be this: 2010-12-16T23:00:00.000Z
  if (!date.includes(".")) {
    const parts = date.split("Z");
    date = `${parts[0]}.000Z`;
  }
  return date;
}

export function verifyProblemV4(obj: IDbSpX_V4): IDbSpX_V4 {
  return {
    ...obj,
    problems: obj.problems.map(p => ({
      ...p,
      date: adjustDate(p.date) ?? "1970-01-01T00:00:00.000Z",
    })),
  };
}
