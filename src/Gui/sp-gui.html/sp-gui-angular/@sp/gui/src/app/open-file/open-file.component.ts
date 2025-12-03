
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DropboxdbService, LocalDriveService, OneDriveService } from "@sp/dbmanager/src/lib/providers";
import { AbortError } from "@sp/dbmanager/src/lib/providers/AbortError";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { AvaliableFileServices, FileSelected, FileService } from "@sp/host-bridge/src/lib/fileService";
import { FileExplorerComponent } from "@sp/ui-elements/src/lib/file-explorer/file-explorer.component";
import { FileSourceSelectorComponent } from "@sp/ui-elements/src/lib/file-source-selector/file-source-selector.component";

@Component({
  selector: "app-sp-openfile",
  templateUrl: "./open-file.component.html",
  styleUrls: ["./open-file.component.scss"],
  standalone: true,
  imports: [
    FileSourceSelectorComponent,
    FileExplorerComponent
],
})
export class OpenFileComponent implements OnInit {
  private db = inject(DbmanagerService);
  private dropboxService = inject(DropboxdbService);
  private onedriveService = inject(OneDriveService);
  private localFolderService = inject(LocalDriveService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public showFilePicker = signal(false);
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
    // Check route parameter first
    this.route.paramMap.subscribe(params => {
      const source = params.get('source') as AvaliableFileServices | "new" | null | undefined;
      if (source) {
        // Reset state when switching sources
        this.showFilePicker.set(false);
        this.currentFileService = null;

        setTimeout(() => {
          this.sourceSelected(source);
        }, 1);
        return;
      }

    });
  }

  async sourceSelected(source: "new" | AvaliableFileServices) {
    // Reset state first
    this.showFilePicker.set(false);
    this.currentFileService = null;

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
      if (!(err instanceof AbortError))
        // if something was wrong use native element;
        this.fileloader.nativeElement.click();
    }
  }

  async fromDropbox() {
    await this.dropboxService.authorize();
    this.currentFileService = this.dropboxService;
    this.showFilePicker.set(true);
  }

  async fromOneDrive() {
    await this.onedriveService.authorize();
    this.currentFileService = this.onedriveService;
    this.showFilePicker.set(true);
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
