import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { FairyAttributesDBNames, TraditionalConditionsNames } from "@sp/dbmanager/src/lib/models/fairesDB";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
    selector: "app-conditions-dialog",
    templateUrl: "./conditions-dialog.component.html",
    styleUrls: ["./conditions-dialog.component.less"],
    standalone: false
})
export class ConditionsDialogComponent implements OnInit {
  myControl = new FormControl();
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
