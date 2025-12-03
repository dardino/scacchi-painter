import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { SpToolbarButtonComponent } from "../sp-toolbar-button/sp-toolbar-button.component";
import { ToolbarDbComponent } from "./toolbar-db.component";

describe("ToolbarComponent", () => {
  let component: ToolbarDbComponent;
  let fixture: ComponentFixture<ToolbarDbComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToolbarDbComponent, SpToolbarButtonComponent],
    });
    fixture = TestBed.createComponent(ToolbarDbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
