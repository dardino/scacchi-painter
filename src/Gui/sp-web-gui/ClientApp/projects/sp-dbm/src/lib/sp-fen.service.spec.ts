import { TestBed } from "@angular/core/testing";

import { SpFenService } from "./sp-fen.service";

describe("SpFenService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: SpFenService = TestBed.get(SpFenService);
    expect(service).toBeTruthy();
  });
});
