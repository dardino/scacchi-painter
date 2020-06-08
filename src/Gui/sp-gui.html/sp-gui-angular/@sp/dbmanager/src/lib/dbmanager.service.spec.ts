import { TestBed } from '@angular/core/testing';

import { DbmanagerService } from './dbmanager.service';

describe('DbmanagerService', () => {
  let service: DbmanagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbmanagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
