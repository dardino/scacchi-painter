import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { DbmanagerService } from "./dbmanager.service";
import { SquareLocation, updatePositionFromFen } from "./helpers";
import { FlipAxis, ProblemHelpers } from "./helpers/problem.helpers";
import { Author, Piece, Problem } from "./models";
import { FairyPiecesCodes } from "./models/fairesDB";
import { Twin } from "./models/twin";
import {
  EndingTypes,
  IProblemV4,
  PieceRotation,
  ProblemTypes,
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
    const newProblem = ProblemHelpers.recalcStipulationDesc(this.clonedProblem());
    if (!newProblem) return;
    newProblem.stipulation.moves = v;
    ProblemHelpers.recalcStipulationDesc(newProblem);
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
    const newProblem = ProblemHelpers.recalcStipulationDesc(this.clonedProblem());
    if (!newProblem) return;
    newProblem.stipulation.stipulationType = v;
    this.syncCurrentProblem(newProblem);
  }

  SetProblemType(v: ProblemTypes) {
    const newProblem = ProblemHelpers.recalcStipulationDesc(this.clonedProblem());
    if (!newProblem) return;
    newProblem.stipulation.problemType = v;
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
    const current = ProblemHelpers.addPieceAt(this.clonedProblem(), location, piece);
    this.syncCurrentProblem(current);
  }

  RemovePieceAt(location: SquareLocation) {
    const current = ProblemHelpers.removePieceAt(this.clonedProblem(), location);
    this.syncCurrentProblem(current);
  }

  MovePiece(
    from: SquareLocation,
    to: SquareLocation,
    mode: "swap" | "replace" = "replace",
  ) {
    const current = ProblemHelpers.movePiece(this.clonedProblem(), from, to, mode);
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

    const newProblem = ProblemHelpers.addPieceAt(this.clonedProblem(), location, p);
    return this.syncCurrentProblem(newProblem);
  }

  RotateBoard(angle: "clockwise" | "counterclockwise") {
    const newProblem = ProblemHelpers.rotateBoard(this.clonedProblem(), angle);
    if (!newProblem) return;
    return this.syncCurrentProblem(newProblem);
  }

  FlipBoard(axis: FlipAxis) {
    const newProblem = ProblemHelpers.flipBoard(this.clonedProblem(), axis);
    if (!newProblem) return;
    return this.syncCurrentProblem(newProblem);
  }

  ShiftBoard(axis: "x" | "y", amount: number) {
    const newProblem = ProblemHelpers.shiftBoard(this.clonedProblem(), axis, amount);
    if (!newProblem) return;
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
}
