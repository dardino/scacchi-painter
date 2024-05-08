import { Location } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { ActivatedRoute } from "@angular/router";
import { Piece } from "@sp/dbmanager/src/lib/models";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import {
  CurrentProblemService,
  DbmanagerService,
  EngineManagerService,
  IPiece,
  SquareLocation,
  getCanvasRotation,
  notNull,
} from "@sp/dbmanager/src/public-api";
import { EditCommand } from "@sp/ui-elements/src/lib/toolbar-edit/toolbar-edit.component";
import { ViewModes } from "@sp/ui-elements/src/lib/toolbar-engine/toolbar-engine.component";
import { EditModes } from "@sp/ui-elements/src/lib/toolbar-piece/toolbar-piece.component";
import { BehaviorSubject, Subscription, skip } from "rxjs";
import { ConditionsDialogComponent } from "../conditions-dialog/conditions-dialog.component";
import { istructionRegExp, outlogRegExp } from "../constants/constants";
import { PreferencesService } from "../services/preferences.service";
import { TwinDialogComponent } from "../twin-dialog/twin-dialog.component";

@Component({
  selector: "app-edit-problem",
  templateUrl: "./edit-problem.component.html",
  styleUrls: ["./edit-problem.component.less"],
})
export class EditProblemComponent implements OnInit, OnDestroy, AfterViewInit {
  public get rows$() {
    return this.rows$ubject.asObservable();
  }

  public get problem() {
    return this.current.Problem;
  }

  public get engineEnabled() {
    return this.engine?.supportsSolve === true;
  }

  solveInProgress: boolean;
  showLog: boolean;
  viewMode: ViewModes;

  constructor(
    private current: CurrentProblemService,
    private location: Location,
    private route: ActivatedRoute,
    private engine: EngineManagerService,
    private dialog: MatDialog,
    private dbManager: DbmanagerService,
    private preferences: PreferencesService,
  ) {
    this.engine.isSolving$.subscribe((state) => {
      this.solveInProgress = state;
    });
    this.viewMode = "html";
  }

  @ViewChild(MatMenuTrigger, { static: false }) menu: MatMenuTrigger;
  @ViewChild("panelleft") panelleft: ElementRef<HTMLDivElement>;
  @ViewChild("workboard") workboard: ElementRef<HTMLDivElement>;

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
    moveU: () => this.current.ShiftBoard("-y"),
    moveD: () => this.current.ShiftBoard("y"),
    moveL: () => this.current.ShiftBoard("-x"),
    moveR: () => this.current.ShiftBoard("x"),
    resetPosition: () => this.current.Reload(), // reload current snapshot
    updatePosition: () => this.current.UpdateSnapshot(), // update current snapshot
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
    const editModeCursor = (this.editMode === "remove" ? "X" : null);
    const figurine =
      this.editMode === "select" ? null
        : this.pieceToAdd ??
        this.pieceToMove?.cursor() ?? editModeCursor;

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

  toggleLog = () => this.showLog = !this.showLog;
  changeViewMode($event: ViewModes) {
    this.viewMode = $event;
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


  startSolve(mode: "start" | "try") {
    this.rows = [];
    this.rows$ubject.next(this.rows);
    if (this.current.Problem) {
      this.current.Problem.htmlSolution = "";
      this.current.Problem.textSolution = "";
      this.engine.startSolving(this.current.Problem, mode);
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

  //#region NG Component life cycle
  ngOnInit(): void {
    this.subscribe = this.engine.solution$.pipe(
      skip(1) // skip first execution to avoid the reset of text at load
    ).subscribe((msg) => {
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
    this.endResize();
    this.resetActions();
    this.rows$ubject.complete();
    this.rows$ubject.unsubscribe();
    this.subscribe.unsubscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.applyPreferences();
    });
  }
  //#endregion NG Component life cycle

  resize = ($event: MouseEvent) => {
    if (isNaN(this.resizing.x)) return;
    if ($event.buttons !== 1) {
      this.endResize();
      return;
    }
    const delta = $event.x - this.resizing.x;
    const editWindowWidth = this.resizing.initialW + delta;
    if (this.preferences.editWindowWidth !== editWindowWidth) {
      this.preferences.editWindowWidth = editWindowWidth;
      this.applyPreferences();
    }
  };

  private applyPreferences() {
    this.panelleft.nativeElement.style.flex = `0 0 min(max(330px, ${this.preferences.editWindowWidth}px), calc(100vw - 330px))`;
    window.dispatchEvent(new Event("resize"));
  }

  startResize($event: MouseEvent) {
    this.resetActions();
    const width = parseFloat(
      getComputedStyle(this.panelleft.nativeElement as HTMLDivElement).width
    );
    this.resizing = { x: $event.x, initialW: width };
    this.workboard.nativeElement.addEventListener("mousemove", this.resize);
  }

  endResize() {
    this.resizing = { x: NaN, initialW: NaN };
    this.workboard.nativeElement.removeEventListener("mousemove", this.resize);
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
    if (button === "middle") {
      this.current.RemovePieceAt($event);
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
    if (this.editMode === "add" && this.pieceToAdd == null) {
      this.editMode = "select";
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

  private sameCell(loc1: SquareLocation | null, loc2: SquareLocation | null) {
    return loc1?.column === loc2?.column && loc1?.traverse === loc2?.traverse;
  }

  openTwinDialog($event: Twin | null): void {
    const dialogRef = this.dialog.open<TwinDialogComponent, Twin, Twin | null>(
      TwinDialogComponent,
      {
        minWidth: "25rem",
        maxWidth: "95%",
        data: Twin.fromJson($event?.toJson() ?? {}),
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result == null) return;
      this.current.AddTwin(result);
      console.log("The dialog was closed", result);
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
    this.current.RemoveCondition($event);
  }

  deleteTwin($event: Twin) {
    this.current.RemoveTwin($event);
  }


  private toHtml(rows: string[]) {
    const content = rows
      .map((line) => {
        const { t } = tagAndStyle(line);
        if (t == null) return null;
        const tag = document.createElement("p");
        const subTag = document.createElement(t);
        subTag.innerHTML = line;
        tag.appendChild(subTag);
        return tag.outerHTML;
      })
      .filter(notNull).join("");
    return content;
  }

}

const tagAndStyle = (text: string): { t: string, css?: string } => {
  text = text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (outlogRegExp.test(text)) return { t: "em" };
  else if (istructionRegExp.test(text)) return { t: "em" };
  else return { t: "strong" };
};
