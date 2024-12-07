import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadQuestionFileComponent } from './import-question.component';

describe('UploadQuestionFileComponent', () => {
  let component: UploadQuestionFileComponent;
  let fixture: ComponentFixture<UploadQuestionFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadQuestionFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadQuestionFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
