import { Component, inject, input } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";
import { DbsourceComponent } from "@sp/ui-elements/src/lib/dbsource/dbsource.component";
import { LogService } from "../services/log.service";

@Component({
  selector: "app-recents",
  templateUrl: "./recents.component.html",
  styleUrls: ["./recents.component.scss"],
  imports: [DbsourceComponent, MatIcon, MatIconButton],
  standalone: true,
})
export class RecentsComponent {
  #db = inject(DbmanagerService);
  #router = inject(Router);
  #log = inject(LogService);
  #snackBar = inject(MatSnackBar);

  public allowRemove = input(false);

  recents: RecentFileInfo[] = [];
  fullpath(recent: RecentFileInfo) {
    return recent.meta.fullPath.replace(/^\//, "");
  }

  constructor() {
    this.recents = JSON.parse(localStorage.getItem("spx.recents") ?? "[]") as RecentFileInfo[];
  }

  async clickOnRecent(fInfo: RecentFileInfo) {
    try {
      const result = await this.#db.LoadFromService(fInfo);
      if (!(result instanceof Error)) {
        this.#router.navigate(["/list"]);
      }
      else {
        this.#log.error(result.message);
        this.#snackBar.open("An error occurred loading the file, see the system log for details", "Close", { duration: 3000 });
      }
    }
    catch (_err) {
      this.#log.error((_err as Error)?.message);
      this.#snackBar.open("An error occurred loading the file, see the system log for details", "Close", { duration: 3000 });
    }
  }

  removeRecent(fInfo: RecentFileInfo) {
    this.recents = this.recents.filter(recent => recent.meta.id !== fInfo.meta.id);
    localStorage.setItem("spx.recents", JSON.stringify(this.recents));
  }
}
