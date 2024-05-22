import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "lib-toolbar-db",
  templateUrl: "./toolbar-db.component.html",
  styleUrls: ["./toolbar-db.component.less"],
})
export class ToolbarDbComponent implements OnInit {
  constructor(private db: DbmanagerService, private router: Router) {
  }

  @Input() boardType: "canvas" | "HTML";
  @Input() hideLabels?: boolean;

  get currentIndex() {
    return this.db.CurrentIndex;
  }
  get totalCount() {
    return this.db.Count;
  }
  ngOnInit() {
  }

  public canGoPrev() {
    return this.currentIndex > 1;
  }
  public canGoNext() {
    return this.currentIndex < this.totalCount;
  }
  goToDB() {
    this.router.navigate([`/list`], { fragment: `${this.db.CurrentIndex}` });
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
    this.router.navigate(["/edit", 1]);
  }
  goToLast() {
    this.router.navigate(["/edit", this.db.Count]);
  }
  save(){
    this.db.Save().then(success => {
      if (!success) this.router.navigate(["/savefile"]);
    });
  }

  async addNewPosition() {
    const createdIndex = await this.db.addBlankPosition();
    this.router.navigate(["edit", createdIndex]);
  }

}
