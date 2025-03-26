import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AvaliableFileServices } from "@sp/host-bridge/src/lib/fileService";

@Component({
    selector: "lib-file-source-selector",
    templateUrl: "./file-source-selector.component.html",
    styleUrls: ["./file-source-selector.component.less"],
    standalone: false
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
