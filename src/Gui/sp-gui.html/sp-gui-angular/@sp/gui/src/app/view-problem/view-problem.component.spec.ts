import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ViewProblemComponent } from "./view-problem.component";

describe("HomeComponent", () => {
  let component: ViewProblemComponent;
  let fixture: ComponentFixture<ViewProblemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewProblemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});