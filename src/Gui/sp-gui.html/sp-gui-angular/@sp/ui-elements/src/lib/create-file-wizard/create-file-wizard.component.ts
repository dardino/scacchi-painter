import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FileSelected } from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "lib-create-file-wizard",
  templateUrl: "./create-file-wizard.component.html",
  styleUrls: ["./create-file-wizard.component.styl"],
})
export class CreateFileWizardComponent implements OnInit {
  @Output()
  save: EventEmitter<FileSelected> = new EventEmitter<FileSelected>();

  constructor() {}

  ngOnInit(): void {}

  create() {
    this.save.emit({
      meta: {
        fullPath: "newfile.sp3",
        id: "newfile.sp3",
        itemName: "newfile.sp3",
        type: "file",
      },
      source: "local",
      file: new File([`{"problems":[{}]}`],"newfile.sp3")
    });
  }
}
