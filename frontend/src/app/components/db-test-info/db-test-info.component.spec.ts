import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbTestInfoComponent } from './db-test-info.component';

describe('RelaxTestInfoComponent', () => {
    let component: DbTestInfoComponent;
    let fixture: ComponentFixture<DbTestInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DbTestInfoComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DbTestInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
