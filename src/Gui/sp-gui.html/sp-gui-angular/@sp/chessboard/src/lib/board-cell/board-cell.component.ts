import { DragDropModule } from "@angular/cdk/drag-drop";

import { Component, Input } from "@angular/core";
import {
  GetSquareColor,
  IPiece,
  SquareLocation,
  getCanvasColor,
  getFigurine,
} from "@sp/dbmanager/src/public-api";
import { GetConfig } from "canvas-chessboard/modules/es2018/presets/scacchipainter";

@Component({
    selector: "lib-board-cell",
    imports: [DragDropModule],
    standalone: true,
    templateUrl: "./board-cell.component.html",
    styleUrls: ["./board-cell.component.scss"],
})
export class BoardCellComponent {
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
  public piece?: IPiece | null;

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
  get colored() {
    return `${this.color}_${this.figurine}`;
  }
  get bg() {
    return `__${this.figurine}`;
  }
  get fairy(): string {
    return (this.piece?.fairyCode ?? []).map(p => p.code).join("+");
  }

  constructor() {}

}
