
import { Component, Input } from "@angular/core";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "lib-sp-toolbar-button",
  templateUrl: "./sp-toolbar-button.component.html",
  styleUrls: ["./sp-toolbar-button.component.scss"],
  imports: [MatButtonModule, MatIconModule],
  standalone: true
})
export class SpToolbarButtonComponent {

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
