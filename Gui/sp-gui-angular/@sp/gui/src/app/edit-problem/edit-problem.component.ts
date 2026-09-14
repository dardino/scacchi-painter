import { CommonModule, Location } from "@angular/common";
import { AfterViewInit, Component, EffectRef, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, computed, effect, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute } from "@angular/router";
import { ModifierKeys, type ChessPieceRotation } from "@dardino/chess-board";
import { ChessboardAnimationService } from "@sp/chessboard/src/lib/chessboard-animation.service";
import { PieceSelectorComponent } from "@sp/chessboard/src/lib/piece-selector/piece-selector.component";
import { ChessboardModule } from "@sp/chessboard/src/public-api";
import { Author, Piece } from "@sp/dbmanager/src/lib/models";
import { cloneEngineConfiguration, cloneEngineConfigurationsByEngine } from "@sp/dbmanager/src/lib/models/engine";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import { IPiece, IProblem } from "@sp/dbmanager/src/lib/SPX";
import {
  CurrentProblemService,
  EngineManagerService,
  SquareLocation,
  getCanvasRotation,
  notNull,
} from "@sp/dbmanager/src/public-api";
import { Engines, SolutionRow } from "@sp/host-bridge/src/lib/bridge-global";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { SpSolutionDescComponent } from "@sp/ui-elements/src/lib/sp-solution-desc/sp-solution-desc.component";
import { EditCommand, ToolbarEditComponent } from "@sp/ui-elements/src/lib/toolbar-edit/toolbar-edit.component";
import { ToolbarEngineComponent, ViewModes } from "@sp/ui-elements/src/lib/toolbar-engine/toolbar-engine.component";
import { EditModes } from "@sp/ui-elements/src/lib/toolbar-piece/toolbar-piece.component";
import { ProblemInfoComponent } from "@sp/ui-elements/src/public-api";
import { istructionRegExp, outlogRegExp } from "../constants/constants";
import { PreferencesService } from "../services/preferences.service";

@Component({
  selector: "app-edit-problem",
  templateUrl: "./edit-problem.component.html",
  styleUrls: ["./edit-problem.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    ToolbarEditComponent,
    ChessboardModule,
    PieceSelectorComponent,
    ProblemInfoComponent,
    ToolbarEngineComponent,
    SpSolutionDescComponent,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class EditProblemComponent implements OnInit, OnDestroy, AfterViewInit {
  activeTab = signal(0);

  private current = inject(CurrentProblemService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private engine = inject(EngineManagerService);
  private dialogService = inject(DialogService);
  private preferences = inject(PreferencesService);
  private snackBar = inject(MatSnackBar);
  private chessanim = inject(ChessboardAnimationService);

  public get problem() { return this.current.Problem; }

  public get engineEnabled() {
    return this.engine?.supportsSolve === true;
  }

  solveInProgress = signal(false);
  solutionCount = signal(0);
  showLog = signal(false);
  availableEngines: Engines[] = [];
  selectedEngine = signal<Engines>("Popeye");
  viewMode = signal<ViewModes>("html");

  effects: EffectRef[] = [];
  constructor() {
    this.availableEngines = this.engine.availableEngines();
    this.selectedEngine.set(this.availableEngines[0] ?? "Popeye");

    this.effects.push(effect(() => {
      const isSolving = this.engine.isSolving() ?? false;
      this.solveInProgress.set(isSolving);
    }));
    this.effects.push(effect(() => {
      const newSolutionRow = this.engine.solution();
      if (newSolutionRow === null) return;
      queueMicrotask(() => {
        this.appendSolutionMessage(newSolutionRow);
      });
    }));
  }

  @ViewChild(MatMenuTrigger, { static: false }) menu: MatMenuTrigger;
  @ViewChild("panelleft") panelleft: ElementRef<HTMLDivElement>;
  @ViewChild("workboard") workboard: ElementRef<HTMLDivElement>;

  public editMode = signal<EditModes>("select");

  menuX = signal(0);
  menuY = signal(0);
  contextOnCell: SquareLocation | null = null;

  private resizing = { x: NaN, initialW: NaN };

  private leaveTimeout?: ReturnType<typeof setTimeout>;

  private commandMapper: Record<EditCommand, () => void> = {
    flipH: () => this.current.FlipBoard("y"),
    flipV: () => this.current.FlipBoard("x"),
    rotateL: () => {
      this.chessanim.animate("rotateLeft");
      this.current.RotateBoard("left");
    },
    rotateR: () => {
      this.chessanim.animate("rotateRight");
      this.current.RotateBoard("right");
    },
    moveU: () => this.current.ShiftBoard("-y"),
    moveD: () => this.current.ShiftBoard("y"),
    moveL: () => this.current.ShiftBoard("-x"),
    moveR: () => this.current.ShiftBoard("x"),
    resetPosition: () => this.current.Reload(), // reload current snapshot
    updatePosition: () => this.current.UpdateSnapshot(), // update current snapshot
    clearBoard: () => this.current.ClearBoard(),
    copyToClipboard: () => this.onCopy(),
    pasteFromClipboard: async () => {
      const text = await navigator.clipboard.readText();
      this.onPaste(undefined, text);
    },
  };

  pieceToAdd = signal<string | null>(null);
  rotationToAdd = signal<ChessPieceRotation | null>(null);
  pieceToMove = signal<Piece | null>(null);

  private actualCursor: {
    figurine: string | null;
    rotation: ChessPieceRotation | null;
  } = {
    figurine: null,
    rotation: null,
  };

  boardCursor = computed<{
    figurine: string | null;
    rotation: ChessPieceRotation | null;
  } | null>(() => {
    const editModeValue = this.editMode();
    const editModeCursor = (editModeValue === "remove" ? "X" : null);
    const pieceToMoveValue = this.pieceToMove();
    const figurine
      = editModeValue === "select"
        ? null
        : this.pieceToAdd()
          ?? pieceToMoveValue?.cursor() ?? editModeCursor;

    const rotation
      = this.rotationToAdd()
        ?? (pieceToMoveValue?.rotation
          ? getCanvasRotation(pieceToMoveValue.rotation)
          : null)
        ?? null;

    const currentCursor = this.actualCursor;

    if (
      figurine
      && (currentCursor?.figurine !== figurine
        || currentCursor.rotation !== rotation)
    ) {
      this.actualCursor = {
        figurine,
        rotation,
      };
    }
    return this.actualCursor;
  });

  toggleLog = () => this.showLog.update(v => !v);

  toggleEditor($event: ViewModes) {
    this.viewMode.set($event);
  }

  openSolveEngineDialog() {
    this.dialogService.solverEngineSettings({
      availableEngines: this.availableEngines,
      engine: this.selectedEngine(),
      engineConfig: this.current.Problem()?.engineConfig ?? null,
      engineConfigurationsByEngine: this.current.Problem()?.engineConfigurationsByEngine ?? null,
    }).subscribe((result) => {
      if (result == null) return;
      this.selectedEngine.set(result.engine);
      const problem = this.current.Problem();
      if (problem) {
        problem.engine = result.engine;
        problem.engineConfigurationsByEngine = cloneEngineConfigurationsByEngine(result.engineConfigurationsByEngine) ?? {};
        problem.engineConfig = cloneEngineConfiguration(result.engineConfig) ?? {};
      }
    });
  }

  onTriggerContextMenu(data: { location: SquareLocation; mousePosition: { x: number; y: number } }) {
    this.menuX.set(data.mousePosition.x - 20);
    this.menuY.set(data.mousePosition.y - 40);
    this.menu.openMenu();
    this.editMode.set("select");
    this.contextOnCell = data.location;
    this.resetActions();
  }

  startSolve(mode: "start" | "try") {
    this.resetActions();
    if (!this.problem()) {
      console.warn("[WARN] -> No problem selected!");
      return;
    }

    this.solutionCount.set(0);
    const prob = this.problem()?.clone();
    if (prob) {
      prob.engine = this.selectedEngine();
      prob.jsonSolution = [];
      prob.htmlSolution = "";
      prob.textSolution = "";
      this.current.SetProblem(() => prob);
      this.engine.startSolving(prob, mode);
    }
  }

  stopSolve() {
    this.resetActions();
    this.engine.stopSolving();
  }

  goBack() {
    this.resetActions();
    this.location.back();
  }

  // #region NG Component life cycle
  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      const problemId = Number.parseInt(params.id, 10);
      if (!Number.isFinite(problemId)) {
        return;
      }
      this.current.ReloadFromDbManager(problemId);

      const problemEngine = this.current.Problem()?.engine;
      if (problemEngine && this.availableEngines.includes(problemEngine)) {
        this.selectedEngine.set(problemEngine);
      }
      else {
        const fallbackEngine = this.availableEngines[0] ?? "Popeye";
        this.selectedEngine.set(fallbackEngine);
        const problem = this.current.Problem();
        if (problem) {
          problem.engine = fallbackEngine;
        }
      }
    });
  }

  private appendSolutionMessage(msg: SolutionRow) {
    const newProblem = this.current.Problem()?.clone();
    if (!newProblem) return;
    const raw = msg.raw.replace(/[\r\n]+/g, "\n").split("\n");
    newProblem.htmlSolution += this.toHtml([...raw]);
    newProblem.textSolution += raw.join(`\n`);
    newProblem.jsonSolution.push(...msg.moveTree);
    this.current.SetProblem(() => newProblem);
  }

  ngOnDestroy(): void {
    this.endResize();
    this.resetActions();
    this.effects.forEach(e => e.destroy());
    this.effects = [];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      document.adoptedStyleSheets = [new CSSStyleSheet()];
      this.applyPreferences();
    });
  }
  // #endregion NG Component life cycle

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
    const adoptedStyleSheet = document.adoptedStyleSheets.at(0);
    if (!adoptedStyleSheet) {
      return;
    }
    adoptedStyleSheet.replace(`:root {
      --edit-window-width: ${this.preferences.editWindowWidth}px;
    }`);
  }

  startResize($event: MouseEvent) {
    this.resetActions();
    const width = parseFloat(
      getComputedStyle(this.panelleft.nativeElement as HTMLDivElement).width,
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
    const currentPieceToAdd = this.pieceToAdd();
    if (
      currentPieceToAdd === null
      || ($event != null && currentPieceToAdd !== $event)
    ) {
      this.resetActions();
      this.editMode.set($event == null ? "select" : "add");
      this.pieceToAdd.set($event);
    }
    else {
      this.editMode.set("select");
      this.resetActions();
    }
  }

  currentCellChange($event: SquareLocation | null) {
    if ($event == null) this.resetActions();
  }

  onChessboardPositionChanged($event: IProblem | null) {
    this.resetActions();
    if ($event == null) return;
    this.current.PasteJson($event);
  }

  clickOnCell($event: SquareLocation, button: "left" | "middle", modifiers: ModifierKeys) {
    const editModeValue = this.editMode();
    const pieceToMoveValue = this.pieceToMove();
    if (button === "middle") {
      this.current.RemovePieceAt($event);
      this.editMode.set("select");
      this.resetActions();
      return;
    }
    if ($event == null || this.sameCell($event, pieceToMoveValue)) {
      this.editMode.set("select");
      this.resetActions();
      return;
    }
    if (editModeValue === "remove") {
      this.current.RemovePieceAt($event);
      this.resetActions();
      return;
    }
    const pieceToAddValue = this.pieceToAdd();
    if (editModeValue === "add" && pieceToAddValue != null) {
      this.addPiece(pieceToAddValue, $event);
      this.resetActions();
      return;
    }
    if (editModeValue === "add" && pieceToAddValue == null) {
      this.editMode.set("select");
    }
    if (editModeValue === "move") {
      if (pieceToMoveValue == null) {
        this.prepareMovePiece(
          this.current.Problem()?.GetPieceAt($event.column, $event.traverse),
        );
      }
      else {
        this.completeMove($event, modifiers);
      }
      return;
    }
    if (editModeValue === "select") {
      const piece = this.current.Problem()?.GetPieceAt(
        $event.column,
        $event.traverse,
      );
      if (piece != null) {
        this.editMode.set("move");
        this.prepareMovePiece(piece);
      }
      return;
    }
  }

  editModeChanged($event: EditModes) {
    this.resetActions();
    this.editMode.set($event);
  }

  boardBlur() {
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
    this.pieceToMove.set(p);
  }

  private completeMove(loc: SquareLocation, modifiers: ModifierKeys) {
    const pieceToMoveValue = Piece.fromPartial(this.pieceToMove()?.toJson());
    if (!pieceToMoveValue) return;
    const from = pieceToMoveValue.GetLocation();
    if (modifiers.altKey) {
      // Change piece color:
      pieceToMoveValue.color
        = pieceToMoveValue.color === "White"
          ? "Black"
          : "White";
    }
    if (modifiers.shiftKey) {
      this.current.AddPieceAt(loc, pieceToMoveValue);
    }
    else {
      this.current.MovePiece(from, loc, "replace");
    }
    this.editMode.set("select");
    this.resetActions();
  }

  private resetActions() {
    this.actualCursor = {
      figurine: null,
      rotation: null,
    };
    this.pieceToAdd.set(null);
    this.pieceToMove.set(null);
  }

  private sameCell(loc1: SquareLocation | null, loc2: SquareLocation | null) {
    return loc1?.column === loc2?.column && loc1?.traverse === loc2?.traverse;
  }

  openTwinDialog($event: Twin | null): void {
    this.dialogService.twinDialog(Twin.fromJson($event?.toJson() ?? {})).subscribe((result) => {
      if (result == null) return;
      this.current.AddTwin(result);
    });
  }

  openConditionDialog(): void {
    this.dialogService.fairyConditions().subscribe((result) => {
      this.current.AddCondition(result);
    });
  }

  openAuthorDialog($event: Author | null): void {
    this.dialogService.authors($event).subscribe((result) => {
      if (!result) return;
      this.current.AddOrUpdateAuthor(result);
    });
  }

  deleteCondition($event: string) {
    this.current.RemoveCondition($event);
  }

  deleteTwin($event: Twin) {
    this.current.RemoveTwin($event);
  }

  deleteAuthor($event: Author) {
    const modal = this.dialogService.confirmDialog({
      cancelText: "No!",
      confirmText: "Yes! Remove Author!",
      message: `Are you sure you want to remove the author ${$event.nameAndSurname} (${$event.AuthorID})? This operation cannot be undone!`,
      title: "Remove Author Confirm",
    }).subscribe((res) => {
      if (res === true) {
        this.current.RemoveAuthor($event);
      }
      modal.unsubscribe();
    });
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

  @HostListener("window:copy", ["$event"])
  private onCopy = ($event?: ClipboardEvent): void => {
    if ($event?.target instanceof HTMLElement && isEditable($event.target)) return;

    if ($event) {
      $event.preventDefault();
    }
    try {
      const json = this.current.GetJSONString() ?? "";
      navigator.clipboard.writeText(json);
      this.snackBar.open("Position saved to clipboard", undefined, { duration: 1000, verticalPosition: "top" });
    }
    catch (err) {
      this.snackBar.open("Error copying position: " + (err as Error)?.message, undefined, { duration: 1000, verticalPosition: "top" });
    }
  };

  @HostListener("window:paste", ["$event"])
  private onPaste = ($event?: ClipboardEvent, patext?: string) => {
    if ($event?.target && (
      $event.target instanceof HTMLInputElement
      || isEditable($event.target as HTMLElement)
    )) return;

    const text = patext ?? $event?.clipboardData?.getData("text/plain") ?? null;
    if ($event) {
      $event.preventDefault();
    }
    if (text) {
      // TODO: [#170] check if text is a FEN, in this case use the method `this.current.PasteFEN`
      try {
        const probJSON = JSON.parse(text);
        this.current.PasteJson(probJSON);
      }
      catch (err) {
        this.snackBar.open("Error pasting position: " + (err as Error)?.message, undefined, { duration: 1000, verticalPosition: "top" });
      }
    }
  };

  // #region CONTEXT COMMANDS
  ctxDeletePiece() {
    const cell = this.contextOnCell;
    if (cell) {
      this.current.RemovePieceAt(cell);
    }
  }

  ctxSetFairyInfo() {
    // this method should open a dialog to set fairy info for the piece at the current context cell
    if (!this.contextOnCell) return;
    // Open the dialog to set fairy info for the piece at the current context cell
    this.openFairyInfoDialog(this.contextOnCell);
  }

  openFairyInfoDialog(cell: SquareLocation): void {
    const originalPiece = this.current.Problem()?.GetPieceAt(cell.column, cell.traverse) ?? null;
    // Implementation for opening the fairy info dialog
    this.dialogService.fairypieceDialog({
      cell,
      originalPiece,
    }).subscribe((result) => {
      console.log("Fairy info dialog closed with result:", result);
    });
  }
}

const tagAndStyle = (text: string): { t: string; css?: string } => {
  text = text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (outlogRegExp.test(text)) return { t: "em" };
  else if (istructionRegExp.test(text)) return { t: "em" };
  else return { t: "strong" };
};

const isEditable = (element: HTMLElement | null): boolean => {
  if (!element) {
    return false;
  }

  if (element.contentEditable === "true") {
    return true;
  }

  // this case is for ngx-editor!
  if (!element.isConnected) return true;

  return isEditable(element.parentElement);
};
