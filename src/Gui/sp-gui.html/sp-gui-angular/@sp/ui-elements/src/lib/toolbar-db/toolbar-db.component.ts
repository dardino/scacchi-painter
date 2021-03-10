import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "lib-toolbar-db",
  templateUrl: "./toolbar-db.component.html",
  styleUrls: ["./toolbar-db.component.styl"],
})
export class ToolbarDbComponent implements OnInit {
  constructor(private db: DbmanagerService, private router: Router) {}

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
  }

  public canGoPrev() {
    return this.currentIndex > 1;
  }
  public canGoNext() {
    return this.currentIndex < this.totalCount;
  }

  goToPrev() {
    if (this.canGoPrev()) {
      this.router.navigate(["/edit", this.db.CurrentIndex - 1]);
    }
  }
  goToNext() {
    if (this.canGoNext()) {
      this.router.navigate(["/edit", this.db.CurrentIndex + 1]);
    }
  }
  goToFirst() {
    this.router.navigate(["/edit", 0]);
  }
  goToLast() {
    this.router.navigate(["/edit", this.db.Count - 1]);
  }
  save(){
    this.db.Save();
  }
}
