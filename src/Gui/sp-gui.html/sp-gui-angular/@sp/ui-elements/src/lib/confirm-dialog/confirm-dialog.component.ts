import { Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialogData } from "../services/dialog.service";

import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "lib-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  imports: [MatDialogModule, MatButtonModule],
  styleUrls: ["./confirm-dialog.component.css"],
})
export class ConfirmDialogComponent {  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
