import { Component, OnInit } from "@angular/core";
import { DropboxdbService } from "@sp/dbmanager/src/lib/dropboxdb.service";
import { OneDriveService } from "@sp/dbmanager/src/lib/one-drive.service";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import {
  AvaliableFileServices,
  FileService,
  FolderSelected,
} from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "app-save-file",
  templateUrl: "./save-file.component.html",
  styleUrls: ["./save-file.component.styl"],
})
export class SaveFileComponent implements OnInit {
  constructor(
    private db: DbmanagerService,
    private dropboxFS: DropboxdbService,
    private onedriveFS: OneDriveService
  ) {}
  private currentFolder: FolderSelected | null = null;

  public currentSource: AvaliableFileServices =
    this.db.CurrentFile?.source ?? "unknown";
  public get showFilePicker() {
    return this.currentSource !== "unknown" && this.currentSource !== "local";
  }
  public fileName = "";
  public currentFileService: FileService | null = null;

  ngOnInit(): void {
    const urlhash = location.hash;
    this.fileName = this.db.CurrentFile?.meta.itemName ?? "new_file.sp3";
    this.currentFolder = this.db.CurrentFile ?? null;
    if (urlhash === "#dropbox") {
      setTimeout(() => {
        this.toDropbox();
      }, 1);
    }
    if (urlhash === "#onedrive") {
      setTimeout(() => {
        this.toOneDrive();
      }, 1);
    }
    if (this.currentFolder?.source === "dropbox") {
      setTimeout(() => {
        this.toDropbox();
      }, 1);
    }
    if (this.currentFolder?.source === "onedrive") {
      setTimeout(() => {
        this.toOneDrive();
      }, 1);
    }
  }

  async sourceSelected(source: AvaliableFileServices) {
    switch (source) {
      case "local":
        await this.download();
        break;
      case "dropbox":
        await this.toDropbox();
        break;
      case "onedrive":
        await this.toOneDrive();
        break;
      case "unknown":
      default:
        break;
    }
  }

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
  public async toDropbox() {
    this.currentSource = "dropbox";
    this.currentFileService = this.dropboxFS;
  }
  /**
   * open onedrive folder selector
   */
  public async toOneDrive() {
    this.currentSource = "onedrive";
    this.currentFileService = this.onedriveFS;
  }

  public async saveFile() {
    if (this.currentFolder == null) return this.download();
    else await this.db.Save();
    return null;
  }

  public expandFolder(folder: FolderSelected) {
    this.currentFolder = folder;
  }
}
