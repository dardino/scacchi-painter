import { Injectable } from "@angular/core";
import { DbmanagerService } from "./dbmanager.service";
import {
  PieceRotation,
  SquareLocation,
  Columns,
  Traverse,
  IProblem,
  ProblemTypes,
  EndingTypes
} from "./helpers";
import { Author, Piece } from "./models";
import { FairyPiecesCodes } from "./models/fairesDB";
import { Twin } from "./models/twin";

@Injectable({
  providedIn: "root",
})
export class CurrentProblemService {
  SetStipulationMoves(v: number) {
    if (this.Problem) {
      this.Problem.stipulation.moves = v;
      this.recalcStipulationDesc();
    }
  }
  SetStipulationType(v: EndingTypes) {
    if (this.Problem) {
      this.Problem.stipulation.stipulationType = v;
      this.recalcStipulationDesc();
    }
  }
  SetProblemType(v: ProblemTypes) {
    if (this.Problem) {
      this.Problem.stipulation.problemType = v;
      this.recalcStipulationDesc();
    }
  }
  SetConditions(v: string[]) {
    if (this.Problem) this.Problem.conditions = v;
  }
  SetTwins(v: Twin[]) {
    if (this.Problem) this.Problem.twins.TwinList = v;
  }
  SetAuthors(v: Author[]) {
    if (this.Problem) this.Problem.authors = v;
  }
  public get Problem() {
    return this.dbManager.CurrentProblem;
  }
  constructor(private dbManager: DbmanagerService) {}
  AddCondition(result: string | undefined) {
    if (typeof result === "string" && result.length > 0 && this.Problem) {
      this.Problem.conditions.push(result);
    }
  }
  RemoveCondition(cond: string | undefined) {
    if (typeof cond === "string" && cond.length > 0 && this.Problem) {
      const index = this.Problem.conditions.indexOf(cond) ?? -1;
      if (index > -1) this.Problem.conditions.splice(index, 1);
      // clone
      this.dbManager.setCurrentProblem(this.Problem.clone());
    }
  }
  RemoveTwin($event: Twin) {
    if (!this.Problem) return;
    const original = this.Problem.twins.TwinList.find((f) => (
        f.ValueA === $event.ValueA &&
        f.ValueB === $event.ValueB &&
        f.ValueC === $event.ValueC &&
        f.TwinType === $event.TwinType &&
        f.TwinModes === $event.TwinModes
      ));
    if (original) {
      const ix = this.Problem.twins.TwinList.indexOf(original);
      this.Problem.twins.TwinList.splice(ix, 1);
      // clone
      this.dbManager.setCurrentProblem(this.Problem.clone());
    }
  }
  AddPieceAt(location: SquareLocation, piece: Piece) {
    const problem = this.Problem;
    if (!problem || !piece) return;
    this.addPieceAt(location, piece);
    // clone
    this.dbManager.setCurrentProblem(problem.clone());
  }
  RemovePieceAt(location: SquareLocation) {
    if (!this.Problem) return;
    this.removePieceAt(location);
    this.dbManager.setCurrentProblem(this.Problem.clone());
  }
  MovePiece(
    from: SquareLocation,
    to: SquareLocation,
    mode: "swap" | "replace" = "replace"
  ) {
    if (!this.Problem) return;
    if (from.column === to.column && from.traverse === to.traverse) return;
    if (mode === "swap") this.swapPieces(from, to);
    if (mode === "replace") this.movePiece(from, to);
    this.dbManager.setCurrentProblem(this.Problem.clone());
  }
  RotatePiece(location: SquareLocation, angle: PieceRotation) {
    if (!this.Problem) return;

    const p = this.Problem.GetPieceAt(location.column, location.traverse);
    if (p) p.rotation = angle;
    this.dbManager.setCurrentProblem(this.Problem.clone());
  }
  SetPieceFairyAttribute(location: SquareLocation, attribute: string) {
    if (!this.Problem) return;

    const p = this.Problem.GetPieceAt(location.column, location.traverse);
    if (p) p.fairyAttribute = attribute;
    this.dbManager.setCurrentProblem(this.Problem.clone());
  }
  SetCellFairyAttribute(location: SquareLocation, attribute: string) {
    const problem = this.Problem;
    if (!problem) return;
    problem.setCellFairyAttribute(location, attribute);
  }
  SetAsFairyPiece(location: SquareLocation, fairyCode: FairyPiecesCodes) {
    const problem = this.Problem;
    if (!problem) return;

    const p = problem.GetPieceAt(location.column, location.traverse);
    if (p) p.fairyCode = [{ code: fairyCode, params: [] }];
  }
  RotateBoard(angle: "left" | "right") {
    const problem = this.Problem;
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
    this.dbManager.setCurrentProblem(problem.clone());
  }
  FlipBoard(axis: "x" | "y") {
    const problem = this.Problem;
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
    this.dbManager.setCurrentProblem(problem.clone());
  }
  ShiftBoard(axis: "x" | "y" | "-x" | "-y") {
    const problem = this.Problem;
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
      if (!newCol || !newRow) return this.removePiece(p);
      this.setPieceLocation(p, { traverse: newRow, column: newCol });
    });
    this.dbManager.setCurrentProblem(problem.clone());
  }
  ClearBoard() {
    if (!this.Problem) return;

    this.Problem.pieces.length = 0;
    this.dbManager.setCurrentProblem(this.Problem.clone());
  }

  Reload(snapshotID?: keyof IProblem["snapshots"]) {
    if (!this.Problem) return;
    this.Problem.loadSnapshot(snapshotID, true);
    this.dbManager.setCurrentProblem(this.Problem.clone());
  }
  Snapshot() {
    if (!this.Problem) return;
    this.Problem.saveSnapshot();
  }

  private swapPieces(from: SquareLocation, to: SquareLocation) {
    const p1 = this.Problem?.GetPieceAt(from.column, from.traverse);
    const p2 = this.Problem?.GetPieceAt(to.column, to.traverse);
    if (p2) this.removePiece(p2);
    if (p1) this.removePiece(p1);
    if (p2) this.addPieceAt(from, p2);
    if (p1) this.addPieceAt(to, p1);
  }
  private addPieceAt(location: SquareLocation, piece: Piece) {
    this.removePieceAt(location);
    this.Problem?.pieces.push(
      Piece.fromJson({
        ...piece,
        column: location.column,
        traverse: location.traverse,
      })
    );
  }
  private removePiece(p: Piece): void {
    const ix = this.Problem?.pieces.indexOf(p) ?? null;
    if (ix === null || !this.Problem) return;
    this.Problem?.pieces.splice(ix, 1);
  }
  private movePiece(from: SquareLocation, to: SquareLocation) {
    this.removePieceAt(to);
    this.swapPieces(from, to);
  }
  private removePieceAt(location: SquareLocation) {
    const problem = this.Problem;
    if (!problem) return;

    const oldP = problem.GetPieceAt(location.column, location.traverse);
    if (!oldP) return;

    // remove piece;
    this.removePiece(oldP);
  }

  private setPieceLocation(
    piece: Piece | undefined,
    location: SquareLocation
  ): void {
    if (!piece) return;
    piece.SetLocation(location.column, location.traverse);
  }

  private recalcStipulationDesc() {
    if (!this.Problem) return;
    const { problemType, stipulationType, moves } = this.Problem.stipulation;
    this.Problem.stipulation.completeStipulationDesc = (problemType === "-" ? "" : problemType) + stipulationType + moves;
  }
}

const addToColumn = (col: Columns, offest: 1 | -1): Columns | undefined => {
  const ix = Columns.indexOf(col) + offest;
  if (ix < 0 || ix > 7) return undefined;
  return Columns[ix];
};

const addToTraverse = (tra: Traverse, offest: 1 | -1): Traverse | undefined => {
  const ix = Traverse.indexOf(tra) + offest;
  if (ix < 0 || ix > 7) return undefined;
  return Traverse[ix];
};
