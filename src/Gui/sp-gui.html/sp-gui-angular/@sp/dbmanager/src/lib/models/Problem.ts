import { Piece } from "./Piece";
import { Columns, Traverse, GetSolutionFromElement } from "../helpers";

export class Problem {
  private constructor(private sourceElement: Element) {}
  private pieces: null | Piece[] = null;
  private htmlSolution: string | null = null;
  static fromElement(source: Element) {
    return new Problem(source);
  }


  public getSolution() {
    if (this.htmlSolution == null) {
      this.htmlSolution = GetSolutionFromElement(this.sourceElement);
    }
    return this.htmlSolution;
  }
  public getPieces(): Piece[] {
    // lazy
    if (this.pieces === null) {
      this.pieces = Array.from(
        this.sourceElement.querySelectorAll("Piece")
      ).map(Piece.fromElement);
    }
    return this.pieces;
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
        Traverse.indexOf(f.traverse) === (8 - row - 1)
    );
    return p;
  }

}
