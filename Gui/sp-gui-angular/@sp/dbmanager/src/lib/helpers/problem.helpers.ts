import { ChessPieceType } from "@dardino/chess-board";
import { SquareLocation } from "../helpers";
import { Piece, Problem } from "../models";
import { Columns, IPieceV4, Traverse } from "../SPX.v4";

export type FlipAxis = "x" | "y" | "\\" | "/";
export type ShiftDirection = "x" | "y" | "xy";
export type ShiftMode = "standard" | "toroidal";
export type MoveMode = "swap" | "replace";
export type RotateAngle = "clockwise" | "counterclockwise";

const getNewColumn = (boardSize: Problem["boardSize"], col: Columns, offset: number,
  mode: ShiftMode): Columns | undefined => {
  const ix = Columns.indexOf(col) + offset;
  if (mode === "standard") {
    if (ix < 0 || ix >= boardSize.columns) return undefined;
    return Columns[ix];
  }
  else if (mode === "toroidal") {
    const wrappedIx = (ix + boardSize.columns) % boardSize.columns;
    return Columns[wrappedIx];
  }
  return undefined;
};

const getNewTraverse = (boardSize: Problem["boardSize"], tra: Traverse, offset: number, mode: ShiftMode): Traverse | undefined => {
  const ix = Traverse.indexOf(tra) + offset;
  if (mode === "standard") {
    if (ix < 0 || ix >= boardSize.rows) return undefined;
    return Traverse[ix];
  }
  else if (mode === "toroidal") {
    const wrappedIx = (ix + boardSize.rows) % boardSize.rows;
    return Traverse[wrappedIx];
  }
  return undefined;
};
export class ProblemHelpers {
  // #region static helpers
  static swapPieces(problem: Problem | null, from: SquareLocation, to: SquareLocation): Problem | null {
    const p1 = problem?.GetPieceAt(from.column, from.traverse);
    const p2 = problem?.GetPieceAt(to.column, to.traverse);
    if (p2) problem = ProblemHelpers.removePiece(problem, p2);
    if (p1) problem = ProblemHelpers.removePiece(problem, p1);
    if (p2) problem = ProblemHelpers.addPieceAt(problem, from, p2);
    if (p1) problem = ProblemHelpers.addPieceAt(problem, to, p1);
    return problem;
  }

  static addPieceAt(problem: Problem | null, location: SquareLocation, piece: Piece): Problem | null {
    const newPiece: IPieceV4 = {
      appearance: piece.appearance,
      color: piece.color,
      fairyCode: piece.fairyCode,
      fairyParams: piece.fairyParams,
      rotation: piece.rotation,
      fairyAttributes: piece.fairyAttributes,
      column: location.column,
      traverse: location.traverse,
    };
    problem = ProblemHelpers.removePieceAt(problem, location);
    problem?.pieces.push(
      Piece.fromJson(newPiece),
    );
    return problem;
  }

  static removePiece(problem: Problem | null, p: Piece): Problem | null {
    const ix = problem?.pieces.indexOf(p) ?? null;
    if (ix === null || !problem) return problem;
    problem?.pieces.splice(ix, 1);
    return problem;
  }

  static movePiece(problem: Problem | null, from: SquareLocation, to: SquareLocation, mode: MoveMode): Problem | null {
    if (from.column === to.column && from.traverse === to.traverse) return null;
    if (mode === "replace") problem = ProblemHelpers.removePieceAt(problem, to);
    problem = ProblemHelpers.swapPieces(problem, from, to);
    return problem;
  }

  static removePieceAt(problem: Problem | null, location: SquareLocation): Problem | null {
    if (!problem) return null;
    const oldP = problem.GetPieceAt(location.column, location.traverse);
    if (!oldP) return problem;
    return ProblemHelpers.removePiece(problem, oldP);
  }

  static setPieceLocation(
    piece: Piece | undefined,
    location: SquareLocation,
  ): void {
    if (!piece) return;
    piece.SetLocation(location.column, location.traverse);
  }

  static recalcStipulationDesc(problem: Problem | null): Problem | null {
    if (!problem) return null;
    const { problemType, stipulationType, moves } = problem.stipulation;
    problem.stipulation.completeStipulationDesc = (problemType === "-" ? "" : problemType) + stipulationType + moves;
    return problem;
  }

  static flipBoard(problem: Problem | null | undefined, axis: FlipAxis): Problem | null {
    if (!problem) return null;
    problem.pieces.forEach((p) => {
      const newLoc = getNewFlippedLocation(problem.boardSize, p.GetLocation(), axis);
      if (!newLoc) return;
      ProblemHelpers.setPieceLocation(p, newLoc);
    });
    return problem;
  }

  static shiftBoard(
    problem: Problem | null | undefined,
    axis: ShiftDirection,
    amount: number | [x: number, y: number] = [1, 1],
    mode: "standard" | "toroidal" = "standard",
  ): Problem | null {
    if (!problem) return null;

    const [offsetXAmount = 0, offsetYAmount = 0] = Array.isArray(amount) ? amount : [amount, amount];
    // calculate offsetX and offsetY based on the shift direction and amount
    const offsetX = axis.includes("x") ? offsetXAmount : 0;
    const offsetY = axis.includes("y") ? -offsetYAmount : 0; // negate offsetY to maintain consistent direction with the board's coordinate system

    problem.pieces.slice().forEach((p) => {
      const newCol = axis.includes("x") ? getNewColumn(problem.boardSize, p.column, offsetX, mode) : p.column;
      // -offsetY is used for y-axis to maintain consistent direction
      const newRow = axis.includes("y") ? getNewTraverse(problem.boardSize, p.traverse, offsetY, mode) : p.traverse;
      if (!newCol || !newRow) {
        ProblemHelpers.removePiece(problem, p);
      }
      else {
        ProblemHelpers.setPieceLocation(p, { traverse: newRow, column: newCol });
      }
    });
    return problem;
  }

  static rotateBoard(problem: Problem | null | undefined, angle: RotateAngle): Problem | null {
    if (!problem) return null;
    // left -> a1 => h1, right -> a1 => a8
    problem.pieces.forEach((p) => {
      const newLoc = getNewRotatedLocation(problem.boardSize, p.GetLocation(), angle);
      if (!newLoc) return;
      ProblemHelpers.setPieceLocation(p, newLoc);
    });
    return problem;
  }

  static substitutePieces(
    problem: Problem | null | undefined,
    fromPiece: string,
    toPiece: string,
  ): Problem | null {
    if (!problem) return null;
    // From piece can be a standard piece like "p" for pawn or a fairy piece code
    // then search for fairy pieces with the matching code fallback to standard pieces if necessary
    const fairyPieceFrom = problem.fairyPieces().find(fp => fp.fairyCode?.toLowerCase() === fromPiece.toLowerCase()) ?? fromPiece.toLowerCase();
    const fairyPieceTo = problem.fairyPieces().find(fp => fp.fairyCode?.toLowerCase() === toPiece.toLowerCase()) ?? toPiece.toLowerCase();
    problem.pieces.forEach((p) => {
      if (Piece.matchPieceCode(p, fairyPieceFrom)) {
        p.appearance = typeof fairyPieceTo === "string"
          ? fairyPieceTo as ChessPieceType
          : p.appearance;
        p.fairyCode = typeof fairyPieceTo === "string" ? null : fairyPieceTo.fairyCode ?? p.fairyCode;
      }
    });
    return problem;
  }

  static swapColors(problem: Problem | null | undefined): Problem | null {
    if (!problem) return null;
    problem.pieces.forEach((p) => {
      p.color = p.color === "White" ? "Black" : p.color === "Black" ? "White" : p.color;
    });
    return problem;
  }

  static getTwinFromLetter(fromTwin: string, problem: Problem) {
    const twinIndex = ["a", "b", "c", "d", "e", "f", "g", "h"].indexOf(fromTwin);
    if (twinIndex !== -1) {
      return problem.twins.TwinList[twinIndex] ?? null;
    }
    return null;
  }
}

function getNewRotatedLocation(boardSize: Problem["boardSize"] | null | undefined, location: SquareLocation, angle: "clockwise" | "counterclockwise"): SquareLocation | null {
  if (!boardSize) return null;
  const { column, traverse } = location;
  let newColumn = column;
  let newTraverse = traverse;

  if (angle === "clockwise") {
    newColumn = Columns[Traverse.indexOf(traverse)];
    newTraverse = Traverse[boardSize.rows - 1 - Columns.indexOf(column)];
  }
  else if (angle === "counterclockwise") {
    newColumn = Columns[boardSize.columns - 1 - Traverse.indexOf(traverse)];
    newTraverse = Traverse[Columns.indexOf(column)];
  }

  if (!newColumn || !newTraverse) return null;
  return { column: newColumn, traverse: newTraverse };
}

function getNewFlippedLocation(boardSize: Problem["boardSize"] | null | undefined, location: SquareLocation, axis: FlipAxis): SquareLocation | null {
  if (!boardSize) return null;
  const { column, traverse } = location;
  let newColumn = column;
  let newTraverse = traverse;

  if (axis === "y") {
    newColumn = Columns[boardSize.columns - 1 - Columns.indexOf(column)];
  }
  else if (axis === "x") {
    newTraverse = Traverse[boardSize.rows - 1 - Traverse.indexOf(traverse)];
  }
  else if (axis === "/") {
    const colIndex = Columns.indexOf(column);
    const rowIndex = Traverse.indexOf(traverse);
    newColumn = Columns[rowIndex];
    newTraverse = Traverse[colIndex];
  }
  else if (axis === "\\") {
    const colIndex = Columns.indexOf(column);
    const rowIndex = Traverse.indexOf(traverse);
    newColumn = Columns[boardSize.columns - 1 - rowIndex];
    newTraverse = Traverse[boardSize.rows - 1 - colIndex];
  }

  if (!newColumn || !newTraverse) return null;
  return { column: newColumn, traverse: newTraverse };
}
