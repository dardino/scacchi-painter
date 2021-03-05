import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-recents",
  templateUrl: "./recents.component.html",
  styleUrls: ["./recents.component.styl"],
})
export class RecentsComponent implements OnInit {
  recents: string[] = [];
  constructor() {}

  ngOnInit(): void {}

  clickOnRecent(path: string) {}
}
