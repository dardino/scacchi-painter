import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { FairyAttributesDBNames, TraditionalConditionsNames } from '@sp/dbmanager/src/lib/models/fairesDB';

@Component({
  selector: 'app-conditions-dialog',
  templateUrl: './conditions-dialog.component.html',
  styleUrls: ['./conditions-dialog.component.styl'],
})
export class ConditionsDialogComponent implements OnInit {
  myControl = new FormControl();
  newCondition = '';
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
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  setValue(val: string) {
    this.newCondition = val;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return [...FairyAttributesDBNames, ...TraditionalConditionsNames].filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    ).sort();
  }
}
