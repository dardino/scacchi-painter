import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";

import { FolderItemInfo } from "@sp/host-bridge/src/lib/fileService";
import { DbmanagerService } from "./dbmanager.service";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getFixturePath(): string {
  return resolve(__dirname, "../../../../../../docs/db_schemas/sp3-example-file.sp3");
}

async function getFileContent(): Promise<{ file: File; meta: FolderItemInfo }> {
  const fixturePath = getFixturePath();
  const fileText = await readFile(fixturePath, "utf8");
  const file = new File([fileText], "sp3-example-file.sp3", { type: "application/json" });
  const meta = {
    type: "file" as const,
    itemName: "sp3-example-file.sp3",
    fullPath: "sp3-example-file.sp3",
    id: "sp3-example-file.sp3",
  };
  return { file, meta };
}

describe("DbmanagerService", () => {
  let service: DbmanagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
    });
    service = TestBed.inject(DbmanagerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should load the SP3 example file and parse more than 200 problems", async () => {
    const { file, meta } = await getFileContent();
    const result = await service.Load({ file, meta, source: "unknown" });
    expect(result).toBeNull();
    expect(service.All().length).toBe(236);
  });

  it("should read prize information from the SP3 example file", async () => {
    const { file, meta } = await getFileContent();
    const result = await service.Load({ file, meta, source: "unknown" });
    expect(result).toBeNull();
    const allItems = service.All();
    const prizeItem = allItems.find(item => item.prizeRank === 1 && item.prizeDescription === "Premio");
    expect(prizeItem).toBeDefined();
  });

  it("should read magazine information from the SP3 example file", async () => {
    const { file, meta } = await getFileContent();
    const result = await service.Load({ file, meta, source: "unknown" });
    expect(result).toBeNull();
    const allItems = service.All();
    const magazineItem = allItems.find(item => item.source?.length > 0);
    expect(magazineItem).toBeDefined();
  });
});
