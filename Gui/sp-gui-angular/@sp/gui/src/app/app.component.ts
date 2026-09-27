import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";

import { Component, OnInit, computed, effect, inject } from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from "@angular/router";
import { ChessboardAnimationService } from "@sp/chessboard/src/lib/chessboard-animation.service";
import { MsalAuthService } from "@sp/dbmanager/src/lib/oauth_providers/onedrive.cli";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { DbsourceComponent } from "@sp/ui-elements/src/lib/dbsource/dbsource.component";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { SpToolbarButtonComponent, ToolbarDbComponent } from "@sp/ui-elements/src/public-api";
import { Observable, filter, map, startWith } from "rxjs";
import { RoutesList } from "./app-routing-list";
import { MenuComponent } from "./menu/menu.component";
import { LogService } from "./services/log.service";
import { PreferencesService } from "./services/preferences.service";
import { ThemeService } from "./services/theme.service";

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
    LogService,
  ],
  standalone: true,
})
export class AppComponent implements OnInit {
  #log = inject(LogService);
  private db = inject(DbmanagerService);
  private breakpointObserver = inject(BreakpointObserver);
  private bridge = inject(HostBridgeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  iconRegistry = inject(AllMatIconRegistryService);
  #preferences = inject(PreferencesService); // Force instantiation to register icons
  #theme = inject(ThemeService);
  private currentProblem = this.db.CurrentProblem;
  private currentFile = this.db.CurrentFile;
  #msalService = inject(MsalAuthService);

  currentRoutePath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.route.firstChild?.routeConfig?.path ?? null),
    ),
    { initialValue: this.route.firstChild?.routeConfig?.path ?? null },
  );

  currentHref = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => location.href),
    ),
    { initialValue: location.href },
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
  fsWip = this.db.wip;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  async ngOnInit(): Promise<void> {
    this.#log.log("AppComponent initialized");
    const currentLocation = location.href;
    setTimeout(() => {
      const newLocation = location.href;
      if (newLocation === currentLocation) {
        this.#log.log("Location has not changed then reloading the database");
        this.db.Reload().then(() => {
          const problem = this.currentProblem();
          if (problem == null && this.currentRoutePath() !== RoutesList.home.path) {
            this.router.navigate([RoutesList.home.path]);
          }
        });
      }
    }, 200);
  }

  async closeMe() {
    this.bridge.closeApp();
  }

  #lastRoutePath: string | null = null;
  constructor() {
    this.#msalService.initialize().then(() => {
      this.#msalService.handleRedirect();
    });

    effect(() => {
      const theme = this.#preferences.chessboardTheme();
      this.#theme.applyTheme(theme);
    });
    effect(() => {
      const path = this.currentRoutePath();
      if (path !== this.#lastRoutePath) {
        this.#lastRoutePath = path;
        this.#log.log("Route changed to: " + location.href.replace(location.origin, "~"));
      }
    });
  }
}
