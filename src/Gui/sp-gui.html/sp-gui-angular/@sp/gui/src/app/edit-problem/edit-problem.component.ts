import { Component, OnInit, OnDestroy } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Subscription, Observable } from "rxjs";

@Component({
  selector: "app-edit-problem",
  templateUrl: "./edit-problem.component.html",
  styleUrls: ["./edit-problem.component.styl"],
})
export class EditProblemComponent implements OnInit, OnDestroy {
  private subscribe: Subscription;
  public rows: string[];

  public get problem() {
    return this.db.CurrentProblem;
  }

  constructor(
    private db: DbmanagerService,
    private bridge: HostBridgeService
  ) {}

  startSolve() {
    this.rows.length = 0;
    if (this.db.CurrentProblem) this.bridge.runSolve(this.db.CurrentProblem);
  }

  stopSolve() {
    this.bridge.stopSolve();
  }

  ngOnInit(): void {
    this.subscribe = this.bridge.Solver$.subscribe(msg => {
      this.rows.push(msg);
    });
  }

  ngOnDestroy(): void {
    this.subscribe.unsubscribe();
  }
}
