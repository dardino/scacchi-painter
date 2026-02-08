import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";

import { Component, OnInit, inject } from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ChessboardAnimationService } from "@sp/chessboard/src/lib/chessboard-animation.service";
import { CurrentProblemService, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { DbsourceComponent } from "@sp/ui-elements/src/lib/dbsource/dbsource.component";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { SpToolbarButtonComponent, ToolbarDbComponent } from "@sp/ui-elements/src/public-api";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
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
  private currentProblemSvc = inject(CurrentProblemService);
  private iconRegistry = inject(AllMatIconRegistryService); // Force instantiation to register icons

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
