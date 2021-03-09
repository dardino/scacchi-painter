import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
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
  private settings: {
    CELLCOLORS: [string, string];
    PIECECOLORS: [string, string];
    BORDER_SIZE: number;
  } = {
    BORDER_SIZE: 1,
    CELLCOLORS: ["#fff", "#ddd"],
    PIECECOLORS: ["#fff", "#333"],
  };

  cells: UiCell[] = [];

  currentCell: UiCell | null = null;

  @Output() focusOut = new EventEmitter<void>();
  @Input() boardType: "canvas" | "HTML";
  @Input() hideInfo: boolean;
  @Input() cursor: { figurine: string; rotation: number | null } | null;

  get BoardType() {
    return this.boardType ? this.boardType : "HTML";
  }

  @ViewChild("canvas", { static: true })
  canvas: ElementRef;

  @ViewChild("container", { static: true })
  chessboard: ElementRef;

  @ViewChild("container", { static: true })
  cbImage: ElementRef;

  private canvasBoard: CanvasChessBoard | null;
  private cellSize = 32;

  @Input()
  position?: Problem;

  @Output()
  currentCellChanged = new EventEmitter<SquareLocation | null>();

  public fontSize: number;

  constructor(private fensvc: FenService) {}

  onSelectCell($event: Event) {
    console.log($event);
  }

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
    if (changes.cursor && this.cbImage) {
      if (changes.cursor.currentValue?.figurine != null) {
        const dataURL = getPieceIcon(
          changes.cursor.currentValue?.figurine ?? "q",
          this.cellSize,
          changes.cursor.currentValue?.rotation ?? null
        );
        (this.cbImage
          .nativeElement as HTMLDivElement).style.cursor = `url(${dataURL}) ${Math.floor(
          this.cellSize / 2
        )} ${Math.floor(this.cellSize / 2)}, auto`;
      } else {
        (this.cbImage.nativeElement as HTMLDivElement).style.cursor = `unset`;
      }
    }
    if (
      changes.boardType &&
      !changes.boardType.isFirstChange() &&
      changes.boardType.currentValue === "canvas" &&
      this.canvas
    ) {
      this.canvasBoard = new CanvasChessBoard(
        this.canvas.nativeElement,
        this.settings
      );
      const cfg = GetConfig();
      cfg.fontSize = 1;
      this.canvasBoard.AddFontConfig("ScacchiPainter", cfg);
      this.canvasBoard.SetFont("ScacchiPainter");
      this.updateBoard();
    } else if (changes.boardType?.currentValue !== "canvas") {
      this.canvasBoard = null;
    }
  }

  chessboardBlur() {
    this.currentCell = null;
    this.focusOut.emit();
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
      const mappedPieces: BP[] = pp.map((p: Piece) => p.ConvertToCanvasPiece())
      const bps = mappedPieces.filter(notNull);
      this.canvasBoard.SetPieces(bps);
    }

    if (this.BoardType === "canvas" && this.canvasBoard) {
      this.canvasBoard.Redraw();
    }
  }

  onCellClick(cell: UiCell) {
    if (cell !== this.currentCell) this.currentCell = cell;
    else this.currentCell = null;
    if (this.currentCellChanged) {
      this.currentCellChanged.emit(
        this.currentCell ? { ...this.currentCell?.location } : null
      );
    }
  }

  private sizeMutated = (args: any) => {
    this.cellSize =
      (this.chessboard.nativeElement as HTMLDivElement).offsetWidth / 8;
    this.fontSize = Math.floor(this.cellSize / 1.44);
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
    return this.position?.twins.TwinList.map((t) => t.toString()) ?? [];
  }

  get viewDiagram(): any {
    return (
      (this.position?.twins.TwinList.length ?? 0) &&
      this.position?.twins.TwinList.every(
        (t) => t.TwinType !== TwinTypes.Diagram
      )
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

function getPieceIcon(figurine: string, cellSize: number, rot: number | null) {
  const canvas = document.createElement("canvas");
  canvas.width = cellSize;
  canvas.height = cellSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Can not create 2d context!");
  }
  const fsize = Math.floor(cellSize / 1.44);
  const margin = Math.floor((cellSize - fsize) / 2);
  ctx.font = `${fsize}px ${
    figurine === "X" ? "Arial, sans" : "ScacchiPainter"
  }`;
  ctx.lineWidth = 2;

  if (rot != null) {
    const center = Math.floor(cellSize / 2);
    ctx.translate(center, center);
    ctx.rotate(rot * (Math.PI / 180));
    ctx.translate(-center, -center);
  }

  ctx.translate(margin, margin + fsize);
  ctx.save();

  if (figurine !== "X") {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText("_" + figurine.substring(1), 0, 0);
    ctx.fillText("_" + figurine.substring(1), 0, 0);
    ctx.restore();
  }

  ctx.fillStyle = figurine === "X" ? "#ff3300" : "#333333";
  ctx.strokeStyle = "#ffffff";
  ctx.strokeText(figurine === "X" ? `🗙` : figurine, 0, 0);
  ctx.fillText(figurine === "X" ? `🗙` : figurine, 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/png");
}
