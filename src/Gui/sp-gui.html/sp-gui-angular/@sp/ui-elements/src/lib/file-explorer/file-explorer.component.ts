import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import {
  FileSelected,
  FileService,
  FolderItemInfo,
  FolderSelected,
} from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "lib-file-explorer",
  templateUrl: "./file-explorer.component.html",
  imports: [CommonModule, MatIconModule],
  standalone: true,
  styleUrls: ["./file-explorer.component.scss"],
})
export class FileExplorerComponent implements OnInit, OnChanges {
  @Input() service: FileService | null;
  @Input() mode: "save" | "open";
  @Output() selectFile = new EventEmitter<FileSelected>();
  @Output() folderChanged = new EventEmitter<FolderSelected>();
  public isloading = signal(false);

  public currentItem: FolderItemInfo & { parent?: FolderItemInfo } = {
    fullPath: "",
    id: "",
    itemName: "/",
    type: "root",
  };

  public items = signal<FolderItemInfo[]>([]);

  ngOnInit(): void {
    this.refresh();
  }

  trackByFn(item: FolderItemInfo): string {
    return item.fullPath ?? "$";
  }

  clickElement(item: FolderItemInfo): void {
    if (item.type === "file") this.clickFile(item);
    if (item.type === "folder" || item.type === "drive") this.clickFolder(item);
  }

  navToParent() {
    if (this.currentItem.parent) {
      this.currentItem = this.currentItem.parent;
      this.folderChanged.emit({
        meta: this.currentItem,
        source: this.service?.sourceName ?? "unknown",
      });
      this.refresh();
    }
  }

  get hasParent() {
    return this.currentItem.parent != null;
  }

  private clickFolder(item: FolderItemInfo): void {
    this.currentItem = { ...item, parent: this.currentItem };
    this.items.set([]);
    this.folderChanged.emit({ meta: item, source: this.service?.sourceName ?? "unknown" });
    this.refresh();
  }

  private async clickFile(item: FolderItemInfo): Promise<void> {
    if (!this.service) return;
    try {
      const file = await this.service.getFileContent(item);
      this.selectFile.emit({ file, meta: item, source: this.service.sourceName });
    }
    catch (err) {
      console.error(err);
    }
  }

  private refresh() {
    this.isloading.set(true);
    if (this.service) {
      this.service
        .enumContent(this.currentItem.id, this.currentItem.type, "sp2")
        .then((items) => {
          this.items.set(items);
        }).catch(() => {
          this.items.set([]);
        }).finally(() => {
          this.isloading.set(false);
        });
    }
  }

  ngOnChanges(): void {
    if (this.isloading()) return;
    this.refresh();
  }
}
