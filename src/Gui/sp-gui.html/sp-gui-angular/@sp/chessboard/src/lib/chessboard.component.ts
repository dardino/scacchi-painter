import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
} from "@angular/core";
import {
  IPiece,
  Piece,
  SquareLocation,
  GetLocationFromIndex,
} from "@sp/dbmanager/src/public-api";
import { FenService } from "@sp/dbmanager/src/lib/fen.service";

import "canvas-chessboard/src/font/chess-figurine.css";

import { CanvasChessBoard, Piece as BP } from "canvas-chessboard";

@Component({
  selector: "lib-chessboard",
  templateUrl: "chessboard.component.html",
  styleUrls: ["chessboard.component.styl"],
})
export class ChessboardComponent implements OnInit, OnChanges {
  cells: UiCell[] = [];
  currentCell: UiCell | null = null;

  @Input() boardType: "canvas" | "HTML";

  get BoardType() {
    return this.boardType ? this.boardType : "HTML";
  }

  @ViewChild("canvas", { static: true })
  canvas: ElementRef;

  private canvasBoard: CanvasChessBoard;

  @Input()
  notation?: string;

  @Input()
  pieces?: IPiece[];

  @Input()
  mode: "edit" | "view";

  public get Mode() {
    return this.mode;
  }

  public onSelectCell($event: Event) {
    console.log($event);
  }

  constructor(private fensvc: FenService) {}

  ngOnInit() {
    console.log("INIT");
    this.canvasBoard = new CanvasChessBoard(this.canvas.nativeElement, {
      BORDER_SIZE: 1,
      CELLCOLORS: ["#f9f9f9", "#9f9f9f"],
      PIECECOLORS: ["#fff", "#294053"],
    });
    this.updateBoard();
  }

  ngOnChanges(changes: SimpleChanges2<ChessboardComponent>): void {
    console.log("CHANGE");
    if (changes.notation && !changes.notation.isFirstChange()) {
      this.updateBoard();
    }
    if (
      changes.boardType &&
      !changes.boardType.isFirstChange() &&
      changes.boardType.currentValue === "canvas"
    ) {
      this.updateBoard();
    }
    if (changes.pieces) {
      // nopè
    }
  }

  clearCells() {
    this.cells = [];
    for (let i = 0; i < 64; i++) {
      this.cells.push({
        location: GetLocationFromIndex(i),
        piece: null,
      });
    }
  }

  updateBoard() {
    console.log("Update BOARD!");
    this.clearCells();
    const data = this.fensvc.FenToChessBoard(
      this.notation ?? "8/8/8/8/8/8/8/8"
    );
    console.log(data);
    data.forEach((f, i, a) => {
      this.cells[i].piece = Piece.fromPartial(f.data, GetLocationFromIndex(i));
    });
    if (this.canvasBoard) {
      const pieces = this.cells.map(p => p.piece ?? null).filter<Piece>(notNull);
      const bps = pieces.map((p) => p.ConvertToCanvasPiece()).filter<BP>(notNull);
      this.canvasBoard.SetPieces(bps);
    }

    if (this.BoardType === "canvas") {
      this.canvasBoard.Redraw();
    }
  }

  onCellClick(cell: UiCell) {
    this.currentCell = cell;
  }
}
function notNull<T>(v: T | null): v is T {
  return v != null;
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
  piece: Piece | null;
  location: SquareLocation;
}
