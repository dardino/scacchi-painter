import { TestBed } from '@angular/core/testing';

import { SpConvertersService } from './sp-converters.service';

describe('SpConvertersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpConvertersService = TestBed.get(SpConvertersService);
    expect(service).toBeTruthy();
  });
});
