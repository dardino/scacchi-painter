import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { DropboxdbService, LocalDriveService, OneDriveService } from "@sp/dbmanager/src/lib/providers";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { AvaliableFileServices, FileSelected, FileService } from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "app-sp-openfile",
  templateUrl: "./open-file.component.html",
  styleUrls: ["./open-file.component.less"],
})
export class OpenFileComponent implements OnInit {
  constructor(
    private db: DbmanagerService,
    private dropboxService: DropboxdbService,
    private onedriveService: OneDriveService,
    private localFolderService: LocalDriveService,
    private router: Router
  ) {}

  public showFilePicker = false;
  @ViewChild("fileloader") fileloader: ElementRef<HTMLInputElement>;

  public currentFileService: FileService | null = null;

  public showNewFileWizard = false;

  selectLocalFile(args: FileList) {
    if (args.length === 1) {
      const file = args.item(0);
      if (file == null) return;
      this.loadFromFile({
        meta: {
          fullPath: file?.name,
          id: file.name,
          itemName: file.name,
          type: "file",
        },
        file,
        source: "local",
      });
    }
  }
  ngOnInit() {
    const urlhash = location.hash;
    if (urlhash === "#dropbox") {
      setTimeout(() => {
        this.fromDropbox();
      }, 1);
    }
    if (urlhash === "#onedrive") {
      setTimeout(() => {
        this.fromOneDrive();
      }, 1);
    }
    if (urlhash === "#newfile") {
      setTimeout(() => {
        this.newFile();
      }, 1);
    }
  }

  async sourceSelected(source: "new" | AvaliableFileServices) {
    switch (source) {
      case "new":
        await this.newFile();
        break;
      case "local":
        await this.localFolder();
        break;
      case "dropbox":
        await this.fromDropbox();
        break;
      case "onedrive":
        await this.fromOneDrive();
        break;
      case "unknown":
      default:
        break;
    }
  }

  async newFile() {
    this.createFile({
      meta: {
        fullPath: "newfile.sp3",
        id: "newfile.sp3",
        itemName: "newfile.sp3",
        type: "file",
      },
      source: "unknown",
      file: new File([`{"problems":[{}]}`], "newfile.sp3"),
    });
  }

  async localFolder() {
    this.currentFileService = this.localFolderService;
    try {
      const file = await this.currentFileService.getFileContent({
        fullPath: "",
        id: "",
        itemName:"",
        type: "file"
      });
      this.openFile({ file, meta: {
        fullPath: file.name,
        id: file.name,
        itemName: file.name,
        type: "file"
      }, source: this.currentFileService.sourceName });
    } catch (err) {
      this.fileloader.nativeElement.click();
    }
  }

  async fromDropbox() {
    await this.dropboxService.authorize();
    this.currentFileService = this.dropboxService;
    this.showFilePicker = true;
  }

  async fromOneDrive() {
    await this.onedriveService.authorize();
    this.currentFileService = this.onedriveService;
    this.showFilePicker = true;
  }

  private async loadFromFile(fileInfo: FileSelected | null) {
    if (!fileInfo) return;
    const error = await this.db.Load(fileInfo);
    if (!error) {
      this.router.navigate([`/edit/${this.db.CurrentIndex}`]);
    }
  }

  private async createFile($event: FileSelected) {
    await this.loadFromFile($event);
  }

  /**
   * called from file Explorer pick
   */
  async openFile($event: FileSelected) {
    await this.loadFromFile($event);
  }
}
