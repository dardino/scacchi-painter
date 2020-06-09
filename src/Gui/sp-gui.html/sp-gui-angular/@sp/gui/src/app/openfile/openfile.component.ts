import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  DbmanagerService,
} from "@sp/dbmanager/src/public-api";
import { Router } from "@angular/router";

@Component({
  selector: "app-sp-openfile",
  templateUrl: "./openfile.component.html",
  styleUrls: ["./openfile.component.styl"],
})
export class OpenfileComponent implements OnInit, OnDestroy {
  constructor(
    private db: DbmanagerService,
    private router: Router
  ) {}

  private reader = new FileReader();
  private fileName = "";
  private fileReaderDone = (ev: ProgressEvent) => {
    const xmlText = (ev.target as FileReader).result as string;
    const error = this.db.LoadFromText(xmlText, this.fileName);
    if (!error) {
      this.db.SaveToLocalStorage(xmlText, this.fileName);
      this.router.navigate(["id"]);
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
}
