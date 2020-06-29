import { Component, OnInit, Input } from "@angular/core";
import { GetConfig } from "canvas-chessboard/modules/es2018/presets/scacchipainter";
import {
  IPiece,
  SquareLocation,
  GetSquareColor,
  getCanvasColor,
  getFigurine,
} from "@sp/dbmanager/src/public-api";

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
  public piece?: IPiece;

  @Input()
  public active?: boolean;

  @Input()
  public location: SquareLocation;

  get piecechar(): string {
    if (!this.piece) return "";
    const color = getCanvasColor(this.piece.color);
    const pieces = GetConfig()[color];
    const fig = getFigurine(this.piece.appearance);
    if (fig == null) return "";
    return pieces[fig];
  }

  get figurine(): string {
    return this.piece?.appearance.toLowerCase() ?? "";
  }
  get color(): string {
    return this.piece?.color[0].toLowerCase() ?? "";
  }
  get fairy(): string {
    return this.piece?.fairyCode ?? "";
  }

  constructor() {}

  ngOnInit() {}
}
