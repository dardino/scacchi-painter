import { Component, OnInit, OnDestroy } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Subscription, Subject, BehaviorSubject } from "rxjs";

@Component({
  selector: "app-edit-problem",
  templateUrl: "./edit-problem.component.html",
  styleUrls: ["./edit-problem.component.styl"],
})
export class EditProblemComponent implements OnInit, OnDestroy {
  private subscribe: Subscription;
  public rows: string[] = [];
  public rows$ubject = new BehaviorSubject<string[]>([]);

  public get rows$() { return this.rows$ubject.asObservable(); }

  public get problem() {
    return this.db.CurrentProblem;
  }

  constructor(
    private db: DbmanagerService,
    private bridge: HostBridgeService
  ) {}

  startSolve() {
    this.rows = [];
    this.rows$ubject.next(this.rows);
    if (this.db.CurrentProblem) this.bridge.startSolve(this.db.CurrentProblem);
  }

  stopSolve() {
    this.bridge.stopSolve();
  }

  get solveInProgress() {
    return this.bridge.solveInProgress();
  }

  ngOnInit(): void {
    this.subscribe = this.bridge.Solver$.subscribe(msg => {
      this.rows.push(msg);
      this.rows$ubject.next(this.rows);
    });
  }

  ngOnDestroy(): void {
    this.rows$ubject.complete();
    this.rows$ubject.unsubscribe();
    this.subscribe.unsubscribe();
  }
}
