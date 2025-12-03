import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { AllMatIconRegistryService } from "../registerIcons";
import { SpToolbarButtonComponent } from "../sp-toolbar-button/sp-toolbar-button.component";
import { ToolbarEditComponent } from "./toolbar-edit.component";

describe("EditToolbarComponent", () => {
  let component: ToolbarEditComponent;
  let fixture: ComponentFixture<ToolbarEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToolbarEditComponent, SpToolbarButtonComponent],
      providers: [AllMatIconRegistryService]
    });
    fixture = TestBed.createComponent(ToolbarEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
