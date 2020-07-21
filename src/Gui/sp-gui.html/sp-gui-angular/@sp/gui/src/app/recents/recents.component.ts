import { Component, OnInit } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { Router } from "@angular/router";

@Component({
  selector: "app-recents",
  templateUrl: "./recents.component.html",
  styleUrls: ["./recents.component.styl"],
})
export class RecentsComponent implements OnInit {
  recents: string[] = [];
  constructor(
    private dbManager: DbmanagerService,
    bridge: HostBridgeService,
    private router: Router
  ) {
    const fileName = localStorage.getItem("spdb_fname") ?? null;
    this.recents = bridge.getRecents();
    if (fileName) this.recents.unshift(fileName);
  }

  ngOnInit(): void {}

  clickOnRecent(path: string) {
    const fileName = localStorage.getItem("spdb_fname") ?? null;
    if (path === fileName) {
      this.dbManager.LoadFromLocalStorage().then(() => {
        this.router.navigate([`/edit/${this.dbManager.CurrentIndex}`]);
      });
    }
  }
}
