import { TestBed } from '@angular/core/testing';

import { DbTestInfoService } from './db-test-info.service';

describe('RelaxTestInfoService', () => {
    let service: DbTestInfoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DbTestInfoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
