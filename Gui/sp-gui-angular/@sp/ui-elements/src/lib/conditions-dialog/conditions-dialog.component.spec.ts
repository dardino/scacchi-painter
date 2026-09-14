import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ConditionsDialogComponent } from "./conditions-dialog.component";

describe("ConditionsDialogComponent", () => {
  let component: ConditionsDialogComponent;
  let fixture: ComponentFixture<ConditionsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConditionsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
      ],
    });
    fixture = TestBed.createComponent(ConditionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
