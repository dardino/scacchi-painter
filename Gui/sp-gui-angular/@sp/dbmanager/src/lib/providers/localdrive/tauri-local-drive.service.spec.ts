import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TauriLocalDriveService } from "./tauri-local-drive.service";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

describe("TauriLocalDriveService", () => {
  let service: TauriLocalDriveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TauriLocalDriveService);
    vi.mocked(invoke).mockReset();
  });

  it("joins Windows and POSIX paths", () => {
    expect(service.joinPath("C:\\Users", "dardino", "database.sp3"))
      .toBe("C:\\Users\\dardino\\database.sp3");
    expect(service.joinPath("/home/dardino", "database.sp3"))
      .toBe("/home/dardino/database.sp3");
  });

  it("enumerates roots", async () => {
    vi.mocked(invoke).mockResolvedValue([
      { id: "C:\\", itemName: "C:\\", fullPath: "C:\\", entryType: "drive" },
    ]);

    const entries = await service.enumContent("", "root");

    expect(invoke).toHaveBeenCalledWith("list_local_roots");
    expect(entries).toEqual([
      { id: "C:\\", itemName: "C:\\", fullPath: "C:\\", type: "drive" },
    ]);
  });

  it("reads a native file as a File", async () => {
    vi.mocked(invoke).mockResolvedValue([123, 34, 100, 97, 116, 97, 34, 125]);

    const file = await service.getFileContent({
      type: "file",
      itemName: "database.sp3",
      fullPath: "C:\\data\\database.sp3",
      id: "C:\\data\\database.sp3",
    });

    expect(file.name).toBe("database.sp3");
    await expect(file.text()).resolves.toBe("{\"data\"}");
  });

  it("writes a native file and returns its absolute metadata", async () => {
    vi.mocked(invoke).mockResolvedValue(undefined);
    const file = new File(["{}"], "database.sp3", { type: "application/json" });

    const result = await service.saveFileContent(file, {
      type: "folder",
      itemName: "data",
      fullPath: "C:\\data",
      id: "C:\\data",
    });

    expect(result).not.toBeInstanceOf(Error);
    expect(result).toEqual({
      type: "file",
      itemName: "database.sp3",
      fullPath: "C:\\data\\database.sp3",
      id: "C:\\data\\database.sp3",
    });
  });
});
