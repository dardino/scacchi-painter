import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { ThirdPartyImports } from "../thirdPartyImports";
import { FileSourceSelectorComponent } from "./file-source-selector.component";

describe("FileSourceSelectorComponent", () => {
  let component: FileSourceSelectorComponent;
  let fixture: ComponentFixture<FileSourceSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileSourceSelectorComponent, ...ThirdPartyImports],
    });
    fixture = TestBed.createComponent(FileSourceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should hide cloud storages in Tauri", () => {
    window.Bridge = { host: "tauri" } as never;
    fixture = TestBed.createComponent(FileSourceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isCloudStorageAvailable).toBe(false);
  });

  it("should show cloud storages in the web bridge", () => {
    window.Bridge = { host: "web" } as never;
    fixture = TestBed.createComponent(FileSourceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isCloudStorageAvailable).toBe(true);
  });
});
