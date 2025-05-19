import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AvaliableFileServices } from "@sp/host-bridge/src/lib/fileService";

@Component({
    selector: "lib-file-source-selector",
    templateUrl: "./file-source-selector.component.html",
    imports: [CommonModule, MatIconModule, MatButtonModule],
    styleUrls: ["./file-source-selector.component.less"],
})
export class FileSourceSelectorComponent {
  @Input()
  public hideNew: boolean;
  @Input()
  public current: "new" | AvaliableFileServices;
  @Output()
  public sourceSelected = new EventEmitter<"new" | AvaliableFileServices>();

  constructor() {}

  public selectSource(source: "new" | AvaliableFileServices) {
    this.sourceSelected.emit(source);
  }
}
