import { Component, OnInit } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import {
  FileService,
  FolderSelected,
} from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "app-save-file",
  templateUrl: "./save-file.component.html",
  styleUrls: ["./save-file.component.styl"],
})
export class SaveFileComponent implements OnInit {
  public showFilePicker = false;
  public fileName = "";
  public currentFileService: FileService | null = null;
  constructor(private db: DbmanagerService) {}
  private currentFolder: FolderSelected | null = null;
  ngOnInit(): void {}

  /**
   * Download the db file
   */
  public async download() {
    this.db.SetFileMeta({
      meta: {
        fullPath: this.db.CurrentFile?.meta.fullPath ?? ".",
        id: this.db.CurrentFile?.meta.id ?? this.fileName,
        itemName: this.fileName,
        type: "file",
      },
      source: "local",
    });
    await this.db.Save();
  }
  /**
   * open dropbox folder selector
   */
  public async toDropbox() {}
  /**
   * open onedrive folder selector
   */
  public async toOneDrive() {}

  public async saveFile() {
    if (this.currentFolder == null) return this.download();
  }

  public expandFolder(folder: FolderSelected) {
    this.currentFolder = folder;
  }
}
