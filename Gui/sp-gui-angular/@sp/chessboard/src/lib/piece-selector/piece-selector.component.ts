import { DragDropModule } from "@angular/cdk/drag-drop";

import { Component, EventEmitter, Input, Output } from "@angular/core";

import { StandardPiecesList } from "@dardino/chess-board";

@Component({
  selector: "lib-piece-selector",
  templateUrl: "./piece-selector.component.html",
  imports: [DragDropModule],
  standalone: true,
  styleUrls: ["./piece-selector.component.scss"],
})
export class PieceSelectorComponent {
  @Input()
  current: string | null = "";

  @Output()
  selectedPieceChanged = new EventEmitter<string | null>();

  standardPieces = StandardPiecesList;
  colors = ["w", "b", "n"];

  constructor() {}

  clickPiece(color: string, piece: string) {
    const newCurrent = `${color}_${piece}`;
    if (newCurrent !== this.current) this.current = `${color}_${piece}`;
    else this.current = "";

    this.selectedPieceChanged.emit(this.current === "" ? null : this.current);
  }
}
