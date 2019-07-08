import { TestBed } from '@angular/core/testing';

import { SpDbmService } from './sp-dbm.service';

describe('SpDbmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpDbmService = TestBed.get(SpDbmService);
    expect(service).toBeTruthy();
  });
});
