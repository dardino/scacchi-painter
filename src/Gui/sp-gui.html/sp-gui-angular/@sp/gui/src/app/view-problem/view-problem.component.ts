import { Component, OnInit } from "@angular/core";
import { ActionInfo, ActionTypes } from "@sp/ui-elements/src/public-api";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-view-problem",
  templateUrl: "./view-problem.component.html",
  styleUrls: ["./view-problem.component.styl"],
})
export class ViewProblemComponent implements OnInit {
  public id = -1;

  chessBoardType: "canvas" | "HTML" = "HTML";
  public tlbAction($event: ActionInfo<keyof ActionTypes>) {
    if (ActionInfo.is("SetBoardType", $event)) {
      this.chessBoardType = $event.args;
    }
    if (ActionInfo.is("PreviousProblem", $event)) {
      this.router.navigate([`../${this.db.CurrentIndex}`], {
        relativeTo: this.route,
      });
    }
    if (ActionInfo.is("NextProblem", $event)) {
      this.router.navigate([`../${this.db.CurrentIndex + 2}`], {
        relativeTo: this.route,
      });
    }
    if (ActionInfo.is("LastProblem", $event)) {
      this.router.navigate([`../${this.db.Count}`], {
        relativeTo: this.route,
      });
    }
    if (ActionInfo.is("FirstProblem", $event)) {
      this.router.navigate(["../1"], { relativeTo: this.route });
    }
  }

  getProblemFromRoute(): void {
    this.route.params.subscribe((obs) => {
      this.id = +(obs.id ?? 0) - 1;
      this.db.GotoIndex(this.id);
    });
  }

  public get problem() {
    return this.db.CurrentProblem;
  }

  public get notation(): string {
    return this.db.CurrentProblem?.getCurrentFen() ?? "8/8/8/8/8/8/8/8";
  }

  constructor(
    private db: DbmanagerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProblemFromRoute();
  }
}
