import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { DropboxdbService, GoogleDriveService, LocalDriveService, OneDriveService } from "@sp/dbmanager/src/lib/providers";
import { TauriLocalDriveService } from "@sp/dbmanager/src/lib/providers/localdrive/tauri-local-drive.service";
import { DatabaseFileFormat, DbmanagerService } from "@sp/dbmanager/src/public-api";
import { DialogService } from "@sp/ui-elements/src/lib/services/dialog.service";
import {
  AvaliableFileServices,
  FileService,
  FolderSelected,
} from "@sp/host-bridge/src/lib/fileService";
import { FileExplorerComponent } from "@sp/ui-elements/src/lib/file-explorer/file-explorer.component";
import { FileSourceSelectorComponent } from "@sp/ui-elements/src/lib/file-source-selector/file-source-selector.component";

@Component({
  selector: "app-save-file",
  templateUrl: "./save-file.component.html",
  styleUrls: ["./save-file.component.scss"],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    FileSourceSelectorComponent,
    FileExplorerComponent,
  ],
  standalone: true,
})
export class SaveFileComponent implements OnInit {
  private db = inject(DbmanagerService);
  private dropboxFS = inject(DropboxdbService);
  private onedriveFS = inject(OneDriveService);
  private googleDriveFS = inject(GoogleDriveService);
  private localFS = inject(LocalDriveService);
  private tauriLocalFS = inject(TauriLocalDriveService);
  private router = inject(Router);
  private dialog = inject(DialogService);

  format = signal<DatabaseFileFormat>("sp3");

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

  setFormat(format: DatabaseFileFormat) {
    this.format.set(format);
    const name = this.selectedFile.meta.itemName.replace(/\.(sp2|sp3)$/i, "");
    this.selectedFile.meta.itemName = `${name}.${format}`;
    if (this.selectedFile.meta.id) {
      this.selectedFile.meta.id = this.selectedFile.meta.id.replace(/\.(sp2|sp3)$/i, `.${format}`);
    }
    if (this.selectedFile.meta.fullPath) {
      this.selectedFile.meta.fullPath = this.selectedFile.meta.fullPath.replace(/\.(sp2|sp3)$/i, `.${format}`);
    }
  }

  public get currentFileService(): FileService<AvaliableFileServices> | null {
    switch (this.currentSource) {
      case "local":
        return window.Bridge?.host === "tauri"
          ? this.tauriLocalFS
          : this.localFS;
      case "dropbox":
        return this.dropboxFS;
      case "onedrive":
        return this.onedriveFS;
      case "googledrive":
        return this.googleDriveFS;
      case "unknown":
      default:
        return null;
    }
  }

  public get currentFolderName() {
    if (this.currentFolder?.meta.type === "file") return this.actionName;
    return adjustPathDescription(this.currentFolder?.meta.fullPath + "/", this.currentSource);
  }

  public get actionName() {
    if (this.currentFileService == null) {
      return "Download file";
    }
    else return "Save file as";
  }

  ngOnInit(): void {
    const urlhash = location.hash;
    this.selectedFile = this.db.CurrentFile() ?? this.selectedFile;
    this.currentFolder = this.db.CurrentFile() ?? this.selectedFile;
    this.format.set(this.selectedFile.meta.itemName.toLowerCase().endsWith(".sp2") ? "sp2" : "sp3");
    if (urlhash === "#dropbox") {
      setTimeout(() => {
        this.toDropbox();
      }, 1);
    }
    else if (urlhash === "#onedrive") {
      setTimeout(() => {
        this.toOneDrive();
      }, 1);
    }
    else if (urlhash === "#googledrive") {
      setTimeout(() => {
        this.toGoogleDrive();
      }, 1);
    }
    else if (this.selectedFile?.source === "dropbox") {
      setTimeout(() => {
        this.toDropbox();
      }, 1);
    }
    else if (this.selectedFile?.source === "onedrive") {
      setTimeout(() => {
        this.toOneDrive();
      }, 1);
    }
    else if (this.selectedFile?.source === "googledrive") {
      setTimeout(() => {
        this.toGoogleDrive();
      }, 1);
    }
    else {
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
      case "googledrive":
        await this.toGoogleDrive();
        break;
      case "unknown":
      default:
        break;
    }
    // Navigate to the route with the source parameter
    this.router.navigate(["/savefile", source]);
  }

  /**
   * Download the db file
   */
  public async download(format = this.format()) {
    this.db.SetFileMeta({
      meta: {
        fullPath: this.selectedFile?.meta.fullPath ?? ".",
        id: this.selectedFile?.meta.id ?? this.fileName,
        itemName: this.fileName,
        type: "file",
      },
      source: "local",
    });
    const file = await this.db.GetFileContent(format);
    const objectUrl = URL.createObjectURL(file);
    const anchor = document.createElement("a");
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

  public async toGoogleDrive() {
    if (this.selectedFile) {
      this.selectedFile.source = "googledrive";
      await this.googleDriveFS.authorize();
    }
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
    if (this.format() === "sp2") {
      const confirmed = await firstValueFrom(this.dialog.confirmDialog({
        title: "Save as SP2",
        message: "SP2 does not support all SP3 features. Engine settings, solver configuration, UUIDs, and structured solutions may be omitted. Continue?",
        cancelText: "Cancel",
        confirmText: "Save SP2",
      }));
      if (!confirmed) return null;
    }
    this.setFormat(this.format());
    this.db.SetFileMeta({
      source: this.currentFolder.source,
      meta: this.selectedFile.meta,
    });
    try {
      const file = await this.db.Save(this.format());
      if (file) {
        this.router.navigateByUrl("/list");
      }
    }
    catch (_err) {
      await this.download();
    }
    return null;
  }

  public expandFolder(folder: FolderSelected) {
    this.currentFolder = folder;
    if (this.currentFileService) {
      this.selectedFile.meta.fullPath = this.currentFileService.joinPath(
        folder.meta.fullPath,
        this.selectedFile.meta.itemName,
      );
    }
    else {
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
