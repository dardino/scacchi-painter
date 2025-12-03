import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonToggleChange, MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";

export type EditModes = "select" | "add" | "remove" | "move";

@Component({
    selector: "lib-toolbar-piece",
    templateUrl: "./toolbar-piece.component.html",
    styleUrls: ["./toolbar-piece.component.scss"],
    imports: [MatIconModule, MatButtonToggleModule],
    standalone: true
})
export class ToolbarPieceComponent {
  @Input()
  editMode: EditModes = "select";

  @Output() editModeChanged = new EventEmitter<EditModes>();

  modeChange($event: MatButtonToggleChange) {
    this.editModeChanged.emit($event.value);
  }

}
