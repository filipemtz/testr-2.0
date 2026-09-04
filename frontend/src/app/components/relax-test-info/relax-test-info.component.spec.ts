import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelaxTestInfoComponent } from './relax-test-info.component';

describe('RelaxTestInfoComponent', () => {
  let component: RelaxTestInfoComponent;
  let fixture: ComponentFixture<RelaxTestInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelaxTestInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RelaxTestInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
