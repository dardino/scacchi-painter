import { EnvironmentInjector, runInInjectionContext } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { MockDbmanagerService, MockHostBridgeService } from "@sp/dbmanager/src/lib/db.mocks";
import { DbmanagerService, IDbManagerService } from "@sp/dbmanager/src/public-api";
import { HostBridgeService } from "@sp/host-bridge/src/lib/host-bridge.service";
import { Subject } from "rxjs/internal/Subject";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MyDataSource, ProblemRef } from "./database-source";

describe("DatabaseSource", () => {
  const dbmanager: IDbManagerService = new MockDbmanagerService();
  function createMyDataSource(dbmanager: IDbManagerService): MyDataSource {
    const dataSource = runInInjectionContext(
      TestBed.inject(EnvironmentInjector),
      () => new MyDataSource(dbmanager),
    );
    return dataSource;
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DbmanagerService, useValue: dbmanager },
        { provide: HostBridgeService, useClass: MockHostBridgeService },
      ],
    });

    await vi.waitFor(() => {
      expect(dbmanager.All().length).toBeGreaterThan(0);
    });
  });

  afterEach(() => {
    dbmanager.SetCurrentProblem(null);
  });

  it("should create an instance and successfully connect", () => {
    const itemSource = createMyDataSource(dbmanager);
    expect(itemSource).toBeTruthy();
  });

  it("should populate the data stream from the mock db in id-desc order on first load", async () => {
    const itemSource = createMyDataSource(dbmanager);
    const collectionViewer = {
      viewChange: new Subject<{ start: number; end: number }>(),
    };

    const dbData: ProblemRef[] = [];
    const callback = vi.fn().mockImplementation((data: ProblemRef[]) => {
      dbData.length = 0;
      dbData.push(...data.filter((p): p is ProblemRef => !!p));
    });
    itemSource.connect(collectionViewer).subscribe(callback);
    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
      expect(dbData.length).toBeGreaterThan(0);
    });

    expect(dbData.every(entry => entry.problem !== null)).toBe(true);

    const loadedItems = dbData.filter((entry: { dbIndex?: number } | undefined) => entry && entry.dbIndex != null && entry.dbIndex > 0);

    expect(loadedItems.length).toBe(dbmanager.All().length);
    const indexes = loadedItems.map((entry: { dbIndex: number }) => entry.dbIndex);
    expect(indexes).toEqual([...indexes].sort((a, b) => b - a));
    expect(indexes[0]).toBeGreaterThan(indexes[indexes.length - 1]);
  });

  it("should return at least one item when filtering by HS#", async () => {
    const itemSource = createMyDataSource(dbmanager);
    const collectionViewer = {
      viewChange: new Subject<{ start: number; end: number }>(),
    };

    const filteredValues: ProblemRef[] = [];
    const callback = vi.fn().mockImplementation((data: ProblemRef[]) => {
      filteredValues.length = 0;
      filteredValues.push(...data.filter((p): p is ProblemRef => !!p && !!p.problem));
    });

    itemSource.connect(collectionViewer).subscribe(callback);
    itemSource.filter("HS#");
    await vi.waitFor(() => {
      expect(filteredValues.length).toBeGreaterThan(0);
      expect(filteredValues.length).toBeLessThan(dbmanager.All().length);
    });

    expect(filteredValues.some(entry =>
      entry.problem?.source.toLowerCase().includes("hs#")
      || entry.problem?.stipulation.completeStipulationDesc.toLowerCase().includes("hs#")
      || entry.problem?.authors.some(author => author.nameAndSurname.toLowerCase().includes("hs#")),
    )).toBe(true);
  });

  it("should return the same matches for filter values differing only by casing", async () => {
    const itemSourceUpper = createMyDataSource(dbmanager);
    const itemSourceLower = createMyDataSource(dbmanager);
    const collectionViewerUpper = { viewChange: new Subject<{ start: number; end: number }>() };
    const collectionViewerLower = { viewChange: new Subject<{ start: number; end: number }>() };

    const resultsUpper: ProblemRef[] = [];
    const resultsLower: ProblemRef[] = [];

    const upperCallback = vi.fn().mockImplementation((data: ProblemRef[]) => {
      resultsUpper.length = 0;
      resultsUpper.push(...data.filter((p): p is ProblemRef => !!p && !!p.problem));
    });
    const lowerCallback = vi.fn().mockImplementation((data: ProblemRef[]) => {
      resultsLower.length = 0;
      resultsLower.push(...data.filter((p): p is ProblemRef => !!p && !!p.problem));
    });

    itemSourceUpper.connect(collectionViewerUpper).subscribe(upperCallback);
    itemSourceLower.connect(collectionViewerLower).subscribe(lowerCallback);

    itemSourceUpper.filter("H#");
    itemSourceLower.filter("h#");

    await vi.waitFor(() => {
      expect(resultsUpper.length).toBeGreaterThan(0);
      expect(resultsLower.length).toBeGreaterThan(0);
    });

    expect(resultsUpper.map(item => item.dbIndex)).toEqual(resultsLower.map(item => item.dbIndex));
    expect(resultsUpper).toHaveLength(resultsLower.length);
  });

  it("should return at least one item when filtering by king position g1", async () => {
    const itemSource = createMyDataSource(dbmanager);
    const collectionViewer = {
      viewChange: new Subject<{ start: number; end: number }>(),
    };

    const filteredValues: ProblemRef[] = [];
    const callback = vi.fn().mockImplementation((data: ProblemRef[]) => {
      filteredValues.length = 0;
      filteredValues.push(...data.filter((p): p is ProblemRef => !!p && !!p.problem));
    });

    itemSource.connect(collectionViewer).subscribe(callback);
    itemSource.filter("g1");

    await vi.waitFor(() => {
      expect(filteredValues.length).toBeGreaterThan(0);
    });

    expect(filteredValues.every(entry =>
      entry.problem?.kingPositions.toLowerCase().includes("g1")
      && entry.problem?.pieces.some(piece =>
        piece.GetLocation().column === "ColG"
        && piece.GetLocation().traverse === "Row1"
        && piece.appearance === "k"),
    )).toBe(true);
  });

  it("should return the same king-position matches for G1 and g1", async () => {
    const itemSourceUpper = createMyDataSource(dbmanager);
    const itemSourceLower = createMyDataSource(dbmanager);
    const collectionViewerUpper = { viewChange: new Subject<{ start: number; end: number }>() };
    const collectionViewerLower = { viewChange: new Subject<{ start: number; end: number }>() };

    const resultsUpper: ProblemRef[] = [];
    const resultsLower: ProblemRef[] = [];

    const upperCallback = vi.fn().mockImplementation((data: ProblemRef[]) => {
      resultsUpper.length = 0;
      resultsUpper.push(...data.filter((p): p is ProblemRef => !!p && !!p.problem));
    });
    const lowerCallback = vi.fn().mockImplementation((data: ProblemRef[]) => {
      resultsLower.length = 0;
      resultsLower.push(...data.filter((p): p is ProblemRef => !!p && !!p.problem));
    });

    itemSourceUpper.connect(collectionViewerUpper).subscribe(upperCallback);
    itemSourceLower.connect(collectionViewerLower).subscribe(lowerCallback);

    itemSourceUpper.filter("G1");
    itemSourceLower.filter("g1");

    await vi.waitFor(() => {
      expect(resultsUpper.length).toBeGreaterThan(0);
      expect(resultsLower.length).toBeGreaterThan(0);
    });

    expect(resultsUpper.map(item => item.dbIndex)).toEqual(resultsLower.map(item => item.dbIndex));
  });
});
