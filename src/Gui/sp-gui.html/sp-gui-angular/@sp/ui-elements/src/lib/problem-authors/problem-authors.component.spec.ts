import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ProblemAuthorsComponent } from "./problem-authors.component";

describe("ProblemAuthorsComponent", () => {
  let component: ProblemAuthorsComponent;
  let fixture: ComponentFixture<ProblemAuthorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemAuthorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemAuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
