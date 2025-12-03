import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FairyAttributesDBNames, TraditionalConditionsNames } from "@sp/dbmanager/src/lib/models/fairesDB";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
    selector: "app-conditions-dialog",
    templateUrl: "./conditions-dialog.component.html",
    styleUrls: ["./conditions-dialog.component.scss"],
    standalone: true,
    imports: [
      FormsModule,
      MatFormFieldModule,
      MatAutocompleteModule,
      CommonModule,
      MatInputModule,
      MatButtonModule,
      MatDialogModule,
      ReactiveFormsModule
    ],
})
export class ConditionsDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ConditionsDialogComponent, string>>(MatDialogRef);

  myControl = new FormControl();
  newCondition = "";
  filteredOptions: Observable<string[]>;
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
