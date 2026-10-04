import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { RouterModule } from "@angular/router";
import { Problem } from "@sp/dbmanager/src/lib/models";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProblemComparisonDialogComponent } from "./problem-comparison-dialog.component";

describe("ProblemComparisonDialogComponent", () => {
  let component: ProblemComparisonDialogComponent;
  let fixture: ComponentFixture<ProblemComparisonDialogComponent>;
  let close: ReturnType<typeof vi.fn>;

  const problems = [
    { uuid: "first-uuid" } as unknown as Problem,
    { uuid: "second-uuid" } as unknown as Problem,
  ] as [Problem, Problem];

  beforeEach(() => {
    close = vi.fn();
    TestBed.configureTestingModule({
      imports: [ProblemComparisonDialogComponent, RouterModule.forRoot([])],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: { problems } },
      ],
    });
    fixture = TestBed.createComponent(ProblemComparisonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should close with the top problem uuid on confirm", () => {
    component.confirm();
    expect(close).toHaveBeenCalledWith("first-uuid");
  });

  it("should close with null on break", () => {
    component.breakComparison();
    expect(close).toHaveBeenCalledWith(null);
  });
});
