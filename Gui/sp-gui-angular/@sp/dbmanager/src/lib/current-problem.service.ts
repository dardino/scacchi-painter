import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { DbmanagerService } from "./dbmanager.service";
import { SquareLocation, updatePositionFromFen } from "./helpers";
import { Author, Piece, Problem } from "./models";
import { FairyPiecesCodes } from "./models/fairesDB";
import { Twin } from "./models/twin";
import {
  Columns,
  EndingTypes,
  IPieceV4,
  IProblemV4,
  PieceRotation,
  ProblemTypes,
  Traverse,
  TwinModes,
  TwinTypesKeys,
} from "./SPX.v4";
import { TwinTypesConfigs } from "./twinTypes";

@Injectable({
  providedIn: "root",
})
export class CurrentProblemService {
  #dbManager = inject(DbmanagerService);
  // Createa signal that holds the current problem, initialized with a clone of the current problem from the DbmanagerService
  // to save the current problem in the service, we need to update the DbmanagerService.CurrentProblem signal with the current problem when we save it
  #_problem = signal<Problem | null>(null);
  public Problem = this.#_problem.asReadonly();
  public textSolution = computed(() => this.#_problem()?.textSolution ?? "");
  public htmlSolution = computed(() => this.#_problem()?.htmlSolution ?? "");

  constructor() {
    effect(() => {
      this.#_problem.set(this.#dbManager.CurrentProblem()?.clone() ?? null);
    });
  }

  private syncCurrentProblem(problem: Problem | null): void {
    const synced = problem ?? Problem.fromJson({});
    this.#_problem.set(synced);
  }

  private clonedProblem(): Problem {
    return this.#_problem()?.clone() ?? Problem.fromJson({});
  }

  PasteFEN(fen: string) {
    const next = this.clonedProblem();
    const updatedProblem = updatePositionFromFen(fen, next);
    this.PasteJson(updatedProblem);
  }

  PasteJson(json: Partial<IProblemV4>) {
    const next = this.clonedProblem();
    Problem.applyJson(json, next);
    this.syncCurrentProblem(next);
  }

  GetJSONString(): string | null {
    const prob = this.clonedProblem();
    return JSON.stringify(prob.toJson());
  }

  SetPublicationDate(val: Date) {
    const newProblem = this.clonedProblem();
    newProblem.date = val.toISOString();
    this.syncCurrentProblem(newProblem);
  }

  SetStipulationMoves(v: number) {
    const newProblem = this.clonedProblem();
    newProblem.stipulation.moves = v;
    CurrentProblemService.recalcStipulationDesc(newProblem);
    this.syncCurrentProblem(newProblem);
  }

  AddTwin(twindesc: string | Twin) {
    const newProblem = this.clonedProblem();
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
    if (newProblem.twins.HasDiagram && twindesc.TwinType === "Diagram")
      return this.syncCurrentProblem(newProblem); // only ONE Diagram can be accepted
    newProblem.twins.TwinList.push(twindesc);
    this.syncCurrentProblem(newProblem);
  }

  SetStipulationType(v: EndingTypes) {
    const newProblem = this.clonedProblem();
    newProblem.stipulation.stipulationType = v;
    CurrentProblemService.recalcStipulationDesc(newProblem);
    this.syncCurrentProblem(newProblem);
  }

  SetProblemType(v: ProblemTypes) {
    const newProblem = this.clonedProblem();
    newProblem.stipulation.problemType = v;
    CurrentProblemService.recalcStipulationDesc(newProblem);
    this.syncCurrentProblem(newProblem);
  }

  SetConditions(v: string[]) {
    const newProblem = this.clonedProblem();
    newProblem.conditions = v;
    this.syncCurrentProblem(newProblem);
  }

  SetSource(val: string) {
    const newProblem = this.clonedProblem();
    newProblem.source = val;
    this.syncCurrentProblem(newProblem);
  }

  SetPersonalID(val: string) {
    const newProblem = this.clonedProblem();
    newProblem.personalID = val;
    this.syncCurrentProblem(newProblem);
  }

  SetAward(val: Partial<{ rank: number; description: string }>) {
    const newProblem = this.clonedProblem();
    newProblem.prizeRank = val.rank ?? newProblem.prizeRank;
    newProblem.prizeDescription = val.description ?? newProblem.prizeDescription;
    this.syncCurrentProblem(newProblem);
  }

  SetTags(v: string[]): void {
    const newProblem = this.clonedProblem();
    newProblem.tags = v;
    this.syncCurrentProblem(newProblem);
  }

  SetTwins(v: Twin[]): void {
    const newProblem = this.clonedProblem();
    newProblem.twins.TwinList = v;
    this.syncCurrentProblem(newProblem);
  }

  SetAuthors(v: Author[]): void {
    const newProblem = this.clonedProblem();
    newProblem.authors = v;
    this.syncCurrentProblem(newProblem);
  }

  AddCondition(result: string | undefined): void {
    if (typeof result === "string" && result.length > 0) {
      const newProblem = this.clonedProblem();
      newProblem.conditions.push(result);
      this.syncCurrentProblem(newProblem);
    }
  }

  RemoveCondition(cond: string | undefined) {
    if (typeof cond === "string" && cond.length > 0) {
      const old = this.clonedProblem();
      const index = old.conditions.indexOf(cond);
      const newProblem = old.clone();
      if (index > -1) newProblem.conditions.splice(index, 1);
      this.syncCurrentProblem(newProblem);
    }
  }

  RemoveTwin($event: Twin) {
    const prob = this.clonedProblem();
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
    this.syncCurrentProblem(newProblem);
  }

  AddPieceAt(location: SquareLocation, piece: Piece) {
    const current = this.clonedProblem();
    CurrentProblemService.addPieceAt(current, location, piece);
    this.syncCurrentProblem(current);
  }

  RemovePieceAt(location: SquareLocation) {
    const current = this.clonedProblem();
    CurrentProblemService.removePieceAt(current, location);
    this.syncCurrentProblem(current);
  }

  MovePiece(
    from: SquareLocation,
    to: SquareLocation,
    mode: "swap" | "replace" = "replace",
  ) {
    if (from.column === to.column && from.traverse === to.traverse) return;
    const current = this.clonedProblem();
    if (mode === "swap") CurrentProblemService.swapPieces(current, from, to);
    if (mode === "replace") CurrentProblemService.movePiece(current, from, to);
    this.syncCurrentProblem(current);
  }

  RotatePiece(location: SquareLocation, angle: PieceRotation) {
    const newProblem = this.clonedProblem();
    const p = newProblem.GetPieceAt(location.column, location.traverse);
    if (p) p.rotation = angle;
    this.syncCurrentProblem(newProblem);
  }

  SetPieceFairyAttribute(location: SquareLocation, attribute: string) {
    const newProblem = this.clonedProblem();
    const p = newProblem.GetPieceAt(location.column, location.traverse);
    if (p && !p.fairyAttributes.includes(attribute)) p.fairyAttributes.push(attribute);
    return this.syncCurrentProblem(newProblem);
  }

  SetCellFairyAttribute(location: SquareLocation, attribute: string) {
    const newProblem = this.clonedProblem();
    newProblem.setCellFairyAttribute(location, attribute);
    return this.syncCurrentProblem(newProblem);
  }

  GetPieceAt(location: SquareLocation) {
    const current = this.clonedProblem();
    return current.GetPieceAt(location.column, location.traverse);
  }

  SetAsFairyPiece(location: SquareLocation,
    fairyAttributes: string[] = [],
    fairyCode: FairyPiecesCodes | null,
    fairyParams: string[] = [],
  ) {
    const p = this.GetPieceAt(location);
    if (!p) return;
    p.fairyCode = fairyCode;
    p.fairyParams = fairyParams;
    p.fairyAttributes = fairyAttributes;

    const newProblem = this.clonedProblem();
    CurrentProblemService.addPieceAt(newProblem, location, p);
    return this.syncCurrentProblem(newProblem);
  }

  RotateBoard(angle: "left" | "right") {
    const newProblem = this.clonedProblem();
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
  }

  FlipBoard(axis: "x" | "y") {
    const newProblem = this.clonedProblem();
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
  }

  ShiftBoard(axis: "x" | "y" | "-x" | "-y") {
    const newProblem = this.clonedProblem();
    if (!newProblem) return;
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
  }

  ClearBoard() {
    const newProblem = this.clonedProblem();
    if (!newProblem) return;
    newProblem.pieces.length = 0;
    return this.syncCurrentProblem(newProblem);
  }

  UpdateSnapshot() {
    const newProblem = this.clonedProblem();
    if (!newProblem) return;
    newProblem.saveSnapshot(newProblem.currentSnapshotId);
    this.#dbManager.SetCurrentProblem(newProblem);
    this.#dbManager.SaveTemporary();
  }

  Snapshot(): string | number {
    let snapshotId: string | number = "";
    const newProblem = this.clonedProblem();
    if (!newProblem) return snapshotId;
    snapshotId = newProblem.saveSnapshot();
    this.#dbManager.SetCurrentProblem(newProblem); // calls detectionChanges on the current problem, so that the snapshot is saved with the current state of the problem
    this.#dbManager.SaveTemporary(); // updates also the localStorage with the new snapshot
    return snapshotId;
  }

  SetTextSolution(sol: string) {
    const problem = this.clonedProblem();
    const newProblem = problem.clone();
    newProblem.textSolution = sol;
    return this.syncCurrentProblem(newProblem);
  }

  SetHTMLSolution(html: string) {
    const newProblem = this.clonedProblem();
    newProblem.htmlSolution = html;
    return this.syncCurrentProblem(newProblem);
  }

  AddOrUpdateAuthor(result: Author) {
    const newProblem = this.clonedProblem();
    if (result.authorId < 0) {
      result.authorId = Math.max(...newProblem.authors.map(au => au.authorId), -1) + 1;
      newProblem.authors.push(result);
    }
    else {
      const real = newProblem.authors.find(au => au.authorId === result.authorId);
      if (!real) {
        newProblem.authors.push(result);
      }
      else {
        real.updateFrom(result);
      }
    }
    return this.syncCurrentProblem(newProblem);
  }

  RemoveAuthor($event: Author) {
    const newProblem = this.clonedProblem();
    const real = newProblem.authors.findIndex(au => au.authorId === $event.authorId);
    if (real >= 0) newProblem.authors.splice(real, 1);
    return this.syncCurrentProblem(newProblem);
  }

  SetProblem(cb: (problem: Problem) => Problem) {
    const problem = this.clonedProblem();
    const newProblem = cb(problem);
    return this.syncCurrentProblem(newProblem);
  }

  RemoveFairyInfoAt(location: SquareLocation) {
    const newProblem = this.clonedProblem();
    const piece = newProblem.GetPieceAt(location.column, location.traverse);
    if (piece) {
      piece.fairyCode = null;
      piece.fairyAttributes = [];
      piece.fairyParams = [];
    }
    return this.syncCurrentProblem(newProblem);
  }

  Reload(snapshotID?: keyof IProblemV4["snapshots"]) {
    const newProblem = this.#dbManager.CurrentProblem()?.clone() ?? null;
    newProblem?.loadSnapshot(snapshotID, true);
    return this.syncCurrentProblem(newProblem);
  }

  RemoveSnapshot(id: number | string) {
    const newProblem = this.clonedProblem();
    newProblem.deleteSnapshot(id);
    return this.syncCurrentProblem(newProblem);
  }

  async ReloadFromDbManager(problemId: number) {
    if (this.#dbManager.All().length === 0) {
      await this.#dbManager.Reload(problemId);
    }
    else {
      await this.#dbManager.GotoIndex(problemId);
      this.syncCurrentProblem(this.#dbManager.CurrentProblem()?.clone() ?? null);
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
    CurrentProblemService.removePieceAt(problem, location);
    problem?.pieces.push(
      Piece.fromJson(newPiece),
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
