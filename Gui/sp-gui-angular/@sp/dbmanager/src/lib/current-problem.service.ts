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
  #dbManager = inject(DbmanagerService);
  // Createa signal that holds the current problem, initialized with a clone of the current problem from the DbmanagerService
  // to save the current problem in the service, we need to update the DbmanagerService.CurrentProblem signal with the current problem when we save it
  #problem = signal<Problem | null>(null);
  public Problem = this.#problem.asReadonly();

  constructor() {
    effect(() => {
      this.#problem.set(this.#dbManager.CurrentProblem()?.clone() ?? null);
    });
  }

  private syncCurrentProblem(problem: Problem | null): Problem | null {
    const synced = problem?.clone() ?? Problem.fromJson({});
    this.#dbManager.CurrentProblem.set(synced);
    return synced;
  }

  private ensureProblem(problem: Problem | null): Problem {
    return problem ?? Problem.fromJson({});
  }

  PasteFEN(fen: string) {
    this.#problem.update((old) => {
      const next = this.ensureProblem(old);
      updatePositionFromFen(fen, next);
      return this.syncCurrentProblem(next);
    });
  }

  PasteJson(json: Partial<IProblem>) {
    this.#problem.update((old) => {
      const next = this.ensureProblem(old);
      Problem.applyJson(json, next);
      return this.syncCurrentProblem(next);
    });
  }

  GetJSONString(): string | null {
    const prob = this.#problem();
    if (!prob) return null;
    return JSON.stringify(prob.toJson());
  }

  SetPublicationDate(val: Date) {
    this.#problem.update((old) => {
      const newProblem = this.ensureProblem(old).clone();
      newProblem.date = val.toISOString();
      return this.syncCurrentProblem(newProblem);
    });
  }

  textSolution = computed(() => this.#problem()?.textSolution ?? "");
  htmlSolution = computed(() => this.#problem()?.htmlSolution ?? "");

  SetStipulationMoves(v: number) {
    this.#problem.update((old) => {
      const newProblem = this.ensureProblem(old).clone();
      newProblem.stipulation.moves = v;
      CurrentProblemService.recalcStipulationDesc(newProblem);
      return this.syncCurrentProblem(newProblem);
    });
  }

  AddTwin(twindesc: string | Twin) {
    this.#problem.update((prob) => {
      const newProblem = this.ensureProblem(prob).clone();
      if (typeof twindesc === "string") {
        const [twintype, ...twinargs] = twindesc.split(" ");
        if (TwinTypesConfigs[twintype as TwinTypesKeys] == null) return this.syncCurrentProblem(newProblem);
        twindesc = Twin.fromJson({
          TwinType: twintype as TwinTypesKeys,
          TwinModes: TwinModes.Normal,
          ValueA: twinargs[0],
          ValueB: twinargs[1],
          ValueC: twinargs[2],
        });
      }
      if (newProblem.twins.HasDiagram && twindesc.TwinType === "Diagram") return this.syncCurrentProblem(newProblem); // only ONE Diagram can be accepted
      newProblem.twins.TwinList.push(twindesc);
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetStipulationType(v: EndingTypes) {
    this.#problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.stipulation.stipulationType = v;
      CurrentProblemService.recalcStipulationDesc(newProblem);
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetProblemType(v: ProblemTypes) {
    this.#problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.stipulation.problemType = v;
      CurrentProblemService.recalcStipulationDesc(newProblem);
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetConditions(v: string[]) {
    this.#problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.conditions = v;
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetTwins(v: Twin[]) {
    this.#problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.twins.TwinList = v;
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetAuthors(v: Author[]) {
    this.#problem.update((old) => {
      if (!old) return old;
      const newProblem = old.clone();
      newProblem.authors = v;
      return this.syncCurrentProblem(newProblem);
    });
  }

  AddCondition(result: string | undefined) {
    if (typeof result === "string" && result.length > 0) {
      this.#problem.update((old) => {
        if (!old) return old;
        const newProblem = old.clone();
        newProblem.conditions.push(result);
        return this.syncCurrentProblem(newProblem);
      });
    }
  }

  RemoveCondition(cond: string | undefined) {
    if (typeof cond === "string" && cond.length > 0) {
      this.#problem.update((old) => {
        if (!old) return old;
        const index = old.conditions.indexOf(cond);
        const newProblem = old.clone();
        if (index > -1) newProblem.conditions.splice(index, 1);
        return this.syncCurrentProblem(newProblem);
      });
    }
  }

  RemoveTwin($event: Twin) {
    this.#problem.update((prob) => {
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
      return this.syncCurrentProblem(newProblem);
    });
  }

  AddPieceAt(location: SquareLocation, piece: Piece) {
    this.#problem.update((problem) => {
      const current = this.ensureProblem(problem);
      CurrentProblemService.addPieceAt(current, location, piece);
      return this.syncCurrentProblem(current);
    });
  }

  RemovePieceAt(location: SquareLocation) {
    this.#problem.update((problem) => {
      const current = this.ensureProblem(problem);
      CurrentProblemService.removePieceAt(current, location);
      return this.syncCurrentProblem(current);
    });
  }

  MovePiece(
    from: SquareLocation,
    to: SquareLocation,
    mode: "swap" | "replace" = "replace",
  ) {
    this.#problem.update((problem) => {
      const current = this.ensureProblem(problem);
      if (from.column === to.column && from.traverse === to.traverse) return this.syncCurrentProblem(current);
      if (mode === "swap") CurrentProblemService.swapPieces(current, from, to);
      if (mode === "replace") CurrentProblemService.movePiece(current, from, to);
      return this.syncCurrentProblem(current);
    });
  }

  RotatePiece(location: SquareLocation, angle: PieceRotation) {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      const p = newProblem.GetPieceAt(location.column, location.traverse);
      if (p) p.rotation = angle;
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetPieceFairyAttribute(location: SquareLocation, attribute: string) {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      const p = newProblem.GetPieceAt(location.column, location.traverse);
      if (p) p.fairyAttribute = attribute;
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetCellFairyAttribute(location: SquareLocation, attribute: string) {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.setCellFairyAttribute(location, attribute);
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetAsFairyPiece(location: SquareLocation, fairyCode: FairyPiecesCodes) {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      const p = newProblem.GetPieceAt(location.column, location.traverse);
      if (p) p.fairyCode = [{ code: fairyCode, params: [] }];
      return this.syncCurrentProblem(newProblem);
    });
  }

  RotateBoard(angle: "left" | "right") {
    this.#problem.update((problem) => {
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
      return this.syncCurrentProblem(newProblem);
    });
  }

  FlipBoard(axis: "x" | "y") {
    this.#problem.update((problem) => {
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
      return this.syncCurrentProblem(newProblem);
    });
  }

  ShiftBoard(axis: "x" | "y" | "-x" | "-y") {
    this.#problem.update((problem) => {
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
      return this.syncCurrentProblem(newProblem);
    });
  }

  ClearBoard() {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.pieces.length = 0;
      return this.syncCurrentProblem(newProblem);
    });
  }

  Reload(snapshotID?: keyof IProblem["snapshots"]) {
    this.#problem.update(() => {
      const newProblem = this.#dbManager.CurrentProblem()?.clone() ?? null;
      newProblem?.loadSnapshot(snapshotID, true);
      return this.syncCurrentProblem(newProblem);
    });
  }

  UpdateSnapshot() {
    const newProblem = this.#problem()?.clone();
    if (!newProblem) return;
    newProblem.saveSnapshot(newProblem.currentSnapshotId);
    this.#dbManager.CurrentProblem.set(newProblem);
    this.#dbManager.SaveTemporary();
  }

  Snapshot(): string | number {
    let snapshotId: string | number = "";
    const newProblem = this.#problem()?.clone();
    if (!newProblem) return snapshotId;
    snapshotId = newProblem.saveSnapshot();
    this.#dbManager.CurrentProblem.set(newProblem); // calls detectionChanges on the current problem, so that the snapshot is saved with the current state of the problem
    this.#dbManager.SaveTemporary(); // updates also the localStorage with the new snapshot
    return snapshotId;
  }

  SetTextSolution(sol: string) {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.textSolution = sol;
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetHTMLSolution(html: string) {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      newProblem.htmlSolution = html;
      return this.syncCurrentProblem(newProblem);
    });
  }

  AddOrUpdateAuthor(result: Author) {
    this.#problem.update((problem) => {
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
      return this.syncCurrentProblem(newProblem);
    });
  }

  RemoveAuthor($event: Author) {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = problem.clone();
      const real = newProblem.authors.findIndex(au => au.AuthorID === $event.AuthorID);
      if (real >= 0) newProblem.authors.splice(real, 1);
      return this.syncCurrentProblem(newProblem);
    });
  }

  SetProblem(cb: (problem: Problem) => Problem) {
    this.#problem.update((problem) => {
      if (!problem) return problem;
      const newProblem = cb(problem.clone());
      return this.syncCurrentProblem(newProblem);
    });
  }

  async ReloadFromDbManager(problemId: number) {
    if (this.#dbManager.All().length === 0) {
      await this.#dbManager.Reload(problemId);
    }
    else {
      await this.#dbManager.GotoIndex(problemId);
      this.#problem.set(this.#dbManager.CurrentProblem()?.clone() ?? null);
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
