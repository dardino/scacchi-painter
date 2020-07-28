import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "@sp/gui/src/environments/environment";

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

  editMode = "select";
  switchBT() {
    this.switchBoardType.emit();
  }

  ngOnInit(): void {
    // tslint:disable: max-line-length
    this.matIconRegistry.addSvgIcon(`select_piece`, this.domSanitizer.bypassSecurityTrustResourceUrl(`${environment.assetFolder}/toolbar/select_piece.svg`));
    this.matIconRegistry.addSvgIcon(`add_piece`   , this.domSanitizer.bypassSecurityTrustResourceUrl(`${environment.assetFolder}/toolbar/add_piece.svg`));
    this.matIconRegistry.addSvgIcon(`remove_piece`, this.domSanitizer.bypassSecurityTrustResourceUrl(`${environment.assetFolder}/toolbar/remove_piece.svg`));
    this.matIconRegistry.addSvgIcon(`move_piece`  , this.domSanitizer.bypassSecurityTrustResourceUrl(`${environment.assetFolder}/toolbar/move_piece.svg`));
    // tslint:enable: max-line-length
  }
}
