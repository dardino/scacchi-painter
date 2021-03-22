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

  ngOnInit(): void {}

  async sourceSelected(source: AvaliableFileServices) {
    this.currentSource = source;
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
    this.currentFileService = this.dropboxFS;
  }
  /**
   * open onedrive folder selector
   */
  public async toOneDrive() {
    this.currentFileService = this.onedriveFS;
  }

  public async saveFile() {
    if (this.currentFolder == null) return this.download();
  }

  public expandFolder(folder: FolderSelected) {
    this.currentFolder = folder;
  }
}
