import { TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalDriveService } from "./local-drive.service";

describe("LocalDriveService", () => {
  let service: LocalDriveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalDriveService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should reuse a file handle from IndexedDB when it exists for the selected item", async () => {
    const fileHandle = {
      queryPermission: vi.fn(async () => "granted"),
      getFile: vi.fn(async () => new File(["test"], "board.sp3", { type: "application/json" })),
    } as unknown as FileSystemFileHandle;

    const fakeStore = {
      get: vi.fn((key: string) => {
        const request = {
          result: key === "board-1|/tmp/board.sp3|board.sp3" ? fileHandle : undefined,
          onsuccess: null as (() => void) | null,
          onerror: null as (() => void) | null,
        };
        queueMicrotask(() => {
          if (request.onsuccess) {
            request.onsuccess();
          }
        });
        return request;
      }),
      put: vi.fn((value: FileSystemFileHandle, key: string) => {
        expect(key).toBe("board-1|/tmp/board.sp3|board.sp3");
        expect(value).toBe(fileHandle);
        const request = {
          onsuccess: null as (() => void) | null,
          onerror: null as (() => void) | null,
        };
        queueMicrotask(() => {
          if (request.onsuccess) {
            request.onsuccess();
          }
        });
        return request;
      }),
    };

    const fakeDb = {
      objectStoreNames: {
        contains: vi.fn(() => false),
      },
      createObjectStore: vi.fn(() => fakeStore),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => fakeStore),
        oncomplete: null,
        onerror: null,
      })),
      close: vi.fn(),
    };

    const request = {
      result: fakeDb,
      onupgradeneeded: null as (() => void) | null,
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
    };

    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: {
        open: vi.fn(() => {
          queueMicrotask(() => {
            if (request.onupgradeneeded) {
              request.onupgradeneeded();
            }
            if (request.onsuccess) {
              request.onsuccess();
            }
          });
          return request;
        }),
      },
    });

    Object.defineProperty(window, "showOpenFilePicker", {
      configurable: true,
      value: vi.fn(() => {
        throw new Error("showOpenFilePicker should not be called");
      }),
    });

    const item = {
      type: "file" as const,
      itemName: "board.sp3",
      fullPath: "/tmp/board.sp3",
      id: "board-1",
    };

    const file = await service.getFileContent(item);

    expect(file.name).toBe("board.sp3");
    expect(fileHandle.queryPermission).toHaveBeenCalled();
    expect(fakeStore.put).toHaveBeenCalledWith(fileHandle, "board-1|/tmp/board.sp3|board.sp3");
  });
});
