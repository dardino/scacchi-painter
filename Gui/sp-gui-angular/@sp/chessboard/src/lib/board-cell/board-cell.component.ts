import { DragDropModule } from "@angular/cdk/drag-drop";

import { Component, input, computed } from "@angular/core";
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
  piece = input<IPiece | null | undefined>(undefined);
  active = input<boolean | undefined>(undefined);
  location = input<SquareLocation>(null!);

  classList = computed(() => {
    const classlist = ["lib-cbs"];
    classlist.push(GetSquareColor(this.location()));
    if (this.piece()?.rotation) {
      classlist.push(this.piece()!.rotation.toLowerCase());
    }
    if (this.piece()?.color) {
      classlist.push(`pc-${this.piece()!.color.substring(0, 1).toLowerCase()}`);
    }
    if (this.active()) classlist.push("active");
    return classlist.join(" ");
  });

  piecechar = computed(() => {
    if (!this.piece()) return "";
    const color = getCanvasColor(this.piece()!.color);
    const pieces = GetConfig()[color];
    const fig = getFigurine(this.piece()!.appearance);
    if (fig == null) return "";
    return pieces[fig];
  });

  figurine = computed(() => this.piece()?.appearance.toLowerCase() ?? "");
  color = computed(() => this.piece()?.color[0].toLowerCase() ?? "");
  colored = computed(() => `${this.color()}_${this.figurine()}`);
  bg = computed(() => `__${this.figurine()}`);
  fairy = computed(() => (this.piece()?.fairyCode ?? []).map(p => p.code).join("+"));

  constructor() {}
}
