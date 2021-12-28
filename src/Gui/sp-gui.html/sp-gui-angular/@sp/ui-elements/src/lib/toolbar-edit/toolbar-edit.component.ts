import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { MatButtonToggleChange } from "@angular/material/button-toggle";
import { EditModes } from "../toolbar-piece/toolbar-piece.component";

export type EditCommand =
  | "rotateL"
  | "rotateR"
  | "flipH"
  | "flipV"
  | "moveD"
  | "moveU"
  | "moveL"
  | "moveR"
  | "resetPosition"
  | "clearBoard";

@Component({
  selector: "lib-toolbar-edit",
  templateUrl: "./toolbar-edit.component.html",
  styleUrls: ["./toolbar-edit.component.less"],
})
export class ToolbarEditComponent implements OnInit {
  constructor() {}
  @Output() switchBoardType = new EventEmitter<void>();

  @Output() editCommand = new EventEmitter<EditCommand>();
  @Output() editModeChanged = new EventEmitter<EditModes>();

  @Input()
  editMode: EditModes = "select";

  switchBT() {
    this.switchBoardType.emit();
  }

  modeChange($event: EditModes) {
    this.editModeChanged.emit($event);
  }

  ngOnInit(): void {
  }

  rotateRight() {
    this.editCommand.emit("rotateR");
  }
  rotateLeft() {
    this.editCommand.emit("rotateL");
  }
  flipHorizontal() {
    this.editCommand.emit("flipH");
  }
  flipVertical() {
    this.editCommand.emit("flipV");
  }
  moveDown() {
    this.editCommand.emit("moveD");
  }
  moveUp() {
    this.editCommand.emit("moveU");
  }
  moveLeft() {
    this.editCommand.emit("moveL");
  }
  moveRight() {
    this.editCommand.emit("moveR");
  }
  resetPosition() {
    this.editCommand.emit("resetPosition");
  }
  clearBoard() {
    this.editCommand.emit("clearBoard");
  }
}
