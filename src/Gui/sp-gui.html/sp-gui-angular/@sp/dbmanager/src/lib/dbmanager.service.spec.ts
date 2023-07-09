import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { DbmanagerService } from "./dbmanager.service";
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

});
