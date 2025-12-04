import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, computed, inject, signal, input, effect } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Piece, Problem } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import {
  GetLocationFromIndex,
  GetSquareIndex,
  SquareLocation,
  Traverse
} from "@sp/dbmanager/src/public-api";
import {
  Piece as BP,
  CanvasChessBoard,
} from "canvas-chessboard/modules/es2018/canvasChessBoard";
import { GetConfig } from "canvas-chessboard/modules/es2018/presets/scacchipainter";
import { Subscription } from "rxjs";
import { BoardCellComponent } from "./board-cell/board-cell.component";
import { Animations, ChessboardAnimationService } from "./chessboard-animation.service";

@Component({
    selector: "lib-chessboard",
    templateUrl: "chessboard.component.html",
    imports: [CommonModule, DragDropModule, BoardCellComponent],
    standalone: true,
    styleUrls: ["chessboard.component.scss"],
})
export class ChessboardComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private animationService = inject(ChessboardAnimationService);

  @Output() focusOut = new EventEmitter<void>();
  @Input() boardType: "canvas" | "HTML";
  @Input() hideInfo: boolean;
  @Input() smallBoard: boolean;
  @Input() cursor: { figurine: string | null; rotation: number | null } | null;

  position = input<Problem | null>(null);

  get BoardType() {
    return this.boardType ? this.boardType : "HTML";
  }

  getTraverse(location: SquareLocation) {
    return 8 - Traverse.indexOf(location.traverse);
  }

  @ViewChild("canvas", { static: true })
  canvas: ElementRef;

  @ViewChild("container", { static: true })
  chessboard: ElementRef<HTMLDivElement>;

  @ViewChild("cbHtml")
  cbHtml: ElementRef<HTMLDivElement>;

  @ViewChild("container", { static: true })
  cbImage: ElementRef;

  @Output()
  currentCellChanged = new EventEmitter<SquareLocation | null>();
  @Output()
  cellClick = new EventEmitter<SquareLocation>();
  @Output()
  cellMiddleClick = new EventEmitter<SquareLocation>();
  @Output()
  contextOnCell = new EventEmitter<{ event: MouseEvent, location: SquareLocation }>();

  currentCell = signal<UiCell | null>(null);
  private lastHash = signal<string | undefined>(undefined);
  private uiCells = signal<UiCell[]>([]);

  cells = computed(() => this.uiCells());

  fen = computed(() => this.position()?.getCurrentFen());
  pieceCounter = computed(() => this.position()?.getPieceCounter());
  twins = computed(() => this.position()?.twins.TwinList.map((t: Twin) => t.toString()) ?? []);
  viewDiagram = computed(() => {
    const twinList = this.position()?.twins.TwinList ?? [];
    return twinList.length > 0 && twinList.every((t: Twin) => t.TwinType !== "Diagram");
  });
  stipulationDesc = computed(() => this.position()?.stipulation.completeStipulationDesc ?? "");

  private settings: {
    CELLCOLORS: [string, string];
    PIECECOLORS: [string, string];
    BORDER_SIZE: number;
  } = {
      BORDER_SIZE: 1,
      CELLCOLORS: ["#fff", "#ddd"],
      PIECECOLORS: ["#fff", "#333"],
    };
  private canvasBoard: CanvasChessBoard | null;
  private cellSize = 32;

  animationSub: Subscription;
  constructor() {
    const animationService = this.animationService;

    this.animationSub = animationService.onAnimate.subscribe(this.#animate);

    // Watch position changes and update board
    effect(() => {
      const pos = this.position();
      if (pos?.currentHash !== this.lastHash()) {
        this.lastHash.set(pos?.currentHash);
        this.updateBoard();
      }
    });
  }

  onSelectCell($event: Event) {
    // eslint-disable-next-line no-console
    console.log($event);
  }

  ngOnDestroy(): void {
    // Later, you can stop observing
    this.animationSub.unsubscribe();
   // window.removeEventListener("resize", this.sizeMutated);
  }

  ngOnInit() {
    this.updateBoard();
  }

  ngOnChanges(changes: SimpleChanges2<ChessboardComponent>): void {
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
        (this.cbImage.nativeElement as HTMLDivElement).style.cursor = "unset";
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
    this.focusOut.emit();
  }

  clearCells() {
    const cells: UiCell[] = [];
    for (let i = 0; i < 64; i++) {
      cells.push({
        location: GetLocationFromIndex(i),
        piece: null,
      });
    }
    this.uiCells.set(cells);
  }

  updateBoard() {
    this.clearCells();
    const pp = this.position()?.pieces;
    const cells = this.uiCells();
    if (pp) {
      for (const piece of pp) {
        const index = GetSquareIndex(piece.column, piece.traverse);
        if (index < 0 || index > 63) {
          console.error(piece.column, piece.traverse);
        }
        cells[index].piece = piece;
      }
    }
    if (this.canvasBoard && pp) {
      const mappedPieces: BP[] = pp.map((p: Piece) => p.ConvertToCanvasPiece());
      const bps = mappedPieces.filter(notNull);
      this.canvasBoard.SetPieces(bps);
    }

    if (this.BoardType === "canvas" && this.canvasBoard) {
      this.canvasBoard.Redraw();
    }
  }
  onMouseUp(cell: UiCell, $event: MouseEvent) {
    const haskeymod = $event.ctrlKey || $event.altKey || $event.metaKey || $event.shiftKey;
    if ($event.button === 1 && !haskeymod) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      $event.stopPropagation();
      this.cellMiddleClick.emit({ ...cell.location });
    }
  }
  onMouseDown(_cell: UiCell, $event: MouseEvent) {
    const haskeymod = $event.ctrlKey || $event.altKey || $event.metaKey || $event.shiftKey;
    if ($event.button === 1 && !haskeymod) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      $event.stopPropagation();
    }
  }
  onCellClick(cell: UiCell) {
    this.cellClick.emit({ ...cell.location });
    const current = this.currentCell();
    if (cell !== current) this.currentCell.set(cell);
    else this.currentCell.set(null);
    this.currentCellChanged.emit(
      this.currentCell() ? { ...this.currentCell()!.location } : null
    );
  }
  copyFen() {
    const fenValue = this.fen();
    if (!fenValue) {
      this.snackBar.open("No FEN to copy!", undefined, {
        verticalPosition: "top",
        politeness: "assertive",
        duration: 1000,
      });
      return
    }
    navigator.clipboard.writeText(fenValue);
    this.snackBar.open("Fen copied to clipboard!", undefined, {
      verticalPosition: "top",
      politeness: "assertive",
      duration: 1000,
    });
  }


  ngAfterViewInit() {
    // Create an observer instance linked to the callback function
    window.addEventListener("resize", this.sizeMutated);
    setTimeout(() => {
      this.sizeMutated();
    }, 0);
  }

  private sizeMutated = () => {
    this.cellSize =
      (this.chessboard.nativeElement as HTMLDivElement).offsetWidth / 8;
  };

  cellInfo(cell: UiCell) {
    return `${(cell.piece?.ToLongDescription() ?? "")} ${cell.location.column.slice(-1).toLowerCase()}${cell.location.traverse.slice(-1)}`;
  }

  triggerContextOnCell($event: MouseEvent, cell: UiCell) {
    this.contextOnCell.emit({ event: $event, location: cell.location });
  }

  #animate(animation: Animations) {
    switch (animation) {
      case "rotateLeft":
        this.cbHtml.nativeElement.classList.add("rotateLeft");
        break;
      case "rotateRight":
        this.cbHtml.nativeElement.classList.add("rotateRight");
        break;
      default:
        break;
    }
  }
}
const notNull = <T>(v: T | null): v is T => v != null;

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

const getPieceIcon = (
  figurine: string,
  cellSize: number,
  rot: number | null
) => {
  const canvas = document.createElement("canvas");
  canvas.width = cellSize;
  canvas.height = cellSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Can not create 2d context!");
  }
  const fsize = Math.floor(cellSize / 1.44);
  const margin = Math.floor((cellSize - fsize) / 2);
  ctx.font = `${fsize}px ${figurine === "X" ? "Arial, sans" : "ScacchiPainter"
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
  ctx.strokeText(figurine === "X" ? "🗙" : figurine, 0, 0);
  ctx.fillText(figurine === "X" ? "🗙" : figurine, 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/png");
};
