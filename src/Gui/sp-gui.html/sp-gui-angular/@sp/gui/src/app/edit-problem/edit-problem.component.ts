import { Component, OnInit } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "app-edit-problem",
  templateUrl: "./edit-problem.component.html",
  styleUrls: ["./edit-problem.component.styl"],
})
export class EditProblemComponent implements OnInit {
  public get problem() {
    return this.db.CurrentProblem;
  }

  constructor(private db: DbmanagerService) {}

  ngOnInit(): void {}
}
