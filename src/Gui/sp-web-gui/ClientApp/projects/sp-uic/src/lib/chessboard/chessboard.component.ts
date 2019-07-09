import { Component, OnInit, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Piece, GetLocationFromIndex, SquareLocation } from "projects/sp-dbm/src/public-api";
import { SpFenService } from "projects/sp-dbm/src/lib/sp-fen.service";

@Component({
  selector: "lib-chessboard",
  templateUrl: "./chessboard.component.html",
  styleUrls: ["./chessboard.component.styl"]
})
export class ChessboardComponent implements OnInit, OnChanges {
  cells: UiCell[] = [];

  @Input()
  notation: string;

  @Input()
  pieces: Piece[];

  constructor(private fensvc: SpFenService) {}

  ngOnInit() {
    for (let i = 1; i <= 64; i++) {
      this.cells.push({
        location: GetLocationFromIndex(i),
        piece: null
      });
    }
  }

  ngOnChanges(changes: SimpleChanges2<ChessboardComponent>): void {
    if (changes.notation) {
      this.updateBoard();
    }
  }

  updateBoard() {
    const data = this.fensvc.FenToChessBoard(this.notation);
    data.forEach(f => {
      this.cells[f.index].piece = f.data;
    });
  }
}

export declare type SimpleChanges2<T> = {
  [P in keyof T]?: SimpleChange<T[P]>
};
export declare class SimpleChange<T> {
  previousValue: T;
  currentValue: T;
  firstChange: boolean;
  constructor(previousValue: T, currentValue: T, firstChange: boolean);
  isFirstChange(): boolean;
}


interface UiCell {
  piece?: Partial<Piece>;
  location: SquareLocation;
}
