import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";
import { DbsourceComponent } from "@sp/ui-elements/src/lib/dbsource/dbsource.component";

@Component({
    selector: "app-recents",
    templateUrl: "./recents.component.html",
    styleUrls: ["./recents.component.scss"],
    imports: [DbsourceComponent],
    standalone: true
})
export class RecentsComponent {
  private db = inject(DbmanagerService);
  private router = inject(Router);

  recents: RecentFileInfo[] = [];
  fullpath(recent: RecentFileInfo) {
    return recent.meta.fullPath.replace(/^\//, "");
  }
  constructor() {
    this.recents = JSON.parse(localStorage.getItem("spx.recents") ?? "[]") as RecentFileInfo[];
  }

  async clickOnRecent(fInfo: RecentFileInfo) {
    try {
      const result = await this.db.LoadFromService(fInfo);
      if (!(result instanceof Error)) {
        this.router.navigate(["/list"]);
      }
    } catch(_err) {
        //noop
    }
  }
}
