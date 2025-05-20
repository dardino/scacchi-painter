import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatOptionModule } from "@angular/material/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { Twin } from "@sp/dbmanager/src/lib/models/twin";
import {
  TwinTypeItem,
  TwinTypesConfigs,
} from "@sp/dbmanager/src/lib/twinTypes";
import { TwinModes, TwinTypesKeys } from "@sp/dbmanager/src/public-api";
import { Observable, map, startWith } from "rxjs";

@Component({
  selector: "app-twin-dialog",
  templateUrl: "./twin-dialog.component.html",
  styleUrls: ["./twin-dialog.component.less"],
  imports: [
    MatDialogModule,
    MatOptionModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CommonModule,
  ],
  standalone: true,
})
export class TwinDialogComponent implements OnInit {
  myControl = new FormControl();
  newTwinType: TwinTypesKeys | "" = "";
  filteredTwinTypes: Observable<TwinTypeItem<TwinTypesKeys>[]>;
  twinModelDesc: TwinTypeItem<TwinTypesKeys> | null = null;
  argValues: string[] = ["", "", "", ""];

  get twin(): Twin | null {
    if (this.newTwinType === "" || this.twinModelDesc == null) return null;
    const [, ValueA, ValueB, ...rest] = this.commandText.split(" ");
    return Twin.fromJson({
      TwinModes: TwinModes.Normal,
      TwinType: this.newTwinType,
      ValueA,
      ValueB,
      ValueC: rest.join(" "),
    });
  }

  get commandText(): string {
    if (this.twinModelDesc == null) return "";
    let cmd = this.twinModelDesc.template;
    this.twinModelDesc.parameters.forEach((param, index) => {
      cmd = cmd.replace(`{${param.id}}`, this.argValues[index]);
    });
    return cmd.replace(/ +/g, " ");
  }

  constructor(
    public dialogRef: MatDialogRef<TwinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Twin
  ) {}

  ngOnInit() {
    this.filteredTwinTypes = this.myControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filter(value))
    );
  }

  pickTwinType($event: TwinTypesKeys) {
    this.newTwinType = $event;
    if (TwinTypesConfigs[$event] == null) return;
    this.twinModelDesc = TwinTypesConfigs[$event];
  }

  private filter(value: string): TwinTypeItem<TwinTypesKeys>[] {
    const filterValue = value.toLocaleLowerCase();
    return [...Object.values(TwinTypesConfigs)]
      .filter((option) =>
        option.keyword.toLocaleLowerCase().startsWith(filterValue)
      )
      .sort((a, b) =>
        a.keyword > b.keyword ? 1 : a.keyword < b.keyword ? -1 : 0
      );
  }
}
