import { TestBed } from '@angular/core/testing';

import { ChessboardAnimationService } from './chessboard-animation.service';

describe('ChessboardAnimationService', () => {
  let service: ChessboardAnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessboardAnimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
