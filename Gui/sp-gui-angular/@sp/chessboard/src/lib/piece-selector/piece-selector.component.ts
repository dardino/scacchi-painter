import { DragDropModule } from "@angular/cdk/drag-drop";

import { Component, computed, input, output } from "@angular/core";

import { StandardPiecesList } from "@dardino/chess-board";

@Component({
  selector: "lib-piece-selector",
  templateUrl: "./piece-selector.component.html",
  imports: [DragDropModule],
  standalone: true,
  styleUrls: ["./piece-selector.component.scss"],
})
export class PieceSelectorComponent {
  current = input<string | null>("");
  selectedPieceChanged = output<string | null>();

  standardPieces = StandardPiecesList.slice(0, 6);
  extraPieces = StandardPiecesList.slice(6);
  colors = computed(() => this.showExtraPieces() ? ["w", "b", "n"] : ["w", "b"]);

  showExtraPieces = input(false);
  compact = input(false);

  constructor() {}

  clickPiece(color: string, piece: string) {
    const newCurrent = `${color}_${piece}`;
    this.selectedPieceChanged.emit(newCurrent || null);
  }
}
