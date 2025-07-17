import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TwinDialogComponent } from "./twin-dialog.component";

describe("TwinDialogComponent", () => {
  let component: TwinDialogComponent;
  let fixture: ComponentFixture<TwinDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: []},
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwinDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
