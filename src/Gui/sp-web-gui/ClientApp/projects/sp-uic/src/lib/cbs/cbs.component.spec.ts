import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CbsComponent } from "./cbs.component";

describe("CbsComponent", () => {
  let component: CbsComponent;
  let fixture: ComponentFixture<CbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CbsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("classlist for A1 should contain 'black'", () => {
    component.location = {
      column   : "ColA",
      traverse : "Row1"
    };
    fixture.detectChanges();
    expect(component.classList.indexOf("white")).toEqual(-1);
    expect(component.classList.indexOf("black")).toBeGreaterThan(-1);
  });
  it("classlist for C6 should contain 'white'", () => {
    component.location = {
      column   : "ColC",
      traverse : "Row6"
    };
    fixture.detectChanges();
    expect(component.classList.indexOf("black")).toEqual(-1);
    expect(component.classList.indexOf("white")).toBeGreaterThan(-1);
  });
});
