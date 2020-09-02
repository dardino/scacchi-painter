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
} from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Subscription, BehaviorSubject } from "rxjs";
import { Location } from "@angular/common";
import { MatMenuTrigger } from "@angular/material/menu";
import {
  EditCommand,
  EditModes,
} from "@sp/ui-elements/src/lib/toolbar-edit/toolbar-edit.component";
import { Piece } from "@sp/dbmanager/src/lib/models";
import { MatDialog } from "@angular/material/dialog";
import { TwinDialogComponent } from "../twin-dialog/twin-dialog.component";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { ConditionsDialogComponent } from "../conditions-dialog/conditions-dialog.component";

@Component({
  selector: "app-edit-problem",
  templateUrl: "./edit-problem.component.html",
  styleUrls: ["./edit-problem.component.styl"],
})
export class EditProblemComponent implements OnInit, OnDestroy {
  public get rows$() {
    return this.rows$ubject.asObservable();
  }

  public get problem() {
    return this.current.Problem;
  }

  public get engineEnabled() {
    return this.bridge && this.bridge.supportsSolve;
  }

  constructor(
    private current: CurrentProblemService,
    private location: Location,
    private bridge: HostBridgeService,
    private dialog: MatDialog
  ) {}

  get solveInProgress() {
    return this.bridge.solveInProgress();
  }
  @ViewChild(MatMenuTrigger, { static: false }) menu: MatMenuTrigger;
  @ViewChild("panelright") panelright: ElementRef;

  private subscribe: Subscription;

  public editMode: EditModes = "select";
  public rows: string[] = [];
  public boardType: "HTML" | "canvas" = "HTML";
  public rows$ubject = new BehaviorSubject<string[]>([]);
  menuX = 0;
  menuY = 0;

  private resizing = { x: NaN, initialW: NaN };

  private leaveTimeout = 0;

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

  get boardCursor(): {
    figurine: string | null;
    rotation: number | null;
  } | null {
    const figurine =
      this.pieceToAdd ??
      this.pieceToMove?.cursor() ??
      (this.editMode === "remove" ? "X" : null);
    const rotation =
      this.rotationToAdd ??
      (this.pieceToMove?.rotation
        ? getCanvasRotation(this.pieceToMove.rotation)
        : null) ??
      null;
    return figurine
      ? {
          figurine,
          rotation,
        }
      : null;
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
    this.resetActions();
  }

  startSolve() {
    this.rows = [];
    this.rows$ubject.next(this.rows);
    if (this.current.Problem) {
      this.current.Problem.htmlSolution = "";
      this.bridge.startSolve(this.current.Problem);
    }
    this.resetActions();
  }

  stopSolve() {
    this.bridge.stopSolve();
    this.resetActions();
  }

  goBack() {
    this.location.back();
    this.resetActions();
  }

  ngOnInit(): void {
    this.subscribe = this.bridge.Solver$.subscribe((msg) => {
      this.rows.push(...msg.replace(/\n/g, "").split("\r"));
      this.rows$ubject.next(this.rows);
      if (this.current.Problem) {
        this.current.Problem.htmlSolution = this.toHtml(this.rows);
      }
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
    (this.panelright.nativeElement as HTMLDivElement).style.width = `${
      this.resizing.initialW + delta
    }px`;
    window.dispatchEvent(new Event("resize"));
  }

  startResize($event: MouseEvent) {
    this.resetActions();
    const width = parseFloat(
      getComputedStyle(this.panelright.nativeElement as HTMLDivElement).width
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
    clearTimeout(this.leaveTimeout);
  }

  editCommand($event: EditCommand) {
    this.resetActions();
    this.commandMapper[$event]();
  }
  setPieceToAdd($event: string | null) {
    this.resetActions();
    this.editMode = $event == null ? "select" : "add";
    this.pieceToAdd = $event;
  }
  setCurrentCell($event: SquareLocation | null) {
    if ($event == null) this.resetActions();
    if (this.editMode === "remove" && $event != null) {
      this.current.RemovePieceAt($event);
    }
    if (this.editMode === "add" && this.pieceToAdd != null && $event != null) {
      this.addPiece(this.pieceToAdd, $event);
    }
    if (this.editMode === "move" && $event != null) {
      if (this.pieceToMove == null) {
        this.prepareMovePiece(
          this.current.Problem?.GetPieceAt($event.column, $event.traverse)
        );
      } else {
        this.completeMove($event);
      }
    }
  }
  editModeChanged($event: EditModes) {
    if ($event !== "add") this.pieceToAdd = null;
    this.editMode = $event;
    this.pieceToMove = null;
  }

  boardBlur() {
    this.editMode = "select";
    this.resetActions();
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
    this.pieceToMove = null;
  }

  private resetActions() {
    this.pieceToAdd = null;
    this.pieceToMove = null;
  }

  private toHtml(rows: string[]) {
    return rows
      .map((f) => {
        const t = tag(f);
        if (t == null) return null;
        return `<p><${t}>${f}</${t}></p>`;
      })
      .filter(notNull)
      .join("");
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
}

const istructionRegExp = new RegExp(
  `^(Popeye|BeginProblem|Pieces|White|Black|Stipulation|Option|Twin|EndProblem|Condition|SetPlay|Executing|solution finished).*$`
);
const outlogRegExp = new RegExp(
  `^(ERR:|Execute|Popeye|starting engine|Engine process|program exited).*$`
);

function tag(text: string) {
  text = text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (istructionRegExp.test(text)) return "em";
  else if (outlogRegExp.test(text)) return null;
  else return "span";
}
