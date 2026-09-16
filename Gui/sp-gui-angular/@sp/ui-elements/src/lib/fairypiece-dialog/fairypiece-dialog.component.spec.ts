import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FairypieceDialogComponent } from "./fairypiece-dialog.component";

import type { FairypieceDialogInput } from "./fairypiece-dialog.component";
const createDialogData = (data: FairypieceDialogInput) => data;
const data: FairypieceDialogInput = {
  cell: { traverse: "Row1", column: "ColA" },
  originalPiece: {
    appearance: "q",
    color: "Black",
    column: "ColA",
    traverse: "Row1",
    fairyAttribute: "SomeAttribute",
    fairyCode: [{ code: "SomeCode", params: ["SomeParam"] }],
    rotation: "UpsideDown",
  },
};

describe("FairypieceDialogComponent", () => {
  let component: FairypieceDialogComponent;
  let fixture: ComponentFixture<FairypieceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FairypieceDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: createDialogData(data) },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(FairypieceDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
