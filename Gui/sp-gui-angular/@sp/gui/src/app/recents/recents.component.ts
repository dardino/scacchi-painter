import { Component, inject, input } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { DbmanagerService, FutureSp3VersionError, getRecentFiles, saveRecentFiles, setLocalAuthInfo } from "@sp/dbmanager/src/public-api";
import { RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";
import { DbsourceComponent } from "@sp/ui-elements/src/lib/dbsource/dbsource.component";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import { firstValueFrom } from "rxjs";
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
  #dialog = inject(DialogService);

  public allowRemove = input(false);

  recents: RecentFileInfo[] = [];
  fullpath(recent: RecentFileInfo) {
    return recent.meta.fullPath.replace(/^\//, "");
  }

  constructor() {
    this.recents = getRecentFiles();
  }

  async clickOnRecent(fInfo: RecentFileInfo) {
    try {
      if (fInfo.source !== "local") {
        setLocalAuthInfo({
          return_url: this.#router.createUrlTree(["/list"]).toString(),
        });
      }
      let result = await this.#db.LoadFromService(fInfo);
      if (result instanceof FutureSp3VersionError) {
        const confirmed = await firstValueFrom(this.#dialog.confirmDialog({
          title: "Newer SP3 file version",
          message: `This SP3 file uses version ${result.fileVersion}, but this ScacchiPainter supports up to version ${result.supportedVersion}. Features introduced in newer versions may be unknown and could be lost if the file is saved after opening it.`,
          cancelText: "Cancel",
          confirmText: "Open anyway",
        }));
        if (!confirmed) return;
        result = await this.#db.LoadFromService(fInfo, true);
      }
      if (!(result instanceof Error)) {
        if (this.#db.All().length > 0) {
          await this.#router.navigate(["/edit", this.#db.CurrentIndex()]);
        }
        else {
          await this.#router.navigate(["/list"]);
        }
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
    saveRecentFiles(this.recents);
  }
}
