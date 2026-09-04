import { TestBed } from '@angular/core/testing';

import { RelaxTestInfoService } from './relax-test-info.service';

describe('RelaxTestInfoService', () => {
  let service: RelaxTestInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelaxTestInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
