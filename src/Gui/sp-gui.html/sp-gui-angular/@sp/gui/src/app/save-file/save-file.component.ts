import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DropboxdbService, LocalDriveService, OneDriveService } from "@sp/dbmanager/src/lib/providers";
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
    private onedriveFS: OneDriveService,
    private localFS: LocalDriveService,
    private router: Router,
  ) { }

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
  public get currentFileService(): FileService | null {
    switch (this.currentSource) {
      case "local":
        return this.localFS;
      case "dropbox":
        return this.dropboxFS;
      case "onedrive":
        return this.onedriveFS;
      case "unknown":
      default:
        return null;
    }
  };

  public get currentFolderName() {
    if (this.currentFolder?.meta.type === "file") return this.actionName;
    return adjustPathDescription(this.currentFolder?.meta.fullPath + "/", this.currentSource);
  }

  public get actionName() {
    if (this.currentFileService == null) {
      return "Download file";
    } else return "Save file as";
  }

  ngOnInit(): void {
    const urlhash = location.hash;
    this.selectedFile = this.db.CurrentFile ?? this.selectedFile;
    this.currentFolder = this.db.CurrentFile ?? this.selectedFile;
    if (urlhash === "#dropbox") {
      setTimeout(() => {
        this.toDropbox();
      }, 1);
    } else if (urlhash === "#onedrive") {
      setTimeout(() => {
        this.toOneDrive();
      }, 1);
    } else if (this.selectedFile?.source === "dropbox") {
      setTimeout(() => {
        this.toDropbox();
      }, 1);
    } else if (this.selectedFile?.source === "onedrive") {
      setTimeout(() => {
        this.toOneDrive();
      }, 1);
    } else {
      setTimeout(() => {
        this.toLocal();
      }, 1);
    }
  }

  async setCurrentSource(source: AvaliableFileServices | "new") {
    switch (source) {
      case "local":
        await this.toLocal();
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
    const file = await this.db.GetFileContent();
    let objectUrl = URL.createObjectURL(file);
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    anchor.href = objectUrl;
    anchor.download = this.selectedFile.meta.itemName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    document.body.removeChild(anchor);
  }
  /**
   * open dropbox folder selector
   */
  public async toDropbox() {
    if (this.selectedFile) this.selectedFile.source = "dropbox";
  }
  /**
   * open onedrive folder selector
   */
  public async toOneDrive() {
    if (this.selectedFile) this.selectedFile.source = "onedrive";
  }
  /**
   * set as local folder
   */
  public async toLocal() {
    this.currentFolder.meta.fullPath = "";
    if (this.selectedFile) {
      this.selectedFile.source = "local";
    }
  }

  public async saveFile() {
    this.db.SetFileMeta({
      source: this.currentFolder.source,
      meta: this.selectedFile.meta,
    });
    try {
      const file = await this.db.Save();
      if (file) {
        this.router.navigateByUrl("/list");
      }
    } catch (err) {
      await this.download();
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

function adjustPathDescription(fullPath: string, currentSource: AvaliableFileServices) {
  if (currentSource === "onedrive") {
    return fullPath.replace(/^\/drives\/root:\//, "One Drive - ");
  }
  return fullPath;
}
