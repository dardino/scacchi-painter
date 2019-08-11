import { Component, OnInit, Input } from "@angular/core";
import {
  Piece,
  SquareLocation,
  PieceColors,
  GetSquareColor
} from "projects/sp-dbm/src/public-api";

import { FontGliphs } from "canvas-chessboard";

const CodeToFont = {
  k: FontGliphs.code_BK,
  q: FontGliphs.code_BQ,
  r: FontGliphs.code_BR,
  b: FontGliphs.code_BB,
  n: FontGliphs.code_BN,
  p: FontGliphs.code_BP
};

@Component({
  selector: "lib-cbs",
  templateUrl: "./cbs.component.html",
  styleUrls: ["./cbs.component.styl"]
})
export class CbsComponent implements OnInit {
  public get classList() {
    const classlist = [];
    classlist.push(GetSquareColor(this.location));
    if (this.piece && this.piece.rotation) {
      classlist.push(this.piece.rotation.toLowerCase());
    }
    if (this.piece && this.piece.color) {
      classlist.push(
        `pc-${PieceColors[this.piece.color].substring(0, 1).toLowerCase()}`
      );
    }
    return classlist.join(" ");
  }

  @Input()
  public piece?: Piece;

  @Input()
  public location: SquareLocation;

  get piecechar(): string {
    if (!this.piece) return "";
    return String.fromCharCode(CodeToFont[this.piece.appearance.toLowerCase()]);
  }

  constructor() { }

  ngOnInit() { }

}

