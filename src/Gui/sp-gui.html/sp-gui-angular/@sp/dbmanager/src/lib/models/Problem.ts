import { Piece } from "./piece";
import {
  Columns,
  Traverse,
  GetSolutionFromElement,
  IProblem,
  fenToChessBoard,
  GetLocationFromIndex,
  notNull,
  SquareLocation,
  GetSquareIndex,
  convertToRtf,
  createXmlElement,
  notEmpty,
} from "../helpers";
import { Twins } from "./twins";
import { Stipulation } from "./stipulation";
import { Author } from "./author";
import { SP2 } from "../SP2";
import { Base64 } from "../base64";

// tslint:disable-next-line: variable-name
const main_snapshot = "$_MAIN_$";

export class Problem implements IProblem {
  private constructor() {}

  public rtfSolution = "";
  public textSolution = "";
  public date = new Date().toLocaleString();
  public stipulation = Stipulation.fromJson({});
  public prizeRank = 0;
  public personalID = "";
  public prizeDescription = "";
  public source = "";
  public authors: Author[] = [];
  public pieces: Piece[] = [];
  public twins = Twins.fromJson({});
  public htmlSolution = "";
  public htmlElements: HTMLElement[] = [];
  public conditions: string[] = [];
  public fairyCells: string[] = [];

  public snapshots: IProblem["snapshots"] = {};
  public currentSnapshotId: keyof IProblem["snapshots"] = main_snapshot;
  private get snap_keys(): Array<string | number> {
    return Object.keys(this.snapshots).filter((f) => this.snapshots[f] != null);
  }

  static async fromElement(source: Element) {
    const p = new Problem();
    p.stipulation = Stipulation.fromElement(source);
    p.pieces = Array.from(source.querySelectorAll("Piece")).map(
      Piece.fromSP2Xml
    );
    p.twins = Twins.fromElement(source.querySelector("Twins") ?? null);
    const sol = await GetSolutionFromElement(source);
    p.textSolution = sol.plain ?? "";
    p.rtfSolution = sol.rtf ?? "";
    p.htmlElements = sol.html;
    p.htmlSolution = p.htmlElements.map((f) => f.outerHTML).join("");
    p.date = source.getAttribute("Date") ?? "";
    p.prizeRank = parseInt(source.getAttribute("PrizeRank") ?? "0", 10);
    p.personalID = source.getAttribute("PersonalID") ?? "";
    p.prizeDescription = source.getAttribute("PrizeDescription") ?? "";
    p.source = source.getAttribute("Source") ?? "";
    p.authors = Array.from(source.querySelectorAll("Author")).map((a) =>
      Author.fromElement(a)
    );
    p.conditions = Array.from(source.querySelectorAll("Conditions") ?? []).map(
      (el) => el.nodeValue ?? ""
    ).filter(notEmpty);

    p.fairyCells = [];
    p.snapshots = {};
    p.saveSnapshot(main_snapshot);

    return p;
  }

  static fromJson(jsonObj: Partial<IProblem>): Problem {
    const p = new Problem();
    Problem.applyJson(jsonObj, p);
    p.snapshots = { ...jsonObj.snapshots };
    if (Object.keys(p.snapshots).length === 0) p.saveSnapshot(main_snapshot);
    return p;
  }

  static fromFen(original: string) {
    const extractInfo = fenToChessBoard(original);
    const p = new Problem();
    p.pieces = extractInfo
      .map((el, sqi) => Piece.fromPartial(el, GetLocationFromIndex(sqi)))
      .filter(notNull);
    p.saveSnapshot(main_snapshot);
    return p;
  }

  static applyJson(a: Partial<IProblem>, b: Problem) {
    b.authors =
      a.authors?.length ?? 0
        ? (b.authors ?? []).map((p) => Author.fromJson(p))
        : [];
    b.pieces =
      a.pieces?.length ?? 0
        ? (a.pieces ?? []).map((p) => Piece.fromJson(p))
        : [];
    b.stipulation =
      a.stipulation != null
        ? Stipulation.fromJson(a.stipulation ?? {})
        : Stipulation.fromJson({});
    b.twins = a.twins ? Twins.fromJson(a.twins) : Twins.fromJson({});
    b.htmlSolution = a.htmlSolution ? a.htmlSolution : "";
    b.date = a.date ? a.date : new Date().toISOString();
    b.personalID = a.personalID ? a.personalID : "";
    b.prizeRank = a.prizeRank ?? 0;
    b.prizeDescription = a.prizeDescription ? a.prizeDescription : "";
    b.source = a.source ? a.source : "";
    b.conditions = (a.conditions ? [...a.conditions] : []).filter(notEmpty);
  }

  toJson(): Partial<IProblem> {
    const json: Partial<IProblem> = {};
    if (this.authors.length > 0) {
      json.authors = this.authors.map((a) => a.toJson());
    }
    if (this.pieces.length > 0) {
      json.pieces = this.pieces.map((p) => p.toJson());
    }
    if (this.stipulation != null) json.stipulation = this.stipulation.toJson();
    if (this.twins) json.twins = this.twins.toJson();
    if (this.htmlSolution) json.htmlSolution = this.htmlSolution;
    if (this.date) json.date = this.date;
    if (this.personalID) json.personalID = this.personalID;
    if (this.prizeRank) json.prizeRank = this.prizeRank;
    if (this.prizeDescription) json.prizeDescription = this.prizeDescription;
    if (this.source) json.source = this.source;
    if (this.conditions) json.conditions = this.conditions;
    if (this.snap_keys.length > 0) {
      json.snapshots = this.snap_keys.reduce(
        (a, k) => ({ ...a, [k]: this.snapshots[k] }),
        {}
      );
    }
    return json;
  }

  clone(): Problem {
    return Problem.fromJson(this.toJson());
  }

  async toSP2Xml(): Promise<Element> {
    const item = createXmlElement("SP_Item");
    SP2.setProblemType(item, this.stipulation.getXMLProblemType());
    SP2.setMoves(item, this.stipulation.moves);
    SP2.setDate(item, this.date);
    SP2.setPersonalID(item, this.personalID);
    SP2.setStipulation(item, this.stipulation.getXMLEndingType());
    SP2.setSerie(item, this.stipulation.serie);
    SP2.setMaximum(item, this.stipulation.maximum);
    SP2.setSource(item, this.source);
    SP2.setPrizeRank(item, this.prizeRank);
    SP2.setPrizeDescription(item, this.prizeDescription);
    SP2.setCompleteStipulationDesc(
      item,
      this.stipulation.completeStipulationDesc
    );
    SP2.setAuthors(
      item,
      this.authors.map((a) => a.toSP2Xml())
    );
    SP2.setPieces(
      item,
      this.pieces.map((p) => p.toSP2Xml())
    );
    SP2.setTwins(item, this.twins.toSP2Xml());
    SP2.setConditions(item, this.conditions);
    SP2.setSolution(item, this.textSolution);
    // SP2.setHtmlSolution(item, this.htmlSolution);
    SP2.setRtfSolution(item, (await convertToRtf(this.htmlSolution)) ?? "");
    return item;
  }

  saveSnapshot(snapshotId?: keyof IProblem["snapshots"]) {
    const { snapshots, ...prob } = this.toJson();
    const snap = Base64.encode(JSON.stringify(prob));
    if (snapshotId == null) {
      const newKey = this.getNextId(this.currentSnapshotId);
      this.snapshots[newKey] = snap;
      this.currentSnapshotId = newKey;
    } else {
      this.snapshots[snapshotId] = snap;
      this.currentSnapshotId = snapshotId;
    }
  }
  saveAsMainSnapshot() {
    this.saveSnapshot(main_snapshot);
  }

  getNextId(
    currentSnapshotId: keyof IProblem["snapshots"]
  ): keyof IProblem["snapshots"] {
    if (currentSnapshotId === main_snapshot) {
      currentSnapshotId = -1;
    }
    if (typeof currentSnapshotId === "number") {
      return (
        Math.max(currentSnapshotId, 0, ...this.snap_keys.filter(filterNumber)) +
        1
      );
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
    id?: keyof IProblem["snapshots"],
    ignoreChanges: boolean = false
  ) {
    if (id == null) id = this.currentSnapshotId;
    if (!ignoreChanges) this.saveSnapshot();
    const prob = JSON.parse(Base64.decode(this.snapshots[id])) as Partial<
      IProblem
    >;
    Problem.applyJson(prob, this);
    this.currentSnapshotId = id;
  }
  loadMainSnapshot(ignoreChanges: boolean = false) {
    this.loadSnapshot(main_snapshot, ignoreChanges);
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
    return rows.join("/") + this.getFairiesFen();
  }

  private getFairiesFen(): string {
    const fps = this.pieces.filter((p) => p.isFairy());
    if (fps.length === 0) return ``;
    return ` [${fps.map((p) => p.ToFairyNotation()).join(",")}]`;
  }

  private getPieceAt(row: number, col: number) {
    const p = this.pieces?.find(
      (f) =>
        Columns.indexOf(f.column) === col &&
        Traverse.indexOf(f.traverse) === 8 - row - 1
    );
    return p;
  }

  GetPieceAt(column: Columns, traverse: Traverse) {
    const p = this.pieces?.find(
      (f) => f.column === column && f.traverse === traverse
    );
    return p;
  }

  setCellFairyAttribute(location: SquareLocation, attribute: string) {
    this.fairyCells[GetSquareIndex(location)] = attribute;
  }
}

function filterNumber(v: any): v is number {
  return typeof v === "number";
}
