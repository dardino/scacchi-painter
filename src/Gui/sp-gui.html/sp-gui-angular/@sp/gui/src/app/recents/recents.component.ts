import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "app-recents",
  templateUrl: "./recents.component.html",
  styleUrls: ["./recents.component.less"],
})
export class RecentsComponent {
  recents: RecentFileInfo[] = [];
  fullpath(recent: RecentFileInfo) {
    return recent.meta.fullPath.replace(/^\//, "");
  }
  constructor(private db: DbmanagerService, private router: Router) {
    this.recents = JSON.parse(localStorage.getItem("spx.recents") ?? "[]") as RecentFileInfo[];
  }

  async clickOnRecent(fInfo: RecentFileInfo) {
    try {
      const result = await this.db.LoadFromService(fInfo);
      if (!(result instanceof Error)) {
        this.router.navigate(["/list"]);
      }
    } catch(err) {
        //noop
    }
  }
}
