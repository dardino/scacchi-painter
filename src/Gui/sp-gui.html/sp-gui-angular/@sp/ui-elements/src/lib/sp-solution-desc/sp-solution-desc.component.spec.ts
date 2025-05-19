import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ThirdPartyImports } from "../thirdPartyImports";
import { SpSolutionDescComponent } from "./sp-solution-desc.component";

describe("SpSolutionDescComponent", () => {
  let component: SpSolutionDescComponent;
  let fixture: ComponentFixture<SpSolutionDescComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpSolutionDescComponent ],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpSolutionDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
