import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionCreatePageComponent } from './question-create-page.component';

describe('QuestionCreatePageComponent', () => {
  let component: QuestionCreatePageComponent;
  let fixture: ComponentFixture<QuestionCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionCreatePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuestionCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
