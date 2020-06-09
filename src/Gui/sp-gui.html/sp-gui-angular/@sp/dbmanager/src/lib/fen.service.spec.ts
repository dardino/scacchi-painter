import { TestBed } from "@angular/core/testing";

import { FenService } from "./fen.service";

describe("FenService", () => {
  let service: FenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FenService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("Fen to pieces", () => {
    const fenSample = `8/4pBp1/4PqP1/1pp2PRP/k1p3Pp/2P3r1/1nrP1K2/8`;
    const cells = service.FenToChessBoard(fenSample);
    expect(cells.length).toBe(64);
  });
});
