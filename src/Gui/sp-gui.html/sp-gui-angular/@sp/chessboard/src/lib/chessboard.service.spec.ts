import { TestBed } from '@angular/core/testing';

import { ChessboardService } from './chessboard.service';

describe('ChessboardService', () => {
  let service: ChessboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
