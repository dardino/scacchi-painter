import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MatDialogModule } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { EditProblemComponent } from "./edit-problem.component";

describe("EditProblemComponent", () => {
  let component: EditProblemComponent;
  let fixture: ComponentFixture<EditProblemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, RouterTestingModule, MatDialogModule, NoopAnimationsModule],
      declarations: [ EditProblemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
