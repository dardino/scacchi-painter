import { Component, OnInit } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "../environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.styl"],
})
export class AppComponent implements OnInit {
  constructor(
    private db: DbmanagerService,
    private breakpointObserver: BreakpointObserver,
    private matIconRegistry: MatIconRegistry,
    private bridge: HostBridgeService,
    private domSanitizer: DomSanitizer
  ) {}
  get hasCloseButton() {
    return this.bridge.supportsClose;
  }
  get dbLoaded() {
    return this.db.CurrentProblem != null;
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
    this.matIconRegistry.addSvgIcon(
      `select_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/select_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `add_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/add_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `remove_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/remove_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `move_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/move_piece.svg`
      )
    );
  }
  async closeMe() {
    this.bridge.closeApp();
  }
}
