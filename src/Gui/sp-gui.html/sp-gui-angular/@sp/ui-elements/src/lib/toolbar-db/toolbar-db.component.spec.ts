import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { SpToolbarButtonComponent } from "../sp-toolbar-button/sp-toolbar-button.component";
import { ToolbarDbComponent } from "./toolbar-db.component";

describe("ToolbarComponent", () => {
  let component: ToolbarDbComponent;
  let fixture: ComponentFixture<ToolbarDbComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarDbComponent, SpToolbarButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarDbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
