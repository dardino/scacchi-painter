import { TestBed } from '@angular/core/testing';

import { SpUicService } from './sp-uic.service';

describe('SpUicService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpUicService = TestBed.get(SpUicService);
    expect(service).toBeTruthy();
  });
});
