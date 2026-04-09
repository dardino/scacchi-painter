import { TestBed } from "@angular/core/testing";
import { BehaviorSubject, Subject } from "rxjs";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { HostBridgeService } from "./host-bridge.service";

describe("HostBridgeService", () => {
  let service: HostBridgeService;
  let bridge: {
    runSolve: ReturnType<typeof vi.fn>;
    stopSolve: ReturnType<typeof vi.fn>;
    supportsEngine: ReturnType<typeof vi.fn>;
    availableEngines: ReturnType<typeof vi.fn>;
    openFile: ReturnType<typeof vi.fn>;
    saveFile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});

    bridge = {
      runSolve: vi.fn(),
      stopSolve: vi.fn(),
      supportsEngine: vi.fn(() => true),
      availableEngines: vi.fn(() => ["Popeye", "SpCore"]),
      openFile: vi.fn(),
      saveFile: vi.fn(),
    };
    window.Bridge = bridge as never;

    service = TestBed.inject(HostBridgeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("releases solve lock when receiving unsupported-style EOF payload", () => {
    const stream = new Subject<any>();
    bridge.runSolve.mockReturnValue(stream.asObservable());

    const solveStates: boolean[] = [];
    service.solveInProgress$.subscribe(state => solveStates.push(state));

    const problem = { engine: "SpCore" } as any;
    service.startSolve(problem, "SpCore", "try");

    stream.next({ message: "SpCore does not support try mode" });

    const restartError = service.startSolve(problem, "SpCore", "start");

    expect(restartError).toBeUndefined();
    expect(solveStates).toContain(true);
    expect(solveStates).toContain(false);
  });

  it("releases solve lock when stream completes without explicit EOF", () => {
    const stream = new Subject<any>();
    bridge.runSolve.mockReturnValue(stream.asObservable());

    const solveStates: boolean[] = [];
    service.solveInProgress$.subscribe(state => solveStates.push(state));

    const problem = { engine: "Popeye" } as any;
    service.startSolve(problem, "Popeye", "start");
    stream.complete();

    const restartError = service.startSolve(problem, "Popeye", "start");

    expect(restartError).toBeUndefined();
    expect(solveStates).toContain(true);
    expect(solveStates).toContain(false);
  });

  it("releases solve lock when EOF is emitted synchronously on subscribe", () => {
    const stream = new BehaviorSubject<any>({
      exitCode: -1,
      message: "SpCore does not support this problem yet. Unsupported feature: try mode.",
    });
    bridge.runSolve.mockReturnValue(stream.asObservable());

    const solveStates: boolean[] = [];
    service.solveInProgress$.subscribe(state => solveStates.push(state));

    const problem = { engine: "SpCore" } as any;
    const firstStartError = service.startSolve(problem, "SpCore", "try");
    const secondStartError = service.startSolve(problem, "SpCore", "start");

    expect(firstStartError).toBeUndefined();
    expect(secondStartError).toBeUndefined();
    expect(solveStates).toContain(true);
    expect(solveStates).toContain(false);
  });
});
