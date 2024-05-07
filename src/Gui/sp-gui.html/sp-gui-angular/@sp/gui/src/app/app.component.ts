import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../environments/environment";
import { RoutesList } from "./app-routing-list";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private db: DbmanagerService,
    private breakpointObserver: BreakpointObserver,
    private matIconRegistry: MatIconRegistry,
    private bridge: HostBridgeService,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) { }
  get hasCloseButton() {
    return this.bridge.supportsClose;
  }
  get dbLoaded() {
    return this.db.CurrentProblem != null;
  }
  get pathIsEdit() {
    const path = RoutesList.edit.path;
    return this.route.firstChild?.routeConfig?.path === path;
  }
  get fileName() {
    return this.db.FileName;
  }
  get fileSource() {
    return this.db.CurrentFile?.source ?? "unknown";
  }
  title = "Scacchi Painter";
  chessBoardMode: "edit" | "view" = "view";
  fsWip = false;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  subscription: Subscription | null;
  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    this.subscription = null;
  }
  ngOnInit(): void {
    this.subscription = this.db.wip$.subscribe((v) => {
      this.fsWip = v;
    });
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
    this.matIconRegistry.addSvgIcon(
      `dropbox_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/dropbox_icon.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `onedrive_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/onedrive_icon.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `my_flip_h`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/fliph.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `my_flip_v`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/flipv.svg`
      )
    );


    this.db.Reload();
  }
  async closeMe() {
    this.bridge.closeApp();
  }
}
