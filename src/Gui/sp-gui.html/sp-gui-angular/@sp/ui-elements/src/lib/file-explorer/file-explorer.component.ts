import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  FileSelected,
  FileService,
  FolderItemInfo,
} from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "lib-file-explorer",
  templateUrl: "./file-explorer.component.html",
  styleUrls: ["./file-explorer.component.styl"],
})
export class FileExplorerComponent implements OnInit {
  @Input() service: FileService;
  @Output() selectFile = new EventEmitter<FileSelected>();

  public currentItem: FolderItemInfo = {
    fullPath: "",
    id: "",
    itemName: "/",
    type: "root",
  };
  public items: FolderItemInfo[] = [];

  constructor() {}

  ngOnInit(): void {
    this.refresh();
  }

  trackByFn(index: number, item: FolderItemInfo): string {
    return item.fullPath ?? "$";
  }

  clickElement(item: FolderItemInfo): void {
    if (item.type === "file") this.clickFile(item);
    if (item.type === "folder" || item.type === "drive") this.clickFolder(item);
  }

  private clickFolder(item: FolderItemInfo): void {
    this.currentItem = item;
    this.items = [];
    this.refresh();
  }

  private async clickFile(item: FolderItemInfo): Promise<void> {
    const file = await this.service.getFileContent(item);
    this.selectFile.emit({ file, meta: item, source: this.service.sourceName });
  }

  private refresh() {
    this.service.enumContent(this.currentItem.id, this.currentItem.type, "sp2").then((items) => {
      this.items = items;
    });
  }
}
