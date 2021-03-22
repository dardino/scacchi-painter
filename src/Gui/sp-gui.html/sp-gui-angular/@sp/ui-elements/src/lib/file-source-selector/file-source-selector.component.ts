import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AvaliableFileServices } from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "lib-file-source-selector",
  templateUrl: "./file-source-selector.component.html",
  styleUrls: ["./file-source-selector.component.styl"],
})
export class FileSourceSelectorComponent implements OnInit {
  @Input()
  public hideNew: boolean;
  @Output()
  public sourceSelected = new EventEmitter<"new" | AvaliableFileServices>();

  constructor() {}

  ngOnInit(): void {}

  public selectSource(source: "new" | AvaliableFileServices) {
    this.sourceSelected.emit(source);
  }
}
