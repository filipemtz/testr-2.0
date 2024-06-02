import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesDetailPageComponent } from './courses-detail-page.component';

describe('CoursesDetailPageComponent', () => {
  let component: CoursesDetailPageComponent;
  let fixture: ComponentFixture<CoursesDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesDetailPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoursesDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
