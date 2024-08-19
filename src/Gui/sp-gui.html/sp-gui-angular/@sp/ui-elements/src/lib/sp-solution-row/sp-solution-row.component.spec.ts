import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ThirdPartyImports } from "../thirdPartyImports";
import { SpSolutionRowComponent } from "./sp-solution-row.component";

describe("SpSolutionRowComponent", () => {
  let component: SpSolutionRowComponent;
  let fixture: ComponentFixture<SpSolutionRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpSolutionRowComponent],
      imports: [...ThirdPartyImports]
    });
    fixture = TestBed.createComponent(SpSolutionRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
