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
  selector: "lib-toolbar-db",
  templateUrl: "./toolbar-db.component.html",
  styleUrls: ["./toolbar-db.component.styl"],
})
export class ToolbarDbComponent implements OnInit {
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

  public canGoPrev() {
    return this.currentIndex > 1;
  }
  public canGoNext() {
    return this.currentIndex < this.totalCount;
  }

  goToPrev() {
    if (this.canGoPrev()) {
      this.action.emit({
        type: "PreviousProblem",
        args: void 0,
      });
    }
  }
  goToNext() {
    if (this.canGoNext()) {
      this.action.emit({
        type: "NextProblem",
        args: void 0,
      });
    }
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
