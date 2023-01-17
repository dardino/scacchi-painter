import { Component, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { UntypedFormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";
import { FairyAttributesDBNames, TraditionalConditionsNames } from "@sp/dbmanager/src/lib/models/fairesDB";

@Component({
  selector: "app-conditions-dialog",
  templateUrl: "./conditions-dialog.component.html",
  styleUrls: ["./conditions-dialog.component.less"],
})
export class ConditionsDialogComponent implements OnInit {
  myControl = new UntypedFormControl();
  newCondition = "";
  filteredOptions: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<ConditionsDialogComponent, string>
  ) {}
  clickCancel() {
    this.dialogRef.close();
  }
  clickAdd() {
    this.dialogRef.close(this.newCondition);
  }
  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filter(value))
    );
  }

  setValue(val: string) {
    this.newCondition = val;
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return [...FairyAttributesDBNames, ...TraditionalConditionsNames].filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    ).sort();
  }
}
