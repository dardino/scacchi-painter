import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialogData } from "../services/dialog.service";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "lib-confirm-dialog",
    templateUrl: "./confirm-dialog.component.html",
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    styleUrls: ["./confirm-dialog.component.css"],
})
export class ConfirmDialogComponent {
  /**
   *
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }
}
