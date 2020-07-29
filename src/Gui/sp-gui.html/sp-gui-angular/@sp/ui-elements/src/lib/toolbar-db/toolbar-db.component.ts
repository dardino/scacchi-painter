import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "lib-toolbar-db",
  templateUrl: "./toolbar-db.component.html",
  styleUrls: ["./toolbar-db.component.styl"],
})
export class ToolbarDbComponent implements OnInit {
  constructor(private db: DbmanagerService) {}

  @Input() boardType: "canvas" | "HTML";
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
      this.db.GotoIndex(this.db.CurrentIndex - 1);
    }
  }
  goToNext() {
    if (this.canGoNext()) {
      this.db.GotoIndex(this.db.CurrentIndex + 1);
    }
  }
  goToFirst() {
    this.db.GotoIndex(0);
  }
  goToLast() {
    this.db.GotoIndex(this.db.Count - 1);
  }
  save(){
    this.db.SaveToHost("sp3");
  }
}
