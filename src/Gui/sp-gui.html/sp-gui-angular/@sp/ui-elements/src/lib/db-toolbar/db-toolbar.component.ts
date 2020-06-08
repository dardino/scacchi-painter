import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

export interface ActionTypes {
  PreviousProblem: void;
  NextProblem: void;
  FirstProblem: void;
  LastProblem: void;
  GotoProblem: number;
  SetBoardType: "canvas" | "HTML";
}
export interface ActionInfo<T extends keyof ActionTypes> {
  type: T;
  args: ActionTypes[T];
}

export const ActionInfo = {
  is<T extends keyof ActionTypes>(
    type: T,
    action: ActionInfo<any>
  ): action is ActionInfo<T> {
    return action.type === type;
  },
} as const;

@Component({
  selector: "lib-toolbar",
  templateUrl: "./db-toolbar.component.html",
  styleUrls: ["./db-toolbar.component.styl"],
})
export class DbToolbarComponent implements OnInit {
  constructor(private db: DbmanagerService) {}

  @Input() boardType: "canvas" | "HTML";
  @Output() action = new EventEmitter<ActionInfo<keyof ActionTypes>>();
  @Input() hideLabels?: boolean;

  get currentIndex() {
    return this.db.CurrentIndex + 1;
  }
  get totalCount() {
    return this.db.Count;
  }
  get currentProblem() {
    return this.db.CurrentProblem;
  }

  ngOnInit() {
    if (this.currentProblem != null) {
      console.log(this.currentProblem);
    }
  }

  goToBefore() {
    this.action.emit({
      type: "PreviousProblem",
      args: void 0,
    });
  }
  goToNext() {
    this.action.emit({
      type: "NextProblem",
      args: void 0,
    });
  }
  setCanvas() {
    this.action.emit({
      type: "SetBoardType",
      args: "canvas",
    });
  }
  setHtml() {
    this.action.emit({
      type: "SetBoardType",
      args: "HTML",
    });
  }
  goToFirst() {
    this.action.emit({
      type: "FirstProblem",
      args: void 0,
    });
  }
  goToLast() {
    this.action.emit({
      type: "LastProblem",
      args: void 0,
    });
  }
}
