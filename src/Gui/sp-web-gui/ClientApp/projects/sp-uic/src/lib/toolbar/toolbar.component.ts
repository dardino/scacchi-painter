import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { SpDbmService } from "projects/sp-dbm/src/public-api";

export interface ActionTypes {
  "PreviousProblem": void;
  "NextProblem": void;
  "FirstProblem": void;
  "LastProblem": void;
  "GotoProblem": number;
  "SetBoardType": "canvas" | "HTML";
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

  @Input() boardType?: "canvas" | "HTML";
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
  goToFirst() {
    const arg: ActionInfo<"FirstProblem"> = {
      type: "FirstProblem",
      args: void 0
    };
    this.action.emit(arg);
  }
  goToLast() {
    const arg: ActionInfo<"LastProblem"> = {
      type: "LastProblem",
      args: void 0
    };
    this.action.emit(arg);
  }
  setCanvas() {
    const arg: ActionInfo<"SetBoardType"> = {
      type: "SetBoardType",
      args: "canvas"
    };
    this.action.emit(arg);
  }
  setHtml() {
    const arg: ActionInfo<"SetBoardType"> = {
      type: "SetBoardType",
      args: "HTML"
    };
    this.action.emit(arg);
  }
}
