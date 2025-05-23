import { Component, Input } from "@angular/core";
import { MatButton } from "@angular/material/button";

@Component({
    selector: "lib-sp-toolbar-button",
    templateUrl: "./sp-toolbar-button.component.html",
    styleUrls: ["./sp-toolbar-button.component.less"],
    standalone: false
})
export class SpToolbarButtonComponent {
  constructor() {}

  @Input()
  color?: MatButton["color"];
  @Input()
  iconText?: string;
  @Input()
  iconLabel?: string;
  @Input()
  noLabel?: boolean;
  @Input()
  disabled?: boolean;
  @Input()
  svg?: boolean;

  get hasLabel(): boolean {
    return (this.iconLabel?.length ?? 0) > 0 && this.noLabel !== true;
  }

}
