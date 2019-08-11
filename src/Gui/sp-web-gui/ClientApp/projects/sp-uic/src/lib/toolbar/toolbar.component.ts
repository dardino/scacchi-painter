import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { SpDbmService } from "projects/sp-dbm/src/public-api";

export interface ActionTypes {
  "PreviousProblem": void;
  "NextProblem": void;
  "GotoProblem": number;
}
export interface ActionInfo<T extends keyof ActionTypes> {
  type: T;
  args: ActionTypes[T];
}

@Component({
  selector: "lib-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.styl"]
})
export class ToolbarComponent implements OnInit {
  constructor(private db: SpDbmService) {}

  @Output() action = new EventEmitter<ActionInfo<keyof ActionTypes>>();

  get currentIndex() { return this.db.CurrentIndex + 1; }
  get totalCount() { return this.db.Count ; }
  get currentProblem() { return this.db.CurrentProblem ; }

  ngOnInit() {
    if (this.currentProblem != null) {
      console.log(this.currentProblem);
    }
  }


  goToBefore() {
    const arg: ActionInfo<"PreviousProblem"> = {
      type: "PreviousProblem",
      args: void 0
    };
    this.action.emit(arg);
  }
  goToNext() {
    const arg: ActionInfo<"NextProblem"> = {
      type: "NextProblem",
      args: void 0
    };
    this.action.emit(arg);
  }
}
