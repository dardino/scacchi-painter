import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { MatListModule, MatNavList } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.less"],
    standalone: true,
    imports: [
      MatToolbarModule,
      CommonModule,
      MatNavList,
      RouterModule,
      MatListModule
    ]
})
export class MenuComponent {
  @Output()
  selectElement = new EventEmitter<void>();

  constructor(private db: DbmanagerService) {}
  get dbLoaded() {
    return this.db.All.length !== 0;
  }
}
