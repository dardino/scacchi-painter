import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";

@Component({
  selector: "lib-problem-info",
  templateUrl: "./problem-info.component.html",
  styleUrls: ["./problem-info.component.styl"],
})
export class ProblemInfoComponent implements OnInit {
  constructor() {}

  @Output()
  public openTwin = new EventEmitter<Twin | null>();

  @Output()
  public addCondition = new EventEmitter<void>();
  @Output()
  public deleteCondition = new EventEmitter<string>();

  ngOnInit(): void {}
}
