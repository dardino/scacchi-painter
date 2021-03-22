import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Router } from "@angular/router";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { DropboxdbService } from "@sp/dbmanager/src/lib/dropboxdb.service";
import { FileSelected, FileService } from "@sp/host-bridge/src/lib/fileService";
import { OneDriveService } from "@sp/dbmanager/src/lib/one-drive.service";

@Component({
  selector: "app-sp-openfile",
  templateUrl: "./open-file.component.html",
  styleUrls: ["./open-file.component.styl"],
})
export class OpenFileComponent implements OnInit {
  constructor(
    private db: DbmanagerService,
    private dropboxService: DropboxdbService,
    private onedriveService: OneDriveService,
    private router: Router,
    private bridge: HostBridgeService
  ) {}

  public showFilePicker = false;
  @ViewChild("fileloader") fileloader: ElementRef;

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

  get electron() {
    return this.bridge.supportsClose;
  }

  async newFile() {
    this.createFile({
      meta: {
        fullPath: "newfile.sp3",
        id: "newfile.sp3",
        itemName: "newfile.sp3",
        type: "file",
      },
      source: "local",
      file: new File([`{"problems":[{}]}`], "newfile.sp3"),
    });
  }

  async localFolder() {
    if (this.bridge.supportsOpen) {
      const file = await this.bridge.openFile();
      if (file == null) return;
      await this.loadFromFile({
        file,
        source: "local",
        meta: {
          fullPath: file.name,
          itemName: file.name,
          id: file.name,
          type: "file",
        },
      });
    } else this.fileloader.nativeElement.click();
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

  async loadFromFile(fileInfo: FileSelected | null) {
    if (!fileInfo) return;
    const error = await this.db.Load(fileInfo);
    if (!error) {
      this.router.navigate([`/edit/${this.db.CurrentIndex}`]);
    }
  }

  async createFile($event: FileSelected) {
    await this.loadFromFile($event);
  }

  async openFile($event: FileSelected) {
    await this.loadFromFile($event);
  }
}
