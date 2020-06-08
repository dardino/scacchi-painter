import { Piece } from "./Piece";
import { Columns, Traverse } from "../helpers";

export class Problem {
  private constructor(private sourceElement: Element) {}
  private pieces: null | Piece[] = null;
  static fromElement(source: Element) {
    return new Problem(source);
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
      let column = "";
      for (let c = 0; c <= 7; c++) {
        const p = this.pieces?.find(
          (f) =>
            Columns.indexOf(f.column) === c &&
            Traverse.indexOf(f.traverse) === r
        );
        if (p) {
          if (empty > 0) {
            column += empty.toString();
          }
          column +=
            p.color === "White" ? p.appearance : p.appearance.toUpperCase();
          empty = 0;
        } else {
          empty++;
        }
      }
      if (empty > 0) {
        column += empty.toString();
      }
      rows.push(column);
    }
    return rows.join("/");
  }
}
