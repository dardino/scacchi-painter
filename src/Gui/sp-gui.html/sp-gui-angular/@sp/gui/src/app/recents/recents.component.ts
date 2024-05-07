import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "app-recents",
  templateUrl: "./recents.component.html",
  styleUrls: ["./recents.component.less"],
})
export class RecentsComponent implements OnInit {
  recents: RecentFileInfo[] = [];
  constructor(private db: DbmanagerService, private router: Router) {
    this.recents = JSON.parse(localStorage.getItem("spx.recents") ?? "[]") as RecentFileInfo[];
    console.log("🚀 ~ RecentsComponent ~ constructor ~ this.recents:", this.recents);
  }

  ngOnInit(): void {
  }

  async clickOnRecent(fInfo: RecentFileInfo) {
    const result = await this.db.LoadFromService(fInfo);
    if (!(result instanceof Error)) {
      this.router.navigate(["/list"]);
    }
  }
}
