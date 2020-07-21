import { Injectable } from "@angular/core";
import { DbmanagerService } from "./dbmanager.service";
import { PieceRotation, SquareLocation, Columns, Traverse, IProblem } from "./helpers";
import { Piece } from "./models";
import { FairyPiecesCodes } from "./models/fairesDB";

@Injectable({
  providedIn: "root",
})
export class CurrentProblemService {
  constructor(private dbManager: DbmanagerService) {}
  AddPieceAt(location: SquareLocation, piece: Piece) {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;
    this.RemovePieceAt(location);
    this.dbManager.CurrentProblem?.pieces.push(
      Piece.fromJson({
        ...piece,
        column: location.column,
        traverse: location.traverse,
      })
    ); // clone
  }
  RemovePieceAt(location: SquareLocation) {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;

    const oldP = problem.GetPieceAt(location.column, location.traverse);
    if (!oldP) return;

    // remove piece;
    this.RemovePiece(oldP);
  }
  MovePiece(
    from: SquareLocation,
    to: SquareLocation,
    mode: "swap" | "replace" = "replace"
  ) {
    if (mode === "swap") return this.swapPieces(from, to);
    if (mode === "replace") return this.movePiece(from, to);
  }
  RotatePiece(location: SquareLocation, angle: PieceRotation) {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;

    const p = problem.GetPieceAt(location.column, location.traverse);
    if (p) p.rotation = angle;
  }
  SetPieceFairyAttribute(location: SquareLocation, attribute: string) {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;

    const p = problem.GetPieceAt(location.column, location.traverse);
    if (p) p.fairyAttribute = attribute;
  }
  SetCellFairyAttribute(location: SquareLocation, attribute: string) {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;
    problem.setCellFairyAttribute(location, attribute);
  }
  SetAsFairyPiece(location: SquareLocation, fairyCode: FairyPiecesCodes) {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;

    const p = problem.GetPieceAt(location.column, location.traverse);
    if (p) p.fairyCode = fairyCode;
  }
  RotateBoard(angle: "left" | "right") {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;
    problem.pieces.forEach((p) => {
      this.setPieceLocation(p, {
        column:
          Columns[
            angle === "right"
              ? 7 - Traverse.indexOf(p.traverse)
              : Traverse.indexOf(p.traverse)
          ],
        traverse:
          Traverse[
            angle === "left"
              ? 7 - Columns.indexOf(p.column)
              : Columns.indexOf(p.column)
          ],
      });
    });
  }
  FlipBoard(axis: "x" | "y") {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;
    problem.pieces.forEach((p) => {
      this.setPieceLocation(p, {
        column:
          axis === "x" ? p.column : Columns[7 - Columns.indexOf(p.column)],
        traverse:
          axis === "y"
            ? p.traverse
            : Traverse[7 - Traverse.indexOf(p.traverse)],
      });
    });
  }
  ShiftBoard(axis: "x" | "y" | "-x" | "-y") {
    const problem = this.dbManager.CurrentProblem;
    if (!problem) return;
    problem.pieces.slice().forEach((p) => {
      const newCol =
        axis === "x" || axis === "-x"
          ? addToColumn(p.column, axis === "x" ? 1 : -1)
          : p.column;
      const newRow =
        axis === "y" || axis === "-y"
          ? addToTraverse(p.traverse, axis === "y" ? -1 : 1)
          : p.traverse;
      if (!newCol || !newRow) return this.RemovePiece(p);
      this.setPieceLocation(p, { traverse: newRow, column: newCol });
    });
  }
  RemovePiece(p: Piece): void {
    const ix = this.dbManager.CurrentProblem?.pieces.indexOf(p) ?? null;
    if (ix === null) return;
    this.dbManager.CurrentProblem?.pieces.splice(ix, 1);
  }
  ClearBoard() {
    if (this.dbManager.CurrentProblem) {
      this.dbManager.CurrentProblem.pieces.length = 0;
    }
  }

  Reload(snapshotID?: keyof IProblem["snapshots"]) {
    if (!this.dbManager.CurrentProblem) return;
    this.dbManager.CurrentProblem.loadSnapshot(snapshotID, true);
  }
  Snapshot() {
    if (!this.dbManager.CurrentProblem) return;
    this.dbManager.CurrentProblem.saveSnapshot();
  }

  private swapPieces(from: SquareLocation, to: SquareLocation) {
    const p1 = this.dbManager.CurrentProblem?.GetPieceAt(from.column, from.traverse);
    const p2 = this.dbManager.CurrentProblem?.GetPieceAt(to.column, to.traverse);
    this.setPieceLocation(p1, to);
    this.setPieceLocation(p2, from);
  }
  private movePiece(from: SquareLocation, to: SquareLocation) {
    this.RemovePieceAt(to);
    this.swapPieces(from, to);
  }

  private setPieceLocation(
    piece: Piece | undefined,
    location: SquareLocation
  ): void {
    if (!piece) return;
    piece.SetLocation(location.column, location.traverse);
  }
}

function addToColumn(col: Columns, offest: 1 | -1): Columns | undefined {
  const ix = Columns.indexOf(col) + offest;
  if (ix < 0 || ix > 7) return undefined;
  return Columns[ix];
}

function addToTraverse(tra: Traverse, offest: 1 | -1): Traverse | undefined {
  const ix = Traverse.indexOf(tra) + offest;
  if (ix < 0 || ix > 7) return undefined;
  return Traverse[ix];
}
