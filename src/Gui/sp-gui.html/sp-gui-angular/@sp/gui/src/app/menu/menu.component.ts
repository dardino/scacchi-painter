

import { Component, EventEmitter, Output, inject, computed } from "@angular/core";
import { MatListModule, MatNavList } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.scss"],
    standalone: true,
    imports: [
    MatToolbarModule,
    MatNavList,
    RouterModule,
    MatListModule
]
})
export class MenuComponent {
  private db = inject(DbmanagerService);

  @Output()
  selectElement = new EventEmitter<void>();

  dbLoaded = computed(() => this.db.All.length !== 0);
}
