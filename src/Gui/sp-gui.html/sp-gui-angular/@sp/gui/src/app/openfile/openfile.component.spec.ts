import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { OpenfileComponent } from "./openfile.component";

describe("OpenfileComponent", () => {
  let component: OpenfileComponent;
  let fixture: ComponentFixture<OpenfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
