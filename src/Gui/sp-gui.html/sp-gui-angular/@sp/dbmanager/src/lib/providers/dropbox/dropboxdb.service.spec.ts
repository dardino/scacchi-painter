import { TestBed } from "@angular/core/testing";

import { beforeEach, describe, expect, it } from 'vitest';
import { DropboxdbService } from "./dropboxdb.service";

describe("DropboxdbService", () => {
  let service: DropboxdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropboxdbService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
