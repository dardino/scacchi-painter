import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ThirdPartyImports } from "../thirdPartyImports";
import { SpToolbarButtonComponent } from "./sp-toolbar-button.component";

describe("SpButtonComponent", () => {
  let component: SpToolbarButtonComponent;
  let fixture: ComponentFixture<SpToolbarButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SpToolbarButtonComponent],
      imports:[...ThirdPartyImports]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpToolbarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
