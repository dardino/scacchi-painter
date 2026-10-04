import { Component, Input, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { CurrentProblemService, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { RoutesList } from "@sp/gui/src/app/app-routing-list";
import { filter } from "rxjs/internal/operators/filter";
import { map } from "rxjs/internal/operators/map";
import { startWith } from "rxjs/internal/operators/startWith";
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
  private currentProblem = inject(CurrentProblemService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input() boardType: "canvas" | "HTML";
  @Input() hideLabels?: boolean;

  currentIndex = this.db.CurrentIndex;
  totalCount = this.db.Count;

  canGoPrev() {
    return this.currentIndex() > 1;
  }

  canGoNext() {
    return this.currentIndex() < this.totalCount();
  }

  currentRoutePath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.route.firstChild?.routeConfig?.path ?? null),
    ),
    { initialValue: this.route.firstChild?.routeConfig?.path ?? null },
  );

  editMode = computed(() => this.currentRoutePath() === RoutesList.edit.path);

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
    this.currentProblem.UpdateSnapshot();
    this.db.Save().then((success) => {
      if (!success) this.router.navigate(["/savefile"]);
    });
  }

  async addNewPosition() {
    const createdIndex = await this.db.addBlankPosition();
    this.router.navigate(["edit", createdIndex]);
  }
}
