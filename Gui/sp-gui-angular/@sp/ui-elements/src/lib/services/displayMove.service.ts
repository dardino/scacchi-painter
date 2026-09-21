import { inject, Injectable, signal } from "@angular/core";
import { HalfMoveInfo } from "@dardino-chess/core";
import { Columns, Traverse } from "@sp/dbmanager/src/lib/SPX.v4";
import { CurrentProblemService, getFFenFromPosition } from "@sp/dbmanager/src/public-api";

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

  applyMoves(moves: HalfMoveInfo[]) {
    const problem = this.#problem.Problem()?.clone();
    if (!problem) return;
    // Apply the moves to the cloned problem
    for (const move of moves) {
      // Implement the logic to apply each move to the problem
      // This is a placeholder and should be replaced with actual move application logic
      const col = `Col${move.from[0].toUpperCase()}` as Columns;
      const row = `Row${move.from[1]}` as Traverse;
      const pieceToMove = problem.GetPieceAt(col, row);
      if (pieceToMove) {
        const pieceIndex = problem.pieces.indexOf(pieceToMove);
        problem.pieces.splice(pieceIndex, 1);
        const toCol = `Col${move.to[0].toUpperCase()}` as Columns;
        const toRow = `Row${move.to[1]}` as Traverse;
        const pieceToRemove = problem.GetPieceAt(toCol, toRow);
        if (pieceToRemove) {
          const removeIndex = problem.pieces.indexOf(pieceToRemove);
          problem.pieces.splice(removeIndex, 1);
        }
        pieceToMove.SetLocation(toCol, toRow);
        problem.pieces.push(pieceToMove);
      }
    }
    this.#fen.set(getFFenFromPosition(problem) ?? "");
  }
}
