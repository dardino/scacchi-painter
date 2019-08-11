import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ProblemDb, Piece, Traverse, Columns, PieceColors } from "./helpers";
import { SpConvertersService } from "./sp-converters.service";

@Injectable({ providedIn: "root" })
export class SpDbmService {
  CurrentDB: Document;
  private currentIndex = 0;
  get CurrentIndex() { return this.currentIndex; }
  private count = 1;
  get Count() { return this.count; }
  private currentProblem: Element | null = null;
  get CurrentProblem() { return this.currentProblem; }
  private pieces: Array<Piece> = [];
  get Pieces() { return this.pieces; }

  constructor(private http: HttpClient, private converter: SpConvertersService) {}

  GetCurrentFen(): string {
    const rows: Array<string> = [];
    for (let r = 7; r >= 0; r--) {
      let empty = 0;
      let column = "";
      for (let c = 0; c <= 7; c++) {
        const p = this.pieces.find(f => Columns.indexOf(f.column) === c &&  Traverse.indexOf(f.traverse) === r);
        if (p) {
          if (empty > 0) column += empty.toString();
          column += p.color === PieceColors.White ? p.appearance : p.appearance.toUpperCase();
          empty = 0;
        } else {
          empty++;
        }
      }
      if (empty > 0) column += empty.toString();
      rows.push(column);
    }
    return rows.join("/");
  }

  LoadDatabase() {
    return this.http.get<ProblemDb>("api/sampledata/file").subscribe({
      complete: () => {}
    });
  }

  LoadFromText(xmlText: string): Error | null {
    try {
      // tentativo 1: controllo se è un SP2
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      this.CurrentDB = xmlDoc;
      const problems = xmlDoc.querySelectorAll("SP_Item");
      this.currentIndex = parseInt(this.CurrentDB.documentElement.getAttribute("lastIndex"), 10);
      this.count = problems.length;
      this.loadProblem();
    } catch (ex) {
      console.error(ex);
      return ex;
    }
  }

  MovePrevious() {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.loadProblem();
  }
  MoveNext() {
    if (this.currentIndex >= this.count - 1) return;
    this.currentIndex++;
    this.loadProblem();
  }
  GotoIndex(arg0: number) {
    if (arg0 >= this.count - 1 || arg0 < 0) return;
    this.currentIndex = arg0;
    this.loadProblem();
  }

  private loadProblem() {
    if (this.CurrentDB == null) return;
    this.currentProblem = this.CurrentDB ? this.CurrentDB.querySelector("SP_Item:nth-child(" + (this.currentIndex + 1) + ")") : null;
    if (this.currentProblem == null) return this.reset();

    this.pieces = Array.from(this.currentProblem.querySelectorAll("Piece")).map(f => this.converter.ConvertToPiece(f));
  }

  private reset() {
    this.currentIndex = 0;
    this.currentProblem = null;
    this.pieces = [];
  }
}
