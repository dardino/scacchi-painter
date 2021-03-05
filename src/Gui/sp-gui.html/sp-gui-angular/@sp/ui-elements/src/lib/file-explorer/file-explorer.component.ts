import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FileService, FolderItemInfo } from "@sp/dbmanager/src/lib/fileService";

@Component({
  selector: "lib-file-explorer",
  templateUrl: "./file-explorer.component.html",
  styleUrls: ["./file-explorer.component.styl"],
})
export class FileExplorerComponent implements OnInit {
  @Input() service: FileService;
  @Output() select = new EventEmitter<FolderItemInfo>();

  public currentItem: FolderItemInfo = {
    fullPath: "/",
    id: "",
    itemName: "/",
    type: "folder",
  };
  public items: FolderItemInfo[] = [];

  constructor() {}

  ngOnInit(): void {
    this.refresh();
  }

  trackByFn(index: number, item: FolderItemInfo): string {
    return item.fullPath;
  }

  clickElement(item: FolderItemInfo): void {
    if (item.type === "file") this.clickFile(item);
    if (item.type === "folder") this.clickFolder(item);
  }

  private clickFolder(item: FolderItemInfo): void {
    this.currentItem = item;
    this.items = [];
    this.refresh();
  }

  private clickFile(item: FolderItemInfo): void {
    const file = this.service.getFileContent(item);
    this.select.emit(item);
  }

  private refresh() {
    this.service.enumContent(this.currentItem.id, "sp2").then((items) => {
      this.items = items;
    });
  }
}
