import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SpToolbarButtonComponent } from "./sp-toolbar-button.component";

describe("SpButtonComponent", () => {
  let component: SpToolbarButtonComponent;
  let fixture: ComponentFixture<SpToolbarButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpToolbarButtonComponent],
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
