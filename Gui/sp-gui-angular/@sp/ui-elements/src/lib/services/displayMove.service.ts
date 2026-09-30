import { inject, Injectable, signal } from "@angular/core";
import { HalfMoveInfo } from "@dardino-chess/core";
import { ChessPieceType, FairySquare } from "@dardino/chess-board";
import { parseHalfMove } from "@ph/moveParser";
import { ProblemHelpers } from "@sp/dbmanager/src/lib/helpers/problem.helpers";
import { Piece, Problem } from "@sp/dbmanager/src/lib/models";
import { SquareLocations } from "@sp/dbmanager/src/lib/models/locations";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { Columns, Traverse, TwinTypesKeys } from "@sp/dbmanager/src/lib/SPX.v4";
import { CurrentProblemService, getFFenFromPosition, SquareLocation, toSquareLocation } from "@sp/dbmanager/src/public-api";

const applyTwins: Record<TwinTypesKeys, (problem: Problem, twin: Twin) => void> = {
  AddPiece: (problem: Problem, twin: Twin) => {
    // valueA contains the color ex: "white"
    // valueB contains the piece followed by the target square ex: "Qe4"
    const color = twin.ValueA[0].toLowerCase();
    const appearance = twin.ValueB.slice(0, -2).toLowerCase();
    // valueB contains the target square ex: "e4"
    // To support 11x11 boards, we use regex to find the target column and row
    const rx = /.*([a-zA-Z]{1})(\d+)/;
    const match = rx.exec(twin.ValueB);
    const targetColumn = `Col${match?.[1].toUpperCase()}` as Columns;
    const targetTraverse = `Row${match?.[2]}` as Traverse;
    const fairyPiece = Piece.fromJson({
      color: color === "w" ? "White" : color === "b" ? "Black" : "Neutral",
      appearance: appearance as ChessPieceType,
      rotation: "NoRotation",
      ...problem.fairyPieces().find(fp => fp.fairyCode?.toLowerCase() === appearance.toLowerCase()),
      traverse: targetTraverse,
      column: targetColumn,
    });
    ProblemHelpers.addPieceAt(problem, { column: targetColumn, traverse: targetTraverse }, fairyPiece);
  },
  AfterKey: () => {
    // Implement the logic for the AfterKey twin type
  },
  ChangeProblemType: () => void 0, // ChangeProblemType doesn't change the diagram position
  RemovePiece: (problem: Problem, twin: Twin) => {
    // ValueA contains the square to remove ex: "e4"
    const rx = /.*([a-zA-Z]{1})(\d+)/;
    const match = rx.exec(twin.ValueA);
    const targetColumn = `Col${match?.[1].toUpperCase()}` as Columns;
    const targetTraverse = `Row${match?.[2]}` as Traverse;
    ProblemHelpers.removePieceAt(problem, { column: targetColumn, traverse: targetTraverse });
  },
  MovePiece: (problem: Problem, twin: Twin) => {
    const from: SquareLocation = SquareLocations[twin.ValueA as keyof typeof SquareLocations];
    const to: SquareLocation = SquareLocations[twin.ValueB as keyof typeof SquareLocations];
    ProblemHelpers.movePiece(problem, from, to, "replace");
  },
  Condition: () => void 0, // Condition doesn't change the diagram position
  Custom: () => void 0, // Custom doesn't change the diagram position
  Diagram: () => void 0, // Diagram is the starting position
  Duplex: () => void 0, // Duplex doesn't change the diagram position
  Mirror: (problem: Problem, twin: Twin) => {
    const [from, to] = twin.ValueA.replace("<-->", "|").split("|");
    if (from === "a1" && to === "a8") ProblemHelpers.flipBoard(problem, "x");
    if (from === "a1" && to === "h1") ProblemHelpers.flipBoard(problem, "y");
    if (from === "a1" && to === "h8") ProblemHelpers.flipBoard(problem, `/`);
    if (from === "a8" && to === "h1") ProblemHelpers.flipBoard(problem, "\\");
  },
  MirrorDiagonalA1H8: (problem: Problem) => {
    ProblemHelpers.flipBoard(problem, `/`);
  },
  MirrorDiagonalA8H1: (problem: Problem) => {
    ProblemHelpers.flipBoard(problem, `\\`);
  },
  MirrorHorizontal: (problem: Problem) => {
    ProblemHelpers.flipBoard(problem, "x");
  },
  MirrorVertical: (problem: Problem) => {
    ProblemHelpers.flipBoard(problem, "y");
  },
  Rotation180: (problem: Problem) => {
    ProblemHelpers.rotateBoard(problem, "clockwise");
    ProblemHelpers.rotateBoard(problem, "clockwise");
  },
  Rotation270: (problem: Problem) => {
    ProblemHelpers.rotateBoard(problem, "counterclockwise");
  },
  Rotation90: (problem: Problem) => {
    ProblemHelpers.rotateBoard(problem, "clockwise");
  },
  Stipulation: () => void 0, // Stipulation doesn't change the diagram position
  Substitute: (problem: Problem, twin: Twin) => {
    // All pieces of type {piece1} are replaced by pieces of type {piece2}. Colour and further piece specifications (like paralysing etc.) are not affected. Example: twin substitute R B. All rooks are replaced by bishops.
    ProblemHelpers.substitutePieces(problem, twin.ValueA, twin.ValueB);
  },
  SwapColors: (problem: Problem) => {
    ProblemHelpers.swapColors(problem);
  },
  SwapPieces: (problem: Problem, twin: Twin) => {
    ProblemHelpers.swapPieces(problem, toSquareLocation(twin.ValueA as FairySquare), toSquareLocation(twin.ValueB as FairySquare));
  },
  TraslateNormal: (problem: Problem, twin: Twin) => {
    // ValueA and ValueB determine the shift direction and amount:
    // ValueA indicates the starting square
    // ValueB indicates the ending square
    const { offsetX, offsetY, directionX, directionY } = getOffsetAndDirection(twin);
    ProblemHelpers.shiftBoard(problem, `${directionX}${directionY}`, [offsetX, offsetY], "standard");
  },
  TraslateToroidal: (problem: Problem, twin: Twin) => {
    const { offsetX, offsetY, directionX, directionY } = getOffsetAndDirection(twin);
    ProblemHelpers.shiftBoard(problem, `${directionX}${directionY}`, [offsetX, offsetY], "toroidal");
  },
};

function getOffsetAndDirection(twin: Twin) {
  const colIndexStart = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"].indexOf(twin.ValueA[0]);
  const colIndexEnd = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"].indexOf(twin.ValueB[0]);
  const offsetX = colIndexEnd - colIndexStart;
  const offsetY = parseInt(twin.ValueB.slice(1), 10) - parseInt(twin.ValueA.slice(1), 10);
  const directionX = offsetX !== 0 ? "x" : "" as "x";
  const directionY = offsetY !== 0 ? "y" : "" as "y";
  return { offsetX, offsetY, directionX, directionY };
}

@Injectable({
  providedIn: "root",
})
export class DisplayMoveService {
  #problem = inject(CurrentProblemService);
  #fen = signal<string | null>(null);

  fenToDisplay = this.#fen.asReadonly();

  reset() {
    this.#fen.set(null);
  }

  #applyTwin = (problem: Problem, twin: Twin) => {
    const applyTwinFn = applyTwins[twin.TwinType];
    if (applyTwinFn) {
      applyTwinFn(problem, twin);
    }
  };

  setInitialPositionOfTwin(fromTwin: string) {
    const problem = this.#problem.Problem()?.clone();
    if (!problem) return;
    // get twin from the problem based on the fromTwin identifier
    const twin = ProblemHelpers.getTwinFromLetter(fromTwin, problem);
    // If twin exists, set the initial position based on the twin
    if (twin) this.#applyTwin(problem, twin);
    this.#fen.set(getFFenFromPosition(problem) ?? "");
  }

  applyMoves(moves: HalfMoveInfo[]) {
    const problem = this.#problem.Problem()?.clone();
    if (!problem) return;
    const twin = ProblemHelpers.getTwinFromLetter(moves[0]?.fromTwin, problem);
    if (twin) this.#applyTwin(problem, twin);
    for (const move of moves) {
      this.#applyMoveToProblem(problem, move);
    }
    this.#fen.set(getFFenFromPosition(problem) ?? "");
  }

  #applyMoveToProblem = (problem: Problem, move: HalfMoveInfo) => {
    // Implement the logic to apply each move to the problem
    // This is a placeholder and should be replaced with actual move application logic
    const { column: col, traverse: row } = toSquareLocation(move.from as FairySquare);
    const { column: toCol, traverse: toRow } = toSquareLocation(move.to as FairySquare);

    const pieceToMove = problem.GetPieceAt(col, row);
    if (pieceToMove) {
      // move the piece from its current location to the target location
      const pieceIndex = problem.pieces.indexOf(pieceToMove);
      problem.pieces.splice(pieceIndex, 1);
      const capturedPiece = problem.GetPieceAt(toCol, toRow);
      if (capturedPiece) {
        const removeIndex = problem.pieces.indexOf(capturedPiece);
        problem.pieces.splice(removeIndex, 1);
      }
      pieceToMove.SetLocation(toCol, toRow);
      // Apply Promotion if any
      if (move.isPromotion) {
        if (problem.engine === "Popeye") {
          // Popeye specific promotion adjustments due to popeye using 's' for knight instead of 'n'
          if (move.promotedPiece === "s") move.promotedPiece = "n";
          if (move.promotedPiece === "S") move.promotedPiece = "N";
        }
        const fairyPieces = problem.fairyPieces().find(fp => fp.fairyCode?.toLowerCase() === move.promotedPiece.toLowerCase());
        if (fairyPieces) {
          // promotion to fairy piece
          pieceToMove.fairyCode = fairyPieces.fairyCode;
          pieceToMove.appearance = fairyPieces.appearance;
          pieceToMove.rotation = fairyPieces.rotation;
          pieceToMove.fairyAttributes = [...fairyPieces.fairyAttributes];
          pieceToMove.fairyParams = [...fairyPieces.fairyParams];
        }
        else {
          // promotion to standard chess piece
          pieceToMove.appearance = move.promotedPiece.toLowerCase() as ChessPieceType;
        }
      }
      problem.pieces.push(pieceToMove);

      move.extraMoves.forEach((extraMove) => {
        const moveToApply = parseHalfMove(move.num, move.color, move.part, extraMove, 1, move.fromTwin);
        if (moveToApply) {
          this.#applyMoveToProblem(problem, moveToApply);
        }
      });
    }
  };
}
