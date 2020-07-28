import { Component, OnInit } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.styl"],
})
export class AppComponent implements OnInit {
  constructor(
    private db: DbmanagerService,
    private breakpointObserver: BreakpointObserver,
    private bridge: HostBridgeService
  ) {}
  get hasCloseButton() {
    return this.bridge.supportsClose;
  }

  get fileName() {
    return this.db.FileName;
  }
  title = "Scacchi Painter";
  chessBoardMode: "edit" | "view" = "view";
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  ngOnInit(): void {
    this.db.LoadFromLocalStorage();
  }
  async closeMe() {
    this.bridge.closeApp();
  }
}
