import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute } from "@angular/router";
import { ChessboardAnimationService } from "@sp/chessboard/src/lib/chessboard-animation.service";
import { CurrentProblemService, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { DbsourceComponent } from "@sp/ui-elements/src/lib/dbsource/dbsource.component";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { SpToolbarButtonComponent, ToolbarDbComponent } from "@sp/ui-elements/src/public-api";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { RoutesList } from "./app-routing-list";
import { AppRoutingModule } from "./app-routing.module";
import { MenuComponent } from "./menu/menu.component";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.less"],
    imports: [
      DbsourceComponent,
      AppRoutingModule,
      MatProgressSpinner,
      MatSidenavModule,
      MenuComponent,
      MatToolbarModule,
      SpToolbarButtonComponent,
      ToolbarDbComponent,
      CommonModule,
    ],
    providers: [
      AllMatIconRegistryService,
      ChessboardAnimationService,
    ],
    standalone: true
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private db: DbmanagerService,
    private breakpointObserver: BreakpointObserver,
    private bridge: HostBridgeService,
    _allIcons: AllMatIconRegistryService,
    private route: ActivatedRoute,
    private currentProblemSvc: CurrentProblemService,
  ) { }
  get hasCloseButton() {
    return this.bridge.supportsClose;
  }
  get dbLoaded() {
    return this.currentProblemSvc.Problem != null;
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

    this.db.Reload();
  }
  async closeMe() {
    this.bridge.closeApp();
  }
}
