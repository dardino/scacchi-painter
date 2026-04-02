import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ThirdPartyImports } from "../thirdPartyImports";
import { ConfirmDialogComponent } from "./confirm-dialog.component";

describe("ConfirmDialogComponent", () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, ...ThirdPartyImports],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
      ],
    });
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
