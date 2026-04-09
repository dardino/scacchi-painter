import { Component, Input, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
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

  currentIndex = toSignal(this.db.CurrentIndex$, { initialValue: this.db.CurrentIndex });
  totalCount = toSignal(this.db.Count$, { initialValue: this.db.Count });

  canGoPrev() {
    return this.currentIndex() > 1;
  }

  canGoNext() {
    return this.currentIndex() < this.totalCount();
  }

  goToDB() {
    this.router.navigate([`/list`], { fragment: `${this.currentIndex()}` });
  }

  async goToPrev() {
    if (!this.canGoPrev()) {
      return;
    }

    const targetIndex = this.currentIndex() - 1;
    await this.db.GotoIndex(targetIndex);
    await this.router.navigate(["/edit", targetIndex]);
  }

  async goToNext() {
    if (!this.canGoNext()) {
      return;
    }

    const targetIndex = this.currentIndex() + 1;
    await this.db.GotoIndex(targetIndex);
    await this.router.navigate(["/edit", targetIndex]);
  }

  async goToFirst() {
    await this.db.GotoIndex(1);
    await this.router.navigate(["/edit", 1]);
  }

  async goToLast() {
    const targetIndex = this.totalCount();
    if (targetIndex < 1) {
      return;
    }

    await this.db.GotoIndex(targetIndex);
    await this.router.navigate(["/edit", targetIndex]);
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
