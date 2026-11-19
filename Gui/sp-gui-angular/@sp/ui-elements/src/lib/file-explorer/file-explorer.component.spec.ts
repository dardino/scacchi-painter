import { ComponentFixture, TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileExplorerComponent } from "./file-explorer.component";

describe("FileExplorerComponent", () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileExplorerComponent],
    });
    fixture = TestBed.createComponent(FileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should show filesystem enumeration errors", async () => {
    component.service = {
      sourceName: "local",
      enumContent: vi.fn(async () => {
        throw new Error("Unable to read local folder");
      }),
      getFileContent: vi.fn(),
      saveFileContent: vi.fn(),
      joinPath: vi.fn((...parts: string[]) => parts.join("/")),
    };
    component.mode = "open";
    component.ngOnInit();
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.errorMessage()).toBe("Unable to read local folder");
  });
});
