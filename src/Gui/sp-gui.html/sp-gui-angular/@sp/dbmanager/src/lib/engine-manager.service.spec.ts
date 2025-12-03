import { TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { EngineManagerService } from "./engine-manager.service";

describe("EngineManagerService", () => {
  let service: EngineManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineManagerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
