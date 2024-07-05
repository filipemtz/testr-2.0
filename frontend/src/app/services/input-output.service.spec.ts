import { TestBed } from '@angular/core/testing';

import { InputOutputService } from './input-output.service';

describe('InputOutputService', () => {
  let service: InputOutputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputOutputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
