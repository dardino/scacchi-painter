import { Component, EventEmitter, Output } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.less"],
    standalone: false
})
export class MenuComponent {
  @Output()
  selectElement = new EventEmitter<void>();

  constructor(private db: DbmanagerService) {}
  get dbLoaded() {
    return this.db.All.length !== 0;
  }
}
