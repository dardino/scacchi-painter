import { TestBed } from "@angular/core/testing";

import { OneDriveService } from "./one-drive.service";

describe("OneDriveService", () => {
  let service: OneDriveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneDriveService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
