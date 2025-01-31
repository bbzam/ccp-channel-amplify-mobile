import { TestBed } from '@angular/core/testing';

import { BetaAccessService } from './beta-access.service';

describe('BetaAccessService', () => {
  let service: BetaAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BetaAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
