import { Component, OnInit } from "@angular/core";
import { DropboxdbService, OneDriveService } from "@sp/dbmanager/src/lib/providers";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import {
  AvaliableFileServices,
  FileService,
  FolderSelected,
} from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "app-save-file",
  templateUrl: "./save-file.component.html",
  styleUrls: ["./save-file.component.less"],
})
export class SaveFileComponent implements OnInit {
  constructor(
    private db: DbmanagerService,
    private dropboxFS: DropboxdbService,
    private onedriveFS: OneDriveService
  ) {}
  private currentFolder: FolderSelected = {
    meta: {
      fullPath: "",
      id: "",
      itemName: "",
      type: "file",
    },
    source: "unknown",
  };
  private selectedFile: FolderSelected = {
    meta: {
      fullPath: "",
      id: "newFile.sp3",
      itemName: "newFile.sp3",
      type: "file",
    },
    source: "unknown",
  };

  public get currentSource(): AvaliableFileServices {
    return this.selectedFile?.source ?? "unknown";
  }
  public get showFilePicker() {
    return this.currentSource !== "unknown" && this.currentSource !== "local";
  }
  public get fileName() {
    return this.selectedFile.meta.itemName;
  }
  public set fileName(v: string) {
    this.selectedFile.meta.itemName = v;
  }
  public currentFileService: FileService | null = null;

  public get currentFolderName() {
    if (this.currentFolder?.meta.type === "file") return this.actionName;
    return this.currentFolder?.meta.fullPath + "/" + this.fileName;
  }

  public get actionName() {
    if (this.currentFileService == null) {
      return "Download";
    } else return "Save";
  }

  ngOnInit(): void {
    const urlhash = location.hash;
    this.selectedFile = this.db.CurrentFile ?? this.selectedFile;
    this.currentFolder = this.db.CurrentFile ?? this.selectedFile;
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
    if (this.selectedFile?.source === "dropbox") {
      setTimeout(() => {
        this.toDropbox();
      }, 1);
    }
    if (this.selectedFile?.source === "onedrive") {
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
        fullPath: this.selectedFile?.meta.fullPath ?? ".",
        id: this.selectedFile?.meta.id ?? this.fileName,
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
    if (this.selectedFile) this.selectedFile.source = "dropbox";
    this.currentFileService = this.dropboxFS;
  }
  /**
   * open onedrive folder selector
   */
  public async toOneDrive() {
    if (this.selectedFile) this.selectedFile.source = "onedrive";
    this.currentFileService = this.onedriveFS;
  }

  public async saveFile() {
    if (
      this.currentFolder.source === "local" ||
      this.currentFolder.source === "unknown"
    ) {
      return this.download();
    } else {
      this.db.SetFileMeta({
        source: this.currentFolder.source,
        meta: this.selectedFile.meta,
      });
      await this.db.Save();
    }
    return null;
  }

  public expandFolder(folder: FolderSelected) {
    this.currentFolder = folder;
    if (this.currentFileService) {
      this.selectedFile.meta.fullPath = this.currentFileService.joinPath(
        folder.meta.fullPath,
        this.selectedFile.meta.itemName
      );
    } else {
      this.selectedFile.meta.fullPath = [
        folder.meta.fullPath,
        this.selectedFile.meta.itemName,
      ].join("/");
    }
  }

  public selectFile(folder: FolderSelected) {
    this.selectedFile = folder;
  }
}
