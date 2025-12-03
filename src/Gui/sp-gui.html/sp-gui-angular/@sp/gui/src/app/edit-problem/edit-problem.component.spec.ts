import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterModule } from "@angular/router";
import { EditProblemComponent } from "./edit-problem.component";

describe("EditProblemComponent", () => {
  let component: EditProblemComponent;
  let fixture: ComponentFixture<EditProblemComponent>;

  beforeEach(() => {
    const snackBarSpy = {
      open: vi.fn(),
      openFromComponent: vi.fn(),
      openFromTemplate: vi.fn(),
      dismiss: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [EditProblemComponent, RouterModule.forRoot([])],
      providers: [
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });
    fixture = TestBed.createComponent(EditProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
