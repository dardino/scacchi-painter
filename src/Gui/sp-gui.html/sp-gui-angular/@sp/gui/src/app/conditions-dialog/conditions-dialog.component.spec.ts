import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ConditionsDialogComponent } from "./conditions-dialog.component";

describe("ConditionsDialogComponent", () => {
  let component: ConditionsDialogComponent;
  let fixture: ComponentFixture<ConditionsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: []},
      ]
    })
  .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
