import { Piece } from "./piece";
import {
  Columns,
  Traverse,
  GetSolutionFromElement,
  IProblem,
} from "../helpers";
import { Twins } from "./twins";
import { Stipulation } from "./stipulation";
import { Author } from "./author";

const main_snapshot = "$_MAIN_$";

export class Problem implements IProblem {
  private constructor() {}

  public date = new Date().toLocaleString();
  public stipulation = Stipulation.fromJson({});
  public prizeRank = "";
  public personalID = "";
  public prizeDescription = "";
  public source = "";
  public authors: Author[] = [];
  public pieces: Piece[] = [];
  public twins = Twins.fromJson({});
  public htmlSolution = "";
  public conditions: string[] = [];

  public snapshots: IProblem["snapshots"] = {};
  private currentSnapshotId: keyof IProblem["snapshots"] = main_snapshot;
  private get snap_keys(): Array<string | number> {
    return Object.keys(this.snapshots).filter(
      (f) => this.snapshots[f] != null
    );
  }

  static fromElement(source: Element) {
    const p = new Problem();
    p.stipulation = Stipulation.fromElement(source);
    p.pieces = Array.from(source.querySelectorAll("Piece")).map(
      Piece.fromElement
    );
    p.twins = Twins.fromElement(source.querySelector("Twins") ?? null);
    p.htmlSolution = GetSolutionFromElement(source);
    p.date = source.getAttribute("Date") ?? "";
    p.prizeRank = source.getAttribute("PrizeRank") ?? "";
    p.personalID = source.getAttribute("PersonalID") ?? "";
    p.prizeDescription = source.getAttribute("PrizeDescription") ?? "";
    p.source = source.getAttribute("Source") ?? "";
    p.authors = Array.from(source.querySelectorAll("Authors")).map((a) =>
      Author.fromElement(a)
    );
    p.conditions = Array.from(source.querySelectorAll("Conditions") ?? []).map(
      (el) => el.nodeValue ?? ""
    );

    p.snapshots = {};
    p.saveSnapshot(main_snapshot);

    return p;
  }

  static fromJson(jsonObj: Partial<IProblem>): Problem {
    const p = new Problem();
    Problem.applyJson(jsonObj, p);
    p.snapshots = { ...jsonObj.snapshots };
    return p;
  }

  static applyJson(a: Partial<IProblem>, b: Problem) {
    if (a.authors?.length ?? 0)
      b.authors = (b.authors ?? []).map((p) => Author.fromJson(p));
    if (a.pieces?.length ?? 0)
      b.pieces = (a.pieces ?? []).map((p) => Piece.fromJson(p));
    if (a.stipulation != null)
      b.stipulation = Stipulation.fromJson(a.stipulation ?? {});
    if (a.twins) b.twins = Twins.fromJson(a.twins);
    if (a.htmlSolution) b.htmlSolution = a.htmlSolution;
    if (a.date) b.date = a.date;
    if (a.personalID) b.personalID = a.personalID;
    if (a.prizeRank) b.prizeRank = a.prizeRank;
    if (a.prizeDescription) b.prizeDescription = a.prizeDescription;
    if (a.source) b.source = a.source;
    if (a.conditions) b.conditions = [...a.conditions];
  }

  toJson(): Partial<IProblem> {
    const json: Partial<IProblem> = {};
    if (this.authors.length > 0)
      json.authors = this.authors.map((a) => a.toJson());
    if (this.pieces.length > 0)
      json.pieces = this.pieces.map((p) => p.toJson());
    if (this.stipulation != null) json.stipulation = this.stipulation.toJson();
    if (this.twins) json.twins = this.twins.toJson();
    if (this.htmlSolution) json.htmlSolution = this.htmlSolution;
    if (this.date) json.date = this.date;
    if (this.personalID) json.personalID = this.personalID;
    if (this.prizeRank) json.prizeRank = this.prizeRank;
    if (this.prizeDescription) json.prizeDescription = this.prizeDescription;
    if (this.source) json.source = this.source;
    if (this.conditions) json.conditions = this.conditions;
    if (this.snap_keys.length > 0)
      json.snapshots = this.snap_keys.reduce(
        (a, k) => ({ ...a, [k]: this.snapshots[k] }),
        {}
      );
    return json;
  }

  saveSnapshot(snapshotId?: keyof IProblem["snapshots"]) {
    const { snapshots, ...prob } = this.toJson();
    const snap = btoa(JSON.stringify(prob));
    if (snapshotId == undefined) {
      const newKey = this.getNextId(this.currentSnapshotId);
      this.snapshots[newKey] = snap;
    } else {
      this.snapshots[snapshotId] = snap;
      this.currentSnapshotId = snapshotId;
    }
  }

  getNextId(currentSnapshotId: keyof IProblem["snapshots"]): keyof IProblem["snapshots"] {
    if (typeof currentSnapshotId === "number") {
      return Math.max(currentSnapshotId, 0, ...this.snap_keys.filter(filterNumber)) + 1
    } else {
      return currentSnapshotId + "*";
    }
  }

  deleteSnapshot(id: number | string) {
    if (!this.snapshots[id]) {
      throw new Error("Snapshot not found!");
    }
    delete this.snapshots[id];
  }
  loadSnapshot(
    id: keyof IProblem["snapshots"],
    ignoreChanges: boolean = false
  ) {
    if (!ignoreChanges) this.saveSnapshot(this.currentSnapshotId);
    const prob = JSON.parse(atob(this.snapshots[id])) as Partial<IProblem>;
    Problem.applyJson(prob, this);
    this.currentSnapshotId = id;
  }

  public getPieceCounter() {
    return `(${this.whitePieces}+${this.blackPieces}${
      this.neutralPieces ? "+" + this.neutralPieces : ""
    })`;
  }

  get whitePieces() {
    return this.pieces?.filter((f) => f.color === "White").length ?? 0;
  }
  get blackPieces() {
    return this.pieces?.filter((f) => f.color === "Black").length ?? 0;
  }
  get neutralPieces() {
    return this.pieces?.filter((f) => f.color === "Neutral").length ?? 0;
  }

  public getCurrentFen(): string {
    const rows: string[] = [];
    for (let r = 7; r >= 0; r--) {
      let empty = 0;
      let row = "";
      for (let c = 0; c <= 7; c++) {
        const p = this.getPieceAt(r, c);
        if (p) {
          if (empty > 0) row += empty.toString();
          row += p.ToNotation();
          empty = 0;
        } else {
          empty++;
        }
      }
      if (empty > 0) {
        row += empty.toString();
      }
      rows.push(row);
    }
    return rows.join("/");
  }

  private getPieceAt(row: number, col: number) {
    const p = this.pieces?.find(
      (f) =>
        Columns.indexOf(f.column) === col &&
        Traverse.indexOf(f.traverse) === 8 - row - 1
    );
    return p;
  }
}



function filterNumber(v: any): v is number {
  return typeof v === "number";
}
