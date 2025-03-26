import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ThirdPartyImports } from "../thirdPartyImports";
import { ToolbarEngineComponent } from "./toolbar-engine.component";

describe("ToolbarEngineComponent", () => {
  let component: ToolbarEngineComponent;
  let fixture: ComponentFixture<ToolbarEngineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarEngineComponent ],
      imports: [...ThirdPartyImports]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
