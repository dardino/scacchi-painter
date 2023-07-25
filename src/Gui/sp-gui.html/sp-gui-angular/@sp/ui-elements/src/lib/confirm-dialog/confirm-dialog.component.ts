import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConfirmDialogData } from "../services/dialog.service";

@Component({
  selector: "lib-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.css"]
})
export class ConfirmDialogComponent {
  /**
   *
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }
}
