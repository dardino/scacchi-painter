import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, computed, effect, inject, input, output, signal, viewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  FairySquare,
  type CellClickEventDetail,
  type ChessBoard,
  type ChessPieceRotation,
  type FenChangeEventDetail,
} from "@dardino/chess-board";
import { Piece, Problem } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { Columns, IProblemV4, Traverse } from "@sp/dbmanager/src/lib/SPX.v4";
import {
  GetLocationFromIndex,
  GetSquareIndex,
  SquareLocation,
  getFFenFromPosition,
  updatePositionFromFen,
} from "@sp/dbmanager/src/public-api";
import { getPieceIcon } from "@sp/gui/src/app/services/cursor.service";
import html2canvas from "html2canvas";
import { Subscription } from "rxjs";
import { Animations, ChessboardAnimationService } from "./chessboard-animation.service";

@Component({
  selector: "lib-chessboard",
  templateUrl: "chessboard.component.html",
  imports: [CommonModule, DragDropModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ["chessboard.component.scss"],
})
export class ChessboardComponent
implements OnInit, OnChanges, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private animationService = inject(ChessboardAnimationService);

  hideInfo = input<boolean>(false);
  smallBoard = input<boolean>(false);
  hideLabels = input<boolean>(false);
  cursor = input<{ figurine: string | null; rotation: ChessPieceRotation | null } | null>(null);
  position = input<Problem | null>(null);
  selectedPieceSquare = input<FairySquare | null>(null);

  getTraverse(location: SquareLocation) {
    return 8 - Traverse.indexOf(location.traverse);
  }

  chessboard = viewChild<ElementRef<ChessBoard>>("chessboard");
  container = viewChild<ElementRef<HTMLDivElement>>("container");

  focusOut = output<void>();
  currentCellChanged = output<SquareLocation | null>();
  positionChanged = output<IProblemV4>();
  clickOnCell = output<{
    location: SquareLocation;
    button: "left" | "middle";
    modifiers: {
      ctrlKey: boolean;
      altKey: boolean;
      metaKey: boolean;
      shiftKey: boolean;
    };
  }>();

  contextOnCell = output<{ location: SquareLocation; mousePosition: { x: number; y: number } }>();

  currentCell = signal<UiCell | null>(null);
  private lastHash = signal<string | undefined>(undefined);
  private uiCells = signal<UiCell[]>([]);

  cells = computed(() => this.uiCells());

  cellSize = () => (this.chessboard()?.nativeElement.offsetWidth ?? 256) / 8;

  fen = computed(() => {
    return getFFenFromPosition(this.position());
  });

  internalFenChanged($event: CustomEvent<FenChangeEventDetail>) {
    const newFen = $event.detail.fen;
    const position = updatePositionFromFen(newFen, this.position() ?? undefined);
    this.positionChanged.emit(position);
    return position;
  }

  pieceCounter = computed(() => this.position()?.getPieceCounter());
  twins = computed(() => this.position()?.twins.TwinList.map((t: Twin) => t.toString()) ?? []);
  viewDiagram = computed(() => {
    const twinList = this.position()?.twins.TwinList ?? [];
    return twinList.length > 1 && twinList.some((t: Twin) => t.TwinType === "Diagram");
  });

  viewZeroPosition = computed(() => {
    const twinList = this.position()?.twins.TwinList ?? [];
    return twinList.length > 1 && twinList.every((t: Twin) => t.TwinType !== "Diagram");
  });

  stipulationDesc = computed(() => this.position()?.stipulation.completeStipulationDesc ?? "");

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
      const selectedPieceSquare = this.selectedPieceSquare();
      if (selectedPieceSquare) {
        this.chessboard()?.nativeElement.selectPiece(selectedPieceSquare);
      }
      else {
        this.chessboard()?.nativeElement.unselectPiece();
      }
    });
  }

  ngOnDestroy(): void {
    // Later, you can stop observing
    this.animationSub.unsubscribe();
  }

  ngOnInit() {
    this.updateBoard();
  }

  ngOnChanges(changes: SimpleChanges<ChessboardComponent>): void {
    const cbHtml = this.container();
    if (changes.cursor?.currentValue && cbHtml) {
      const cellSize = this.cellSize();
      if (changes.cursor.currentValue.figurine != null) {
        const dataURL = getPieceIcon(
          changes.cursor.currentValue.figurine ?? "q",
          cellSize,
          changes.cursor.currentValue.rotation ?? null,
        );
        cbHtml.nativeElement.style.cursor = `url(${dataURL}) ${Math.floor(
          cellSize / 2,
        )} ${Math.floor(cellSize / 2)}, auto`;
      }
      else {
        cbHtml.nativeElement.style.cursor = "unset";
      }
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
  }

  #toCellLocation(detail: CellClickEventDetail): SquareLocation {
    return {
      column: `Col${detail.square[0].toUpperCase()}` as Columns,
      traverse: `Row${detail.square[1]}` as Traverse,
    };
  }

  #getPieceAtLocation(location: SquareLocation): Piece | null {
    return this.position()?.GetPieceAt(location.column, location.traverse) ?? null;
  }

  #lastContextMousePosition: { x: number; y: number } | null = null;
  onCellContextMenu($event: Event) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    $event.stopPropagation();
    if ($event.type === "cellContextClick" && this.#lastContextMousePosition) {
      const eventDetail = ($event as CustomEvent<CellClickEventDetail>).detail;
      const location = this.#toCellLocation(eventDetail);
      this.contextOnCell.emit({ location, mousePosition: this.#lastContextMousePosition ?? { x: 0, y: 0 } });
      this.#lastContextMousePosition = null;
    }
    else {
      this.#lastContextMousePosition = { x: ($event as MouseEvent).clientX, y: ($event as MouseEvent).clientY };
    }
  }

  onCellClick($event: CustomEvent<CellClickEventDetail>) {
    const location = this.#toCellLocation($event.detail);
    const piece = this.#getPieceAtLocation(location);

    this.clickOnCell.emit({
      location: { ...location },
      button: "left",
      modifiers: {
        ctrlKey: $event.detail.modifiers.ctrlKey,
        altKey: $event.detail.modifiers.altKey,
        metaKey: $event.detail.modifiers.metaKey,
        shiftKey: $event.detail.modifiers.shiftKey,
      },
    });
    const current = this.currentCell();
    if (location !== current?.location) this.currentCell.set({ location, piece });
    else this.currentCell.set(null);
    this.currentCellChanged.emit(
      this.currentCell() ? { ...this.currentCell()!.location } : null,
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
      return;
    }
    navigator.clipboard.writeText(fenValue);
    this.snackBar.open("Fen copied to clipboard!", undefined, {
      verticalPosition: "top",
      politeness: "assertive",
      duration: 1000,
    });
  }

  cellInfo(cell: UiCell) {
    return `${(cell.piece?.ToLongDescription() ?? "")} ${cell.location.column.slice(-1).toLowerCase()}${cell.location.traverse.slice(-1)}`;
  }

  async takeSnapshot() {
    const board = this.chessboard()?.nativeElement;
    if (!board) return null;
    const canvas = await html2canvas(board);
    const url = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) resolve(null);
        else resolve(blob);
      }, "image/png");
    });
    return url;
  }

  #stopAnimation = (animation: Animations) => {
    switch (animation) {
      case "rotateLeft":
        this.chessboard()?.nativeElement.classList.remove("rotateLeft");
        break;
      case "rotateRight":
        this.chessboard()?.nativeElement.classList.remove("rotateRight");
        break;
      default:
        break;
    }
  };

  #animate = (animation: Animations) => {
    const chessboardElement = this.chessboard()?.nativeElement;
    if (!chessboardElement) return;
    switch (animation) {
      case "rotateLeft":
        chessboardElement.classList.add("rotateLeft");
        setTimeout(() => this.#stopAnimation("rotateLeft"),
          parseFloat(getComputedStyle(chessboardElement).getPropertyValue("--animation-duration")) * 1000);
        break;
      case "rotateRight":
        chessboardElement.classList.add("rotateRight");
        setTimeout(() => this.#stopAnimation("rotateRight"),
          parseFloat(getComputedStyle(chessboardElement).getPropertyValue("--animation-duration")) * 1000);
        break;
      default:
        break;
    }
  };
}

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
