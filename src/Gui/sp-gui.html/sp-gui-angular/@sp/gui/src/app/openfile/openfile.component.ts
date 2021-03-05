import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { DbmanagerService } from "@sp/dbmanager/src/public-api";
import { Router } from "@angular/router";
import { HostBridgeService } from "@sp/host-bridge/src/public-api";
import { DropboxdbService } from "@sp/dbmanager/src/lib/dropboxdb.service";
import { FolderItemInfo } from "@sp/dbmanager/src/lib/fileService";

@Component({
  selector: "app-sp-openfile",
  templateUrl: "./openfile.component.html",
  styleUrls: ["./openfile.component.styl"],
})
export class OpenfileComponent implements OnInit, OnDestroy {
  constructor(
    private db: DbmanagerService,
    public dropboxService: DropboxdbService,
    private router: Router,
    private bridge: HostBridgeService
  ) {}

  public showDropboxFolder: boolean = false;
  @ViewChild("fileloader") fileloader: ElementRef;

  private reader = new FileReader();
  private fileName = "";
  private fileReaderDone = async (ev: ProgressEvent) => {
    const xmlText = (ev.target as FileReader).result as string;
    const error = await this.db.LoadFromText(xmlText, this.fileName);
    if (!error) {
      this.db.SaveToLocalStorage(
        xmlText,
        this.fileName,
        this.fileName.substr(-4) === ".sp2" ? "sp2" : "sp3"
      );
      this.router.navigate([`/edit/${this.db.CurrentIndex}`]);
    }
    this.fileName = "";
  };

  selectLocalFile(args: FileList) {
    if (args.length === 1) {
      const file = args.item(0);
      this.fileName = file?.name ?? "";
      if (file != null) this.reader.readAsText(file);
    }
  }
  ngOnInit() {
    this.reader.addEventListener("load", this.fileReaderDone);
  }
  ngOnDestroy(): void {
    this.reader.removeEventListener("load", this.fileReaderDone);
  }

  get electron() {
    return this.bridge.supportsClose;
  }

  async localFolder() {
    if (this.bridge.supportsOpen) {
      const file = await this.bridge.openFile();
      await this.loadFromFile(file);
    } else this.fileloader.nativeElement.click();
  }

  async fromDropbox() {
    const token = await this.dropboxService.authorize();
    this.showDropboxFolder = true;
  }

  async loadFromFile(file: File | null) {
    if (!file) return;
    const content = await file.text();
    const error = await this.db.LoadFromText(content, file.name);
    if (!error) {
      this.db.SaveToLocalStorage(
        content,
        file.name,
        file.name.substr(-4) === ".sp2" ? "sp2" : "sp3"
      );
      this.router.navigate([`/edit/${this.db.CurrentIndex}`]);
    }
  }

  async openFile($event: File) {
    alert($event.name)
  }
}
