import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { MatButtonToggleChange } from "@angular/material/button-toggle";

export type EditModes = "select" | "add" | "remove" | "move";

@Component({
  selector: "lib-toolbar-piece",
  templateUrl: "./toolbar-piece.component.html",
  styleUrls: ["./toolbar-piece.component.less"],
})
export class ToolbarPieceComponent implements OnInit {
  constructor() {}

  @Input()
  editMode: EditModes = "select";

  @Output() editModeChanged = new EventEmitter<EditModes>();

  modeChange($event: MatButtonToggleChange) {
    this.editModeChanged.emit($event.value);
  }

  ngOnInit(): void {}
}
