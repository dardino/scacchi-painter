import { Component, Input, inject, computed } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { SpToolbarButtonComponent } from "../sp-toolbar-button/sp-toolbar-button.component";

@Component({
  selector: "lib-toolbar-db",
  templateUrl: "./toolbar-db.component.html",
  styleUrls: ["./toolbar-db.component.scss"],
  imports: [
    SpToolbarButtonComponent,
    MatToolbarModule,
    MatButtonModule,
  ],
  standalone: true,
})
export class ToolbarDbComponent {
  private db = inject(DbmanagerService);
  private router = inject(Router);

  @Input() boardType: "canvas" | "HTML";
  @Input() hideLabels?: boolean;

  currentIndex = computed(() => this.db.CurrentIndex);
  totalCount = computed(() => this.db.Count);

  canGoPrev() {
    return this.currentIndex() > 1;
  }

  canGoNext() {
    return this.currentIndex() < this.totalCount();
  }

  goToDB() {
    this.router.navigate([`/list`], { fragment: `${this.currentIndex()}` });
  }

  goToPrev() {
    if (this.canGoPrev()) {
      this.router.navigate(["/edit", this.currentIndex() - 1]);
    }
  }

  goToNext() {
    if (this.canGoNext()) {
      this.router.navigate(["/edit", this.currentIndex() + 1]);
    }
  }

  goToFirst() {
    this.router.navigate(["/edit", 1]);
  }

  goToLast() {
    this.router.navigate(["/edit", this.totalCount()]);
  }

  save() {
    this.db.Save().then((success) => {
      if (!success) this.router.navigate(["/savefile"]);
    });
  }

  async addNewPosition() {
    const createdIndex = await this.db.addBlankPosition();
    this.router.navigate(["edit", createdIndex]);
  }
}
