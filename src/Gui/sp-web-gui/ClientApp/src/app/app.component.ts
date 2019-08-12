import { Component, OnInit } from "@angular/core";
import { SpDbmService } from "projects/sp-dbm/src/public-api";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.styl"]
})
export class AppComponent implements OnInit {
  constructor(private db: SpDbmService) {}
  title = "Scacchi Painter";
  ngOnInit(): void {
    this.db.LoadFromLocalStorage();
  }
}
