import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { beforeEach, describe, expect, it } from "vitest";

import { VerdictDialogComponent } from "./verdict-dialog.component";

describe("VerdictDialogComponent", () => {
  let component: VerdictDialogComponent;
  let fixture: ComponentFixture<VerdictDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VerdictDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {
          mode: "view",
          award: {
            awardsTitle: "Spring Tournament",
            awardsDescription: "Regional event",
            awardsDate: "2026-01-01",
            awardsJudge: "Judge A",
            awardsProblems: [{ problemID: "p-1", rankInAward: 1 }],
          },
        } },
      ],
    });

    fixture = TestBed.createComponent(VerdictDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render award details", () => {
    expect(fixture.nativeElement.textContent).toContain("Spring Tournament");
    expect(fixture.nativeElement.textContent).toContain("Judge A");
  });

  it("should render the create form in create mode", async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [VerdictDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {
          mode: "create",
          award: {
            awardsTitle: "",
            awardsDescription: "",
            awardsDate: "",
            awardsJudge: "",
            awardsProblems: [],
          },
        } },
      ],
    }).compileComponents();

    const createFixture = TestBed.createComponent(VerdictDialogComponent);
    createFixture.detectChanges();

    expect(createFixture.nativeElement.textContent).toContain("Add new verdict");
    expect(createFixture.nativeElement.textContent).toContain("Save");
  });
});
