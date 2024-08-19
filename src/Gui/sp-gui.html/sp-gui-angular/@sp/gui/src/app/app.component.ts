import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CurrentProblemService, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { RoutesList } from "./app-routing-list";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"]
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
