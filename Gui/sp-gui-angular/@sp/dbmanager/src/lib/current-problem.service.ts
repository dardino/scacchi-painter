import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { DbmanagerService } from "./dbmanager.service";
import { SquareLocation, updatePositionFromFen } from "./helpers";
import { Author, Piece, Problem } from "./models";
import { FairyPiecesCodes } from "./models/fairesDB";
import { Twin } from "./models/twin";
import {
  Columns,
  EndingTypes,
  IProblem,
  PieceRotation,
  ProblemTypes,
  Traverse,
  TwinModes,
  TwinTypesKeys,
} from "./SPX";
import { TwinTypesConfigs } from "./twinTypes";

@Injectable({
  providedIn: "root",
})
export class CurrentProblemService {
  private dbManager = inject(DbmanagerService);
  // Createa signal that holds the current problem, initialized with a clone of the current problem from the DbmanagerService
  // to save the current problem in the service, we need to update the DbmanagerService.CurrentProblem signal with the current problem when we save it
  Problem = signal<Problem | null>(null);

  constructor() {
    effect(() => {
      this.Problem.set(this.dbManager.CurrentProblem()?.clone() ?? null);
    });
  }

  PasteFEN(fen: string) {
    this.Problem.update((old) => {
      if (!old) return Problem.fromFen(fen);
      updatePositionFromFen(fen, old);
      return old.clone();
    });
  }

  PasteJson(json: Partial<IProblem>) {
    this.Problem.update((old) => {
      if (!old) return Problem.fromJson(json); // if there is no current problem, create a new one from the json
      const newProblem = old.clone();
      Problem.applyJson(json, newProblem);
      return newProblem;
    });
  }

  GetJSONString(): string | null {
    const prob = this.Problem();
    if (!prob) return null;
    return JSON.stringify(prob.toJson());
  }

  SetPublicationDate(val: Date) {
    this.Problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.date = val.toISOString();
      return newProblem;
    });
  }

  textSolution = computed(() => this.Problem()?.textSolution ?? "");
  htmlSolution = computed(() => this.Problem()?.htmlSolution ?? "");

  SetStipulationMoves(v: number) {
    this.Problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.stipulation.moves = v;
      CurrentProblemService.recalcStipulationDesc(newProblem);
      return newProblem;
    });
  }

  AddTwin(twindesc: string | Twin) {
    this.Problem.update((prob) => {
      if (!prob) return prob;
      const newProblem = prob.clone();
      if (typeof twindesc === "string") {
        const [twintype, ...twinargs] = twindesc.split(" ");
        if (TwinTypesConfigs[twintype as TwinTypesKeys] == null) return newProblem;
        twindesc = Twin.fromJson({
          TwinType: twintype as TwinTypesKeys,
          TwinModes: TwinModes.Normal,
          ValueA: twinargs[0],
          ValueB: twinargs[1],
          ValueC: twinargs[2],
        });
      }
      if (newProblem.twins.HasDiagram && twindesc.TwinType === "Diagram") return newProblem; // only ONE Diagram can be accepted
      newProblem.twins.TwinList.push(twindesc);
      return newProblem;
    });
  }

  SetStipulationType(v: EndingTypes) {
    this.Problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.stipulation.stipulationType = v;
      CurrentProblemService.recalcStipulationDesc(newProblem);
      return newProblem;
    });
  }

  SetProblemType(v: ProblemTypes) {
    this.Problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.stipulation.problemType = v;
      CurrentProblemService.recalcStipulationDesc(newProblem);
      return newProblem;
    });
  }

  SetConditions(v: string[]) {
    this.Problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.conditions = v;
      return newProblem;
    });
  }

  SetTwins(v: Twin[]) {
    this.Problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.twins.TwinList = v;
      return newProblem;
    });
  }

  SetAuthors(v: Author[]) {
    this.Problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.authors = v;
      return newProblem;
    });
  }

  AddCondition(result: string | undefined) {
    if (typeof result === "string" && result.length > 0) {
      this.Problem.update((old) => {
        if (!old) return old;
        const newProblem = old.clone();
        newProblem.conditions.push(result);
        return newProblem;
      });
    }
  }

  RemoveCondition(cond: string | undefined) {
    if (typeof cond === "string" && cond.length > 0) {
      this.Problem.update((old) => {
        if (!old) return old;
        const index = old.conditions.indexOf(cond);
        const newProblem = old.clone();
        if (index > -1) newProblem.conditions.splice(index, 1);
        return newProblem;
      });
    }
  }

  RemoveTwin($event: Twin) {
    this.Problem.update((prob) => {
      if (!prob) return prob;
      const newProblem = prob.clone();
      const original = newProblem.twins.TwinList.find(f => (
        f.ValueA === $event.ValueA
        && f.ValueB === $event.ValueB
        && f.ValueC === $event.ValueC
        && f.TwinType === $event.TwinType
        && f.TwinModes === $event.TwinModes
      ));
      if (original) {
        const ix = newProblem.twins.TwinList.indexOf(original);
        if (ix > -1) newProblem.twins.TwinList.splice(ix, 1);
      }
      return newProblem;
    });
  }

  AddPieceAt(location: SquareLocation, piece: Piece) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      CurrentProblemService.addPieceAt(problem, location, piece);
      return problem.clone();
    });
  }

  RemovePieceAt(location: SquareLocation) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      CurrentProblemService.removePieceAt(problem, location);
      return problem.clone();
    });
  }

  MovePiece(
    from: SquareLocation,
    to: SquareLocation,
    mode: "swap" | "replace" = "replace",
  ) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      if (from.column === to.column && from.traverse === to.traverse) return problem;
      if (mode === "swap") CurrentProblemService.swapPieces(problem, from, to);
      if (mode === "replace") CurrentProblemService.movePiece(problem, from, to);
      return problem.clone();
    });
  }

  RotatePiece(location: SquareLocation, angle: PieceRotation) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      const p = newProblem.GetPieceAt(location.column, location.traverse);
      if (p) p.rotation = angle;
      return newProblem;
    });
  }

  SetPieceFairyAttribute(location: SquareLocation, attribute: string) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      const p = newProblem.GetPieceAt(location.column, location.traverse);
      if (p) p.fairyAttribute = attribute;
      return newProblem;
    });
  }

  SetCellFairyAttribute(location: SquareLocation, attribute: string) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.setCellFairyAttribute(location, attribute);
      return newProblem;
    });
  }

  SetAsFairyPiece(location: SquareLocation, fairyCode: FairyPiecesCodes) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      const p = newProblem.GetPieceAt(location.column, location.traverse);
      if (p) p.fairyCode = [{ code: fairyCode, params: [] }];
      return newProblem;
    });
  }

  RotateBoard(angle: "left" | "right") {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();

      newProblem.pieces.forEach((p) => {
        CurrentProblemService.setPieceLocation(p, {
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
      return newProblem;
    });
  }

  FlipBoard(axis: "x" | "y") {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.pieces.forEach((p) => {
        CurrentProblemService.setPieceLocation(p, {
          column:
            axis === "x" ? p.column : Columns[7 - Columns.indexOf(p.column)],
          traverse:
            axis === "y"
              ? p.traverse
              : Traverse[7 - Traverse.indexOf(p.traverse)],
        });
      });
      return newProblem;
    });
  }

  ShiftBoard(axis: "x" | "y" | "-x" | "-y") {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.pieces.slice().forEach((p) => {
        const delta = axis.includes("-") ? -1 : 1;
        const newCol = axis.includes("x") ? getNewColumn(p.column, delta) : p.column;
        const newRow = axis.includes("y") ? getNewTraverse(p.traverse, delta) : p.traverse;
        if (!newCol || !newRow) {
          CurrentProblemService.removePiece(newProblem, p);
        }
        else {
          CurrentProblemService.setPieceLocation(p, { traverse: newRow, column: newCol });
        }
      });
      return newProblem;
    });
  }

  ClearBoard() {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.pieces.length = 0;
      return newProblem;
    });
  }

  Reload(snapshotID?: keyof IProblem["snapshots"]) {
    this.Problem.update(() => {
      const newProblem = this.dbManager.CurrentProblem()?.clone() ?? null;
      newProblem?.loadSnapshot(snapshotID, true);
      return newProblem;
    });
  }

  UpdateSnapshot() {
    const newProblem = this.Problem()?.clone();
    if (!newProblem) return;
    newProblem.saveSnapshot(newProblem.currentSnapshotId);
    this.dbManager.CurrentProblem.set(newProblem);
    this.dbManager.SaveTemporary();
  }

  Snapshot(): string | number {
    let snapshotId: string | number = "";
    const newProblem = this.Problem()?.clone();
    if (!newProblem) return snapshotId;
    snapshotId = newProblem.saveSnapshot();
    this.dbManager.CurrentProblem.set(newProblem); // calls detectionChanges on the current problem, so that the snapshot is saved with the current state of the problem
    this.dbManager.SaveTemporary(); // updates also the localStorage with the new snapshot
    return snapshotId;
  }

  SetTextSolution(sol: string) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.textSolution = sol;
      return newProblem;
    });
  }

  SetHTMLSolution(html: string) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.htmlSolution = html;
      return newProblem;
    });
  }

  AddOrUpdateAuthor(result: Author) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      if (result.AuthorID < 0) {
        result.AuthorID = Math.max(...newProblem.authors.map(au => au.AuthorID)) + 1;
        newProblem.authors.push(result);
      }
      else {
        const real = newProblem.authors.find(au => au.AuthorID === result.AuthorID);
        if (!real) {
          newProblem.authors.push(result);
        }
        else {
          real.updateFrom(result);
        }
      }
      return newProblem;
    });
  }

  RemoveAuthor($event: Author) {
    this.Problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      const real = newProblem.authors.findIndex(au => au.AuthorID === $event.AuthorID);
      if (real >= 0) newProblem.authors.splice(real, 1);
      return newProblem;
    });
  }

  async ReloadFromDbManager(problemId: number) {
    if (this.dbManager.All().length === 0) {
      await this.dbManager.Reload(problemId);
    }
    else {
      await this.dbManager.GotoIndex(problemId);
      this.Problem.set(this.dbManager.CurrentProblem()?.clone() ?? null);
    }
  }

  private static swapPieces(problem: Problem | null, from: SquareLocation, to: SquareLocation): void {
    const p1 = problem?.GetPieceAt(from.column, from.traverse);
    const p2 = problem?.GetPieceAt(to.column, to.traverse);
    if (p2) CurrentProblemService.removePiece(problem, p2);
    if (p1) CurrentProblemService.removePiece(problem, p1);
    if (p2) CurrentProblemService.addPieceAt(problem, from, p2);
    if (p1) CurrentProblemService.addPieceAt(problem, to, p1);
  }

  private static addPieceAt(problem: Problem | null, location: SquareLocation, piece: Piece): void {
    CurrentProblemService.removePieceAt(problem, location);
    problem?.pieces.push(
      Piece.fromJson({
        ...piece,
        column: location.column,
        traverse: location.traverse,
      }),
    );
  }

  private static removePiece(problem: Problem | null, p: Piece): void {
    const ix = problem?.pieces.indexOf(p) ?? null;
    if (ix === null || !problem) return;
    problem?.pieces.splice(ix, 1);
  }

  private static movePiece(problem: Problem | null, from: SquareLocation, to: SquareLocation): void {
    CurrentProblemService.removePieceAt(problem, to);
    CurrentProblemService.swapPieces(problem, from, to);
  }

  private static removePieceAt(problem: Problem | null, location: SquareLocation): void {
    if (!problem) return;
    const oldP = problem.GetPieceAt(location.column, location.traverse);
    if (!oldP) return;
    // remove piece;
    CurrentProblemService.removePiece(problem, oldP);
  }

  private static setPieceLocation(
    piece: Piece | undefined,
    location: SquareLocation,
  ): void {
    if (!piece) return;
    piece.SetLocation(location.column, location.traverse);
  }

  private static recalcStipulationDesc(problem: Problem | null): void {
    if (!problem) return;
    const { problemType, stipulationType, moves } = problem.stipulation;
    problem.stipulation.completeStipulationDesc = (problemType === "-" ? "" : problemType) + stipulationType + moves;
    return;
  }
}

const getNewColumn = (col: Columns, offset: 1 | -1): Columns | undefined => {
  const ix = Columns.indexOf(col) + offset;
  if (ix < 0 || ix > 7) return undefined;
  return Columns[ix];
};

const getNewTraverse = (tra: Traverse, offset: 1 | -1): Traverse | undefined => {
  const ix = Traverse.indexOf(tra) + offset;
  if (ix < 0 || ix > 7) return undefined;
  return Traverse[ix];
};
