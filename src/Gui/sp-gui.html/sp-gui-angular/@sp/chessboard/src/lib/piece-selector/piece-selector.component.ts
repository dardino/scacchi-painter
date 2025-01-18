import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "lib-piece-selector",
  templateUrl: "./piece-selector.component.html",
  styleUrls: ["./piece-selector.component.less"],
})
export class PieceSelectorComponent {
  @Input()
  current: string | null = "";

  @Output()
  selectedPieceChanged = new EventEmitter<string | null>();

  constructor() {}

  clickPiece(color: string, piece: string) {
    const newCurrent = `${color}_${piece}`;
    if (newCurrent !== this.current) this.current = `${color}_${piece}`;
    else this.current = "";

    this.selectedPieceChanged.emit(this.current === "" ? null : this.current);
  }
}
