import { Component, OnInit, Input } from "@angular/core";
import {
  Piece,
  GetSquareColor,
  SquareLocation,
  PieceColors
} from "projects/sp-dbm/src/public-api";

const CodeToFont = {
  k: "&#x265A;",
  q: "&#x265B;",
  r: "&#x265C;",
  b: "&#x265D;",
  n: "&#x265E;",
  p: "&#x265F;"
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
      classlist.push(`pc-${PieceColors[this.piece.color].substring(0, 1).toLowerCase()}`);
    }
    return classlist.join(" ");
  }

  @Input()
  public piece?: Piece;

  @Input()
  public location: SquareLocation;

  get piecechar(): string {
    if (!this.piece) {
      return "";
    }
    return CodeToFont[this.piece.appearance.toLowerCase()];
  }

  constructor() {}

  ngOnInit() {}
}
