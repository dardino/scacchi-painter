import { Component, OnInit, Input } from "@angular/core";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "lib-sp-toolbar-button",
  templateUrl: "./sp-toolbar-button.component.html",
  styleUrls: ["./sp-toolbar-button.component.styl"],
})
export class SpToolbarButtonComponent implements OnInit {
  constructor() {}

  @Input()
  color?: MatButton["color"];
  @Input()
  iconText?: string;
  @Input()
  iconLabel?: string;
  @Input()
  noLabel?: boolean;

  get hasLabel(): boolean {
    return (this.iconLabel?.length ?? 0) > 0 && this.noLabel !== true;
  }

  ngOnInit(): void {}
}
