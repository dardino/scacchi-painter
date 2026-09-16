/**
 * This file contains the implementation of the SPX version 3 library.
 *
 * The specification for this version is obsolete and replaced by SPX version 4.
 * @deprecated Use SPX version 4 instead.
 */

import { ChessPieceType } from "@dardino/chess-board";
import { Engines } from "@sp/host-bridge/src/lib/bridge-global";
import { Author, Columns, IPieceV4, IProblemV4, IStipulation, ITwins, PieceColors, PieceRotation, Traverse } from "./SPX.v4";
import { EngineConfiguration, EngineConfigurationsByEngine } from "./models/engine";
import { FairyPiecesCodes } from "./models/fairesDB";

export interface IPieceV3 {
  appearance: ChessPieceType | "";
  color: PieceColors;
  column: Columns;
  traverse: Traverse;
  rotation: PieceRotation;
  fairyCode: ({ code: FairyPiecesCodes; params: string[] })[];
  fairyAttribute: string;
}

export interface IProblemV3 {
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
  pieces: Partial<IPieceV3>[] | null;
  twins: Partial<ITwins> | null;
  engineConfig?: EngineConfiguration | null;
  engineConfigurationsByEngine?: EngineConfigurationsByEngine | null;
  conditions: string[];
  tags: string[];
  snapshots: Record<string | number, string>;
}

function convertPiecesV3ToV4(piecesV3: Partial<IPieceV3>[] | null): Partial<IPieceV4>[] | null {
  if (!piecesV3) {
    return null;
  }
  return piecesV3.map(pieceV3 => ({
    appearance: pieceV3.appearance,
    color: pieceV3.color,
    column: pieceV3.column,
    traverse: pieceV3.traverse,
    rotation: pieceV3.rotation,
    fairyCode: pieceV3.fairyCode?.[0]?.code,
    fairyAttributes: pieceV3.fairyAttribute ? [pieceV3.fairyAttribute] : [],
  } satisfies Partial<IPieceV4>));
}

export function convertProblemV3ToV4(problemV3: Partial<IProblemV3>): Partial<IProblemV4> {
  return {
    engine: problemV3.engine,
    stipulation: problemV3.stipulation,
    htmlSolution: problemV3.htmlSolution,
    textSolution: problemV3.textSolution,
    date: problemV3.date,
    prizeRank: problemV3.prizeRank,
    personalID: problemV3.personalID,
    prizeDescription: problemV3.prizeDescription,
    source: problemV3.source,
    authors: problemV3.authors,
    pieces: convertPiecesV3ToV4(problemV3.pieces ?? null),
    twins: problemV3.twins,
    engineConfig: problemV3.engineConfig,
    engineConfigurationsByEngine: problemV3.engineConfigurationsByEngine,
    conditions: problemV3.conditions,
    tags: problemV3.tags,
    snapshots: problemV3.snapshots,
  };
}

export interface IDbSpX_V3 {
  lastIndex: number;
  name: string;
  problems: Partial<IProblemV3>[];
  version: 3;
}

export function isV3(obj: unknown): obj is IDbSpX_V3 {
  return "version" in (obj as Record<string, unknown>) && (obj as Record<string, unknown>).version === 3;
}
