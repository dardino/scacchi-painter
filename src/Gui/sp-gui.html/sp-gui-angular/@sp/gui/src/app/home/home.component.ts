import { Component, OnInit } from "@angular/core";
import { ActionInfo, ActionTypes } from "@sp/ui-elements/src/public-api";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.styl"],
})
export class HomeComponent implements OnInit {
  chessBoardType: "canvas" | "HTML" = "HTML";
  public tlbAction($event: ActionInfo<keyof ActionTypes>) {
    if (ActionInfo.is("SetBoardType", $event)) {
      this.chessBoardType = $event.args;
    }
    if (ActionInfo.is("PreviousProblem", $event)) {
      this.db.MovePrevious();
    }
    if (ActionInfo.is("NextProblem", $event)) {
      this.db.MoveNext();
    }
    if (ActionInfo.is("LastProblem", $event)) {
      this.db.GotoIndex(this.db.Count - 1);
    }
    if (ActionInfo.is("FirstProblem", $event)) {
      this.db.GotoIndex(0);
    }
  }

  public get problem() {
    return this.db.CurrentProblem;
  }

  public get notation(): string {
    return this.db.CurrentProblem?.getCurrentFen() ?? "8/8/8/8/8/8/8/8";
  }

  constructor(private db: DbmanagerService, private router: Router) {}

  ngOnInit(): void {}
}
