import { Component, OnInit } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.styl"],
})
export class MenuComponent implements OnInit {
  constructor(private db: DbmanagerService) {}

  get dbLoaded() {
    return this.db.CurrentDB != null;
  }

  ngOnInit(): void {}
}
