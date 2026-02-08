import { TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from "vitest";
import { HostBridgeService } from "./host-bridge.service";

describe("HostBridgeService", () => {
  let service: HostBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostBridgeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
