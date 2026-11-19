import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { AllMatIconRegistryService } from "@sp/ui-elements/src/lib/registerIcons";
import { SaveFileComponent } from "./save-file.component";

describe("SaveFileComponent", () => {
  let component: SaveFileComponent;
  let fixture: ComponentFixture<SaveFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SaveFileComponent],
      providers: [AllMatIconRegistryService],
    });
    fixture = TestBed.createComponent(SaveFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should switch the selected file name between SP2 and SP3", () => {
    component.fileName = "problem.sp3";
    component.setFormat("sp2");

    expect(component.format()).toBe("sp2");
    expect(component.fileName).toBe("problem.sp2");

    component.setFormat("sp3");
    expect(component.format()).toBe("sp3");
    expect(component.fileName).toBe("problem.sp3");
  });
});
