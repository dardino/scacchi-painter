import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";

import { Component, OnInit, computed, inject } from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from "@angular/router";
import { ChessboardAnimationService } from "@sp/chessboard/src/lib/chessboard-animation.service";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { DbsourceComponent } from "@sp/ui-elements/src/lib/dbsource/dbsource.component";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { SpToolbarButtonComponent, ToolbarDbComponent } from "@sp/ui-elements/src/public-api";
import { Observable, filter, map, startWith } from "rxjs";
import { RoutesList } from "./app-routing-list";
import { MenuComponent } from "./menu/menu.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  imports: [
    DbsourceComponent,
    RouterModule,
    MatProgressSpinner,
    MatSidenavModule,
    MenuComponent,
    MatToolbarModule,
    SpToolbarButtonComponent,
    ToolbarDbComponent,
  ],
  providers: [
    AllMatIconRegistryService,
    ChessboardAnimationService,
  ],
  standalone: true,
})
export class AppComponent implements OnInit {
  private db = inject(DbmanagerService);
  private breakpointObserver = inject(BreakpointObserver);
  private bridge = inject(HostBridgeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private iconRegistry = inject(AllMatIconRegistryService); // Force instantiation to register icons

  private currentProblem = toSignal(this.db.CurrentProblem$, { initialValue: null });
  private currentFile = toSignal(this.db.CurrentFile$, { initialValue: this.db.CurrentFile });
  private currentRoutePath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.route.firstChild?.routeConfig?.path ?? null),
    ),
    { initialValue: this.route.firstChild?.routeConfig?.path ?? null },
  );

  dbLoaded = computed(() => this.currentProblem() != null);
  pathIsEdit = computed(() => this.currentRoutePath() === RoutesList.edit.path);
  fileName = computed(() => this.currentFile()?.meta.itemName);
  fileSource = computed(() => this.currentFile()?.source ?? "unknown");

  get hasCloseButton() {
    return this.bridge.supportsClose;
  }

  title = "Scacchi Painter";
  chessBoardMode: "edit" | "view" = "view";
  fsWip = this.db.wip$;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  ngOnInit(): void {
    this.db.Reload();
  }

  async closeMe() {
    this.bridge.closeApp();
  }
}
