import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ThirdPartyModules } from "../modules";
import { LandingComponent } from "./landing.component";

describe("LandingComponent", () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [...ThirdPartyModules],
      declarations: [ LandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
