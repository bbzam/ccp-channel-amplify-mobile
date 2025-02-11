import { TestBed } from '@angular/core/testing';

import { ShakaPlayerService } from './shaka-player.service';

describe('ShakaPlayerService', () => {
  let service: ShakaPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShakaPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
