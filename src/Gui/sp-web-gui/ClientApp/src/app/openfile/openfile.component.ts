import { Component, OnInit, OnDestroy, SkipSelf } from "@angular/core";
import { SpDbmService } from "projects/sp-dbm/src/public-api";
import { SpConvertersService } from "projects/sp-dbm/src/public-api";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-sp-openfile",
  templateUrl: "./openfile.component.html",
  styleUrls: ["./openfile.component.styl"]
})
export class OpenfileComponent implements OnInit, OnDestroy {
  constructor(
    private db: SpDbmService,
    private converter: SpConvertersService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  private reader = new FileReader();
  private fileReaderDone = (ev: ProgressEvent) => {
    const xmlText = (ev.target as FileReader).result as string;
    const error = this.db.LoadFromText(xmlText);
    if (!error) {
      this.router.navigate([""]);
    }
  }

  selectLocalFile(args: FileList) {
    if (args.length === 1) {
      const file = args.item(0);
      this.reader.readAsText(file);
    }
  }
  ngOnInit() {
    this.reader.addEventListener("load", this.fileReaderDone);
  }
  ngOnDestroy(): void {
    this.reader.removeEventListener("load", this.fileReaderDone);
  }
}
