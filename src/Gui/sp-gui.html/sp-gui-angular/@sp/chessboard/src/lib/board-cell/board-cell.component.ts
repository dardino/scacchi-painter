import { Component, OnInit, Input } from "@angular/core";
import {
  Piece,
  SquareLocation,
  GetSquareColor,
} from "@sp/dbmanager/src/public-api";

import { FontGliphs } from "canvas-chessboard";

type Appearance = "k" | "q" | "r" | "b" | "n" | "p";

const CodeToFont = {
  k: FontGliphs.code_BK,
  q: FontGliphs.code_BQ,
  r: FontGliphs.code_BR,
  b: FontGliphs.code_BB,
  n: FontGliphs.code_BN,
  p: FontGliphs.code_BP,
};

@Component({
  selector: "lib-board-cell",
  templateUrl: "./board-cell.component.html",
  styleUrls: ["./board-cell.component.styl"],
})
export class BoardCellComponent implements OnInit {
  public get classList() {
    const classlist = ["lib-cbs"];
    classlist.push(GetSquareColor(this.location));
    if (this.piece?.rotation) {
      classlist.push(this.piece.rotation.toLowerCase());
    }
    if (this.piece?.color) {
      classlist.push(`pc-${this.piece.color.substring(0, 1).toLowerCase()}`);
    }
    if (this.active) classlist.push("active");
    return classlist.join(" ");
  }

  @Input()
  public piece?: Piece;

  @Input()
  public active?: boolean;

  @Input()
  public location: SquareLocation;

  get piecechar(): string {
    if (!this.piece) return "";
    return String.fromCharCode(
      CodeToFont[this.piece.appearance.toLowerCase() as Appearance]
    );
  }

  constructor() {}

  ngOnInit() {}
}
