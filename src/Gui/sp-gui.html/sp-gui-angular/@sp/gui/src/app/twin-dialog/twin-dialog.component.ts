import { Component, OnInit, Inject } from "@angular/core";
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from "@angular/material/legacy-dialog";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";

@Component({
  selector: "app-twin-dialog",
  templateUrl: "./twin-dialog.component.html",
  styleUrls: ["./twin-dialog.component.less"],
})
export class TwinDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TwinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Twin
  ) {}

  ngOnInit(): void {}
}
