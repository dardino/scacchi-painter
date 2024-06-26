import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ThirdPartyModules } from "../modules";
import { OpenFileComponent } from "./open-file.component";

describe("OpenfileComponent", () => {
  let component: OpenFileComponent;
  let fixture: ComponentFixture<OpenFileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenFileComponent ],
      imports: [...ThirdPartyModules]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
