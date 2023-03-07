import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import {
  CurrentProblemService,
  SquareLocation,
  IPiece,
  getCanvasRotation,
  notNull,
  DbmanagerService,
} from "@sp/dbmanager/src/public-api";
import { Subscription, BehaviorSubject } from "rxjs";
import { Location } from "@angular/common";
import { MatMenuTrigger } from "@angular/material/menu";
import { EditCommand } from "@sp/ui-elements/src/lib/toolbar-edit/toolbar-edit.component";
import { Piece } from "@sp/dbmanager/src/lib/models";
import { MatDialog } from "@angular/material/dialog";
import { TwinDialogComponent } from "../twin-dialog/twin-dialog.component";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { ConditionsDialogComponent } from "../conditions-dialog/conditions-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { EngineManagerService } from "@sp/dbmanager/src/public-api";
import { istructionRegExp, outlogRegExp } from "../constants/constants";
import { EditModes } from "@sp/ui-elements/src/lib/toolbar-piece/toolbar-piece.component";

@Component({
  selector: "app-edit-problem",
  templateUrl: "./edit-problem.component.html",
  styleUrls: ["./edit-problem.component.less"],
})
export class EditProblemComponent implements OnInit, OnDestroy {
  public get rows$() {
    return this.rows$ubject.asObservable();
  }

  public get problem() {
    return this.current.Problem;
  }

  public get engineEnabled() {
    return this.engine && this.engine.supportsSolve;
  }

  solveInProgress: boolean;

  constructor(
    private current: CurrentProblemService,
    private location: Location,
    private route: ActivatedRoute,
    private engine: EngineManagerService,
    private dialog: MatDialog,
    private dbManager: DbmanagerService
  ) {
    this.engine.isSolving$.subscribe((state) => {
      this.solveInProgress = state;
    });
  }

  @ViewChild(MatMenuTrigger, { static: false }) menu: MatMenuTrigger;
  @ViewChild("panelleft") panelleft: ElementRef;

  private subscribe: Subscription;

  public editMode: EditModes = "select";
  public rows: string[] = [];
  public boardType: "HTML" | "canvas" = "HTML";
  public rows$ubject = new BehaviorSubject<string[]>([]);
  menuX = 0;
  menuY = 0;

  private resizing = { x: NaN, initialW: NaN };

  private leaveTimeout?: ReturnType<typeof setTimeout>;

  private commandMapper: { [key in EditCommand]: () => void } = {
    flipH: () => this.current.FlipBoard("y"),
    flipV: () => this.current.FlipBoard("x"),
    rotateL: () => this.current.RotateBoard("left"),
    rotateR: () => this.current.RotateBoard("right"),
    moveU: () => this.current.ShiftBoard("y"),
    moveD: () => this.current.ShiftBoard("-y"),
    moveL: () => this.current.ShiftBoard("-x"),
    moveR: () => this.current.ShiftBoard("x"),
    resetPosition: () => this.current.Reload(), // reload current snapshot
    clearBoard: () => this.current.ClearBoard(),
  };

  pieceToAdd: string | null = null;
  rotationToAdd: number | null = null;
  pieceToMove: Piece | null = null;

  private actualCursor: null | {
    figurine: string | null;
    rotation: number | null;
  } = {
    figurine: null,
    rotation: null,
  };

  get boardCursor(): {
    figurine: string | null;
    rotation: number | null;
  } | null {
    const figurine =
      this.editMode === "select"
        ? null
        : this.pieceToAdd ??
          this.pieceToMove?.cursor() ??
          (this.editMode === "remove" ? "X" : null);
    const rotation =
      this.rotationToAdd ??
      (this.pieceToMove?.rotation
        ? getCanvasRotation(this.pieceToMove.rotation)
        : null) ??
      null;

    if (
      figurine &&
      (this.actualCursor?.figurine !== figurine ||
        this.actualCursor.rotation !== rotation)
    ) {
      this.actualCursor = {
        figurine,
        rotation,
      };
    }

    return this.actualCursor;
  }

  switchBoardType() {
    this.boardType = this.boardType === "HTML" ? "canvas" : "HTML";
    this.resetActions();
  }
  onTriggerContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.menuX = event.x - 20;
    this.menuY = event.y - 40;
    this.menu.openMenu();
    this.editMode = "select";
    this.resetActions();
  }

  startSolve() {
    this.rows = [];
    this.rows$ubject.next(this.rows);
    if (this.current.Problem) {
      this.current.Problem.htmlSolution = "";
      this.current.Problem.textSolution = "";
      this.engine.startSolving(this.current.Problem);
    }
    this.resetActions();
  }

  stopSolve() {
    this.engine.stopSolving();
    this.resetActions();
  }

  goBack() {
    this.location.back();
    this.resetActions();
  }

  ngOnInit(): void {
    this.subscribe = this.engine.solution$.subscribe((msg) => {
      this.rows.push(...msg.replace(/\r/g, "").split("\n"));
      this.rows$ubject.next(this.rows);
      if (this.current.Problem) {
        this.current.Problem.htmlSolution = this.toHtml(this.rows);
        this.current.Problem.textSolution = this.rows.join(`\n`);
      }
    });

    this.route.params.subscribe((params) => {
      setTimeout(() => {
        if (this.dbManager.All.length === 0) {
          this.dbManager.Reload(+params.id);
        } else {
          this.dbManager.GotoIndex(+params.id);
        }
      }, 1);
    });
  }

  ngOnDestroy(): void {
    this.resetActions();
    this.rows$ubject.complete();
    this.rows$ubject.unsubscribe();
    this.subscribe.unsubscribe();
  }

  resize($event: MouseEvent) {
    if (isNaN(this.resizing.x)) return;
    const delta = $event.x - this.resizing.x;
    (this.panelleft.nativeElement as HTMLDivElement).style.width = `${
      this.resizing.initialW + delta
    }px`;
    window.dispatchEvent(new Event("resize"));
  }

  startResize($event: MouseEvent) {
    this.resetActions();
    const width = parseFloat(
      getComputedStyle(this.panelleft.nativeElement as HTMLDivElement).width
    );
    this.resizing = { x: $event.x, initialW: width };
    console.log(`Initial W: ${width}`);
  }

  endResize() {
    this.resizing = { x: NaN, initialW: NaN };
  }

  leaveResize() {
    this.leaveTimeout = setTimeout(() => {
      this.endResize();
    }, 500);
  }

  clearResizeLeave() {
    if (this.leaveTimeout != null) clearTimeout(this.leaveTimeout);
  }

  editCommand($event: EditCommand) {
    this.resetActions();
    this.commandMapper[$event]();
  }
  setPieceToAdd($event: string | null) {
    if (
      this.pieceToAdd === null ||
      ($event != null && this.pieceToAdd !== $event)
    ) {
      this.resetActions();
      this.editMode = $event == null ? "select" : "add";
      this.pieceToAdd = $event;
    } else {
      this.editMode = "select";
      this.resetActions();
    }
  }
  currentCellChange($event: SquareLocation | null) {
    if ($event == null) this.resetActions();
  }
  clickOnCell($event: SquareLocation, button: "left" | "middle") {
    if (button === "middle" && this.editMode === "select") {
      this.current.RemovePieceAt($event);
      this.editMode = "select";
      this.resetActions();
      return;
    }
    if (button === "middle" && this.editMode !== "select") {
      this.editMode = "select";
      this.resetActions();
      return;
    }
    if ($event == null || this.sameCell($event, this.pieceToMove)) {
      this.editMode = "select";
      this.resetActions();
      return;
    }
    if (this.editMode === "remove") {
      this.current.RemovePieceAt($event);
      this.resetActions();
      return;
    }
    if (this.editMode === "add" && this.pieceToAdd != null) {
      this.addPiece(this.pieceToAdd, $event);
      return;
    }
    if (this.editMode === "move") {
      if (this.pieceToMove == null) {
        this.prepareMovePiece(
          this.current.Problem?.GetPieceAt($event.column, $event.traverse)
        );
      } else {
        this.completeMove($event);
      }
      return;
    }
    if (this.editMode === "select") {
      const piece = this.current.Problem?.GetPieceAt(
        $event.column,
        $event.traverse
      );
      if (piece != null) {
        this.editMode = "move";
        this.prepareMovePiece(piece);
      }
      return;
    }
  }
  editModeChanged($event: EditModes) {
    this.resetActions();
    this.editMode = $event;
  }

  boardBlur() {
    // no op
  }

  private addPiece(figurine: string, loc: SquareLocation) {
    const p = Piece.fromPartial({
      appearance: figurine[2] as IPiece["appearance"],
      color:
        figurine[0] === "w"
          ? "White"
          : figurine[0] === "b"
          ? "Black"
          : "Neutral",
    }) as Piece;
    this.current.AddPieceAt(loc, p);
  }

  private prepareMovePiece(p: Piece | undefined) {
    if (!p) return;
    this.pieceToMove = p;
  }

  private completeMove(loc: SquareLocation) {
    if (!this.pieceToMove) return;
    const from = this.pieceToMove.GetLocation();
    this.current.MovePiece(from, loc, "replace");
    this.editMode = "select";
    this.resetActions();
  }

  private resetActions() {
    this.actualCursor = {
      figurine: null,
      rotation: null,
    };
    this.pieceToAdd = null;
    this.pieceToMove = null;
  }

  private toHtml(rows: string[]) {
    return rows
      .map((f) => {
        const t = tag(f);
        if (t == null) return null;
        return `<div><${t}>${f}</${t}></div>`;
      })
      .filter(notNull)
      .join("");
  }

  private sameCell(loc1: SquareLocation | null, loc2: SquareLocation | null) {
    return loc1?.column === loc2?.column && loc1?.traverse === loc2?.traverse;
  }

  openTwinDialog($event: Twin | null): void {
    const dialogRef = this.dialog.open<TwinDialogComponent, Twin, Twin>(
      TwinDialogComponent,
      {
        width: "25rem",
        maxWidth: "95%",
        data: Twin.fromJson($event?.toJson() ?? {}),
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  openConditionDialog(): void {
    const dialogRef = this.dialog.open<ConditionsDialogComponent, void, string>(
      ConditionsDialogComponent,
      {
        width: "25rem",
        maxWidth: "95%",
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      this.current.AddCondition(result);
    });
  }

  deleteCondition($event: string) {
    console.log("remove condition", $event);
    this.current.RemoveCondition($event);
  }

  deleteTwin($event: Twin) {
    this.current.RemoveTwin($event);
  }
}

const tag = (text: string) => {
  text = text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (istructionRegExp.test(text)) return "em";
  else if (outlogRegExp.test(text)) return null;
  else return "span";
};
