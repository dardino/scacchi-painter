import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import {
  SquareLocation,
  GetLocationFromIndex,
  GetSquareIndex,
  TwinTypes,
} from "@sp/dbmanager/src/public-api";
import { FenService } from "@sp/dbmanager/src/lib/fen.service";
import {
  CanvasChessBoard,
  Piece as BP,
} from "canvas-chessboard/modules/es2018/canvasChessBoard";
import { Piece, Problem } from "@sp/dbmanager/src/lib/models";
import { GetConfig } from "canvas-chessboard/modules/es2018/presets/scacchipainter";

@Component({
  selector: "lib-chessboard",
  templateUrl: "chessboard.component.html",
  styleUrls: ["chessboard.component.styl"],
})
export class ChessboardComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  cells: UiCell[] = [];
  currentCell: UiCell | null = null;

  @Input() boardType: "canvas" | "HTML";
  @Input() hideInfo: boolean;

  get BoardType() {
    return this.boardType ? this.boardType : "HTML";
  }

  @ViewChild("canvas", { static: true })
  canvas: ElementRef;

  @ViewChild("container")
  chessboard: ElementRef;

  private canvasBoard: CanvasChessBoard | null;

  @Input()
  position?: Problem;

  @Input()
  mode: "edit" | "view";

  public get Mode() {
    return this.mode;
  }

  public fontSize: number;

  public onSelectCell($event: Event) {
    console.log($event);
  }

  constructor(private fensvc: FenService) {}

  ngOnDestroy(): void {
    // Later, you can stop observing
    window.removeEventListener("resize", this.sizeMutated);
  }

  ngOnInit() {
    this.updateBoard();
  }

  ngOnChanges(changes: SimpleChanges2<ChessboardComponent>): void {
    if (changes.position && !changes.position.isFirstChange()) {
      this.updateBoard();
    }
    if (
      changes.boardType &&
      !changes.boardType.isFirstChange() &&
      changes.boardType.currentValue === "canvas" &&
      this.canvas
    ) {
      this.canvasBoard = new CanvasChessBoard(this.canvas.nativeElement, {
        BORDER_SIZE: 1,
        CELLCOLORS: ["#fff", "#ddd"],
        PIECECOLORS: ["#fff", "#333"],
      });
      const cfg = GetConfig();
      cfg.fontSize = 1;
      this.canvasBoard.AddFontConfig("ScacchiPainter", cfg);
      this.canvasBoard.SetFont("ScacchiPainter");
      this.updateBoard();
    } else if (changes.boardType?.currentValue !== "canvas") {
      this.canvasBoard = null;
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
    this.clearCells();
    const pp = this.position?.pieces;
    if (pp) {
      for (const piece of pp) {
        const index = GetSquareIndex(piece.column, piece.traverse);
        if (index < 0 || index > 63) {
          console.error(piece.column, piece.traverse);
        }
        this.cells[index].piece = piece;
      }
    }
    if (this.canvasBoard && pp) {
      const bps = pp.map((p) => p.ConvertToCanvasPiece()).filter<BP>(notNull);
      this.canvasBoard.SetPieces(bps);
    }

    if (this.BoardType === "canvas" && this.canvasBoard) {
      this.canvasBoard.Redraw();
    }
  }

  onCellClick(cell: UiCell) {
    this.currentCell = cell;
  }

  private sizeMutated = (args: any) => {
    console.log("args", args);
    this.fontSize = Math.floor(
      (this.chessboard.nativeElement as HTMLDivElement).offsetWidth / 8 / 1.44
    );
  };

  ngAfterViewInit() {
    // Create an observer instance linked to the callback function
    window.addEventListener("resize", this.sizeMutated);
    setTimeout(() => {
      this.sizeMutated(null);
    }, 0);
  }

  get pieceCounter() {
    return this.position?.getPieceCounter();
  }

  get twins(): string[] {
    return this.position?.twins.Twins.map((t) => t.toString()) ?? [];
  }

  get viewDiagram(): any {
    return (
      (this.position?.twins.Twins.length ?? 0) &&
      this.position?.twins.Twins.every((t) => t.TwinType !== TwinTypes.Diagram)
    );
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
