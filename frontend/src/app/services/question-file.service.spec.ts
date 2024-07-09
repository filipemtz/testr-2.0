import { TestBed } from '@angular/core/testing';

import { QuestionFileService } from './question-file.service';

describe('QuestionFileService', () => {
  let service: QuestionFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
