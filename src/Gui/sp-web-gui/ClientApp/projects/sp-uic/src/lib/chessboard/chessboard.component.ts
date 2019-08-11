import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from "@angular/core";
import { Piece, GetLocationFromIndex, SquareLocation, Traverse } from "projects/sp-dbm/src/public-api";
import { SpFenService } from "projects/sp-dbm/src/lib/sp-fen.service";
import "canvas-chessboard/src/font/chess-figurine.css";

import {
  CanvasChessBoard
} from "canvas-chessboard";
import { SpConvertersService } from "projects/sp-dbm/src/lib/sp-converters.service";

@Component({
  selector: "lib-chessboard",
  templateUrl: "./chessboard.component.html",
  styleUrls: ["./chessboard.component.styl"]
})
export class ChessboardComponent implements OnInit, OnChanges {
  cells: UiCell[] = [];
  currentCell: UiCell | null = null;

  @ViewChild("canvas", { static: true })
  canvas: ElementRef;

  private canvasBoard: CanvasChessBoard;

  @Input()
  notation?: string;

  @Input()
  pieces?: Piece[];

  public onSelectCell($event: Event) {
    console.log($event);
  }

  constructor(private fensvc: SpFenService, private converters: SpConvertersService) {}

  ngOnInit() {
    console.log("INIT");
    this.canvasBoard = new CanvasChessBoard(this.canvas.nativeElement, {
      BORDER_SIZE: 1,
      CELLCOLORS: ["#f9f9f9", "#9f9f9f"],
      PIECECOLORS: ["#fff", "#294053"]
    });
    this.updateBoard();
    setTimeout(() => {
      this.canvasBoard.Redraw();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges2<ChessboardComponent>): void {
    console.log("CHANGE");
    if (changes.notation && !changes.notation.isFirstChange()) {
      this.updateBoard();
    }
    if (changes.pieces) {
    }
  }

  clearCells() {
    for (let i = 1; i <= 64; i++) {
      this.cells.push({
        location: GetLocationFromIndex(i),
        piece: null
      });
    }
  }

  updateBoard() {
    this.clearCells();
    const data = this.fensvc.FenToChessBoard(this.notation);
    data.forEach((f, i, a) => {
      this.cells[i].piece = f.data;
    });
    if (this.canvasBoard) {
      this.canvasBoard.SetPieces(
        data.filter(p => p.data).map(p => (p.data ? this.converters.ConvertToBp(p.data) : null))
      );
    }
  }

  onCellClick(cell: UiCell) {
    this.currentCell = cell;
  }
}

export declare type SimpleChanges2<T> = { [P in keyof T]?: SimpleChange<T[P]> };
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
