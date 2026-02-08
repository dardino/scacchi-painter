import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { SpToolbarButtonComponent } from "./sp-toolbar-button.component";

describe("SpButtonComponent", () => {
  let component: SpToolbarButtonComponent;
  let fixture: ComponentFixture<SpToolbarButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpToolbarButtonComponent],
    });
    fixture = TestBed.createComponent(SpToolbarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
