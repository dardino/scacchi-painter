import { Component, OnInit } from "@angular/core";
import { ActionInfo, ActionTypes } from "projects/sp-uic/src/lib/toolbar/toolbar.component";
import { SpDbmService } from "projects/sp-dbm/src/public-api";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
  constructor(private db: SpDbmService) {}

  currentPositionFen = "8/8/8/8/8/8/8/8";
  boardType: "canvas" | "HTML" = "HTML";
  Mode: "edit" | "view" = "view";

  clickAction(action: ActionInfo<keyof ActionTypes>) {
    switch (action.type) {
      case "SetBoardType":
        this.boardType = (action as ActionInfo<"SetBoardType">).args;
        break;
      case "FirstProblem":
        this.db.GotoIndex(0);
        break;
      case "LastProblem":
        this.db.GotoIndex(this.db.Count - 1);
        break;
      case "GotoProblem":
        this.db.GotoIndex(action.args as number);
        break;
      case "NextProblem":
        this.db.MoveNext();
        break;
      case "PreviousProblem":
        this.db.MovePrevious();
        break;
      default:
        return;
    }
    this.currentPositionFen = this.db.GetCurrentFen();
  }

  ngOnInit(): void {
    if (this.db.CurrentProblem) {
      this.currentPositionFen = this.db.GetCurrentFen();
    }
  }
}
