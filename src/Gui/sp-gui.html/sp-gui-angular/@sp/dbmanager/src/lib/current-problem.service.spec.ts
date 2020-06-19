import { TestBed } from "@angular/core/testing";

import { CurrentProblemService } from "./current-problem.service";

describe("CurrentProblemService", () => {
  let service: CurrentProblemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentProblemService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
