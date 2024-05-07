import { Component, OnInit } from "@angular/core";
import { RecentFileInfo } from "@sp/host-bridge/src/lib/fileService";

@Component({
  selector: "app-recents",
  templateUrl: "./recents.component.html",
  styleUrls: ["./recents.component.less"],
})
export class RecentsComponent implements OnInit {
  recents: RecentFileInfo[] = [];
  constructor() {
    this.recents = JSON.parse(localStorage.getItem("spx.recents") ?? "[]") as RecentFileInfo[];
    console.log("🚀 ~ RecentsComponent ~ constructor ~ this.recents:", this.recents);
  }

  ngOnInit(): void {
  }

  clickOnRecent(fInfo: RecentFileInfo) {
    console.log("🚀 ~ RecentsComponent ~ clickOnRecent ~ fInfo:", fInfo);
  }
}
