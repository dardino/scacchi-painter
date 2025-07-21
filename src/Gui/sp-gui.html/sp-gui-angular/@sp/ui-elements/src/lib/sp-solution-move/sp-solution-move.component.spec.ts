import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SpSolutionMoveComponent } from "./sp-solution-move.component";

describe("SpSolutionMoveComponent", () => {
  let component: SpSolutionMoveComponent;
  let fixture: ComponentFixture<SpSolutionMoveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpSolutionMoveComponent],
    });
    fixture = TestBed.createComponent(SpSolutionMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
