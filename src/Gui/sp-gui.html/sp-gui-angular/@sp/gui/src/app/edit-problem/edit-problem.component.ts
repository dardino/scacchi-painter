import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Subscription, BehaviorSubject } from "rxjs";
import { Location } from "@angular/common";
import { MatMenuTrigger } from "@angular/material/menu";

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
    return this.db.CurrentProblem;
  }

  constructor(
    private db: DbmanagerService,
    private location: Location,
    private bridge: HostBridgeService
  ) {}

  get solveInProgress() {
    return this.bridge.solveInProgress();
  }
  @ViewChild(MatMenuTrigger, { static: false }) menu: MatMenuTrigger;
  @ViewChild("panelright") panelright: ElementRef;

  private subscribe: Subscription;
  public rows: string[] = [];
  public boardType: "HTML" | "canvas" = "HTML";
  public rows$ubject = new BehaviorSubject<string[]>([]);
  menuX = 0;
  menuY = 0;

  private resizing = { x: NaN, initialW: NaN };

  private leaveTimeout = 0;
  switchBoardType() {
    this.boardType = this.boardType === "HTML" ? "canvas" : "HTML";
  }
  onTriggerContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.menuX = event.x - 20;
    this.menuY = event.y - 20;
    this.menu.openMenu();
  }

  startSolve() {
    this.rows = [];
    this.rows$ubject.next(this.rows);
    if (this.db.CurrentProblem) this.bridge.startSolve(this.db.CurrentProblem);
  }

  stopSolve() {
    this.bridge.stopSolve();
  }

  goBack() {
    this.location.back();
  }

  ngOnInit(): void {
    this.subscribe = this.bridge.Solver$.subscribe((msg) => {
      this.rows.push(msg);
      this.rows$ubject.next(this.rows);
    });
  }

  ngOnDestroy(): void {
    this.rows$ubject.complete();
    this.rows$ubject.unsubscribe();
    this.subscribe.unsubscribe();
  }
  resize($event: MouseEvent) {
    if (isNaN(this.resizing.x)) return;
    const delta = $event.x - this.resizing.x;
    console.log(`Y: ${$event.y}, DELTA: ${delta}`);
    (this.panelright.nativeElement as HTMLDivElement).style.width = `${
      this.resizing.initialW + delta
    }px`;
    window.dispatchEvent(new Event("resize"));
  }
  startResize($event: MouseEvent) {
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
}
