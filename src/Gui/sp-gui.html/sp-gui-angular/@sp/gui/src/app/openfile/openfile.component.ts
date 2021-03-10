import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Router } from "@angular/router";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { DropboxdbService } from "@sp/dbmanager/src/lib/dropboxdb.service";
import { FileSelected, FileService, FolderItemInfo } from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "app-sp-openfile",
  templateUrl: "./openfile.component.html",
  styleUrls: ["./openfile.component.styl"],
})
export class OpenfileComponent implements OnInit {
  constructor(
    private db: DbmanagerService,
    public dropboxService: DropboxdbService,
    private router: Router,
    private bridge: HostBridgeService
  ) {}

  public showDropboxFolder = false;
  @ViewChild("fileloader") fileloader: ElementRef;

  public showNewFileWizard = false;

  selectLocalFile(args: FileList) {
    if (args.length === 1) {
      const file = args.item(0);
      if (file == null) return;
      this.loadFromFile(
        {
          meta: {
            fullPath: file?.name,
            id: file.name,
            itemName: file.name,
            type: "file",
          },
          file,
          source: "local",
        },
        null
      );
    }
  }
  ngOnInit() {
    const urlhash = location.hash;
    if (urlhash === "#dropbox") {
      setTimeout(() => {
        this.fromDropbox();
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
    this.showNewFileWizard = true;
  }

  async localFolder() {
    if (this.bridge.supportsOpen) {
      const file = await this.bridge.openFile();
      if (file == null) return;
      await this.loadFromFile(
        {
          file,
          source: "local",
          meta: {
            fullPath: file.name,
            itemName: file.name,
            id: file.name,
            type: "file",
          },
        },
        null
      );
    } else this.fileloader.nativeElement.click();
  }

  async fromDropbox() {
    const token = await this.dropboxService.authorize();
    this.showDropboxFolder = true;
  }

  async loadFromFile(
    fileInfo: FileSelected | null,
    fileSerivce: FileService | null
  ) {
    if (!fileInfo) return;
    const error = await this.db.Load(fileInfo, fileSerivce);
    if (!error) {
      this.router.navigate([`/edit/${this.db.CurrentIndex}`]);
    }
  }

  async createFile($event: FileSelected) {
    await this.loadFromFile($event, null);
  }

  async openFile($event: FileSelected, fileService: FileService) {
    await this.loadFromFile($event, fileService);
  }
}
