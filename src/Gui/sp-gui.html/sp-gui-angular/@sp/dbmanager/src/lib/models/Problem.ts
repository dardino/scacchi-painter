import { Piece } from "./piece";
import {
  Columns,
  Traverse,
  GetSolutionFromElement,
  XmlProblem,
} from "../helpers";
import { Twins } from "./twins";
import { Stipulation } from "./stipulation";
import { Author } from "./author";

export class Problem implements XmlProblem {
  private constructor(private sourceElement: Element) {}

  public date = new Date().toLocaleString();
  public stipulation: Stipulation = {} as Stipulation;
  public prizeRank = "";
  public personalID = "";
  public prizeDescription = "";
  public source = "";
  public authors: Author[] = [];
  public pieces: Piece[] = [];
  public twins: Twins = {} as Twins;
  public htmlSolution = "";

  static fromElement(source: Element) {
    const p = new Problem(source);
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
    return p;
  }

  getPieceCounter() {
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
