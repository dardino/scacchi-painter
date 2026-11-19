import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";

import { FolderItemInfo } from "@sp/host-bridge/src/lib/fileService";
import { DbmanagerService } from "./dbmanager.service";
import { Problem } from "./models/problem";
import { Piece } from "./models/piece";
import { Twin } from "./models/twin";
import { TwinModes } from "./SPX.v4";
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

  it("should export the current database as SP2 XML", async () => {
    service.SetData([Problem.fromFen("8/8/8/8/8/8/8/R3K3 w - - 0 1")]);

    const file = await service.GetFileContent("sp2");
    const text = await file.text();

    expect(file.name).toBe("temp.sp2");
    expect(text).toContain("<ScacchiPainterDatabase");
    expect(text).toContain("<SP_Item");
  });

  it("should round-trip one problem through SP2 XML", async () => {
    const problem = Problem.fromFen("8/8/8/8/8/8/8/R3K3 w - - 0 1");
    problem.pieces.push(Piece.fromJson({
      appearance: "n",
      color: "White",
      fairyCode: "am",
      fairyAttributes: ["Royal"],
      fairyParams: [],
      column: "ColE",
      traverse: "Row4",
    }));
    problem.twins.TwinList.push(Twin.fromJson({
      TwinType: "MovePiece",
      TwinModes: TwinModes.Normal,
      ValueA: "e4",
      ValueB: "e5",
    }));
    problem.textSolution = "1. Ra1-a2";
    problem.htmlSolution = "<p>1. Ra1-a2</p>";
    service.SetData([problem]);
    const exported = await service.GetFileContent("sp2");
    const meta = {
      type: "file" as const,
      itemName: "round-trip.sp2",
      fullPath: "round-trip.sp2",
      id: "round-trip.sp2",
    };

    const result = await service.Load({ file: exported, meta, source: "unknown" });

    expect(result).toBeNull();
    expect(service.All()).toHaveLength(1);
    expect(service.All()[0].pieces).toHaveLength(3);
    expect(service.All()[0].pieces.some(piece => piece.fairyCode === "am")).toBe(true);
    expect(service.All()[0].twins.TwinList).toHaveLength(2);
    expect(service.All()[0].textSolution).toContain("Ra1-a2");
  });

  it("should export explicitly selected SP3 JSON", async () => {
    service.SetData([Problem.fromFen("8/8/8/8/8/8/8/R3K3 w - - 0 1")]);

    const file = await service.GetFileContent("sp3");
    const text = await file.text();
    const json = JSON.parse(text);

    expect(file.name).toBe("temp.sp3");
    expect(json.version).toBe(5);
    expect(json.problems).toHaveLength(1);
  });

  it("should load the current problem after loading a database", async () => {
    const problem = Problem.fromFen("8/8/8/8/8/8/8/R3K3 w - - 0 1");
    service.SetData([problem]);
    const meta = {
      type: "file" as const,
      itemName: "position.sp3",
      fullPath: "position.sp3",
      id: "position.sp3",
    };
    const file = new File([JSON.stringify({
      version: 5,
      lastIndex: 1,
      name: "Test",
      awards: [],
      problems: [problem.toJson()],
    })], "position.sp3", { type: "application/json" });

    const result = await service.Load({ file, meta, source: "local" });

    expect(result).toBeNull();
    expect(service.All()).toHaveLength(1);
    expect(service.CurrentProblem()).not.toBeNull();
  });
});
