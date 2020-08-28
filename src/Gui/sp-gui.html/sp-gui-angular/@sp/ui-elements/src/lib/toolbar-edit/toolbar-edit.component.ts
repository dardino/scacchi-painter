import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "@sp/gui/src/environments/environment";
import { MatButtonToggleChange } from "@angular/material/button-toggle";

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

export type EditModes = "select" | "add" | "remove" | "move";

@Component({
  selector: "lib-toolbar-edit",
  templateUrl: "./toolbar-edit.component.html",
  styleUrls: ["./toolbar-edit.component.styl"],
})
export class ToolbarEditComponent implements OnInit {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}
  @Output() switchBoardType = new EventEmitter<void>();

  @Output() editCommand = new EventEmitter<EditCommand>();
  @Output() editModeChanged = new EventEmitter<EditModes>();

  @Input()
  editMode: EditModes = "select";

  switchBT() {
    this.switchBoardType.emit();
  }

  modeChange($event: MatButtonToggleChange) {
    this.editModeChanged.emit($event.value);
  }

  ngOnInit(): void {
    // tslint:disable: max-line-length
    this.matIconRegistry.addSvgIcon(
      `select_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/select_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `add_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/add_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `remove_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/remove_piece.svg`
      )
    );
    this.matIconRegistry.addSvgIcon(
      `move_piece`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.assetFolder}/toolbar/move_piece.svg`
      )
    );
    // tslint:enable: max-line-length
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
