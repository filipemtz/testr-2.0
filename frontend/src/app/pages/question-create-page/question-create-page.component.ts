import { CommonModule, Location } from '@angular/common';
import { OnInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CourseService } from '../../services/course.service';
import { SectionService } from '../../services/section.service';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../interfaces/question';

@Component({
  selector: 'app-question-create-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-create-page.component.html',
  styleUrl: './question-create-page.component.css'
})
export class QuestionCreatePageComponent {
  addQuestionForm: FormGroup;
  sectionId: number = -1;

  constructor (
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private sectionService: SectionService,
    private courseService: CourseService,
    private modalService: NgbModal,
    private location: Location,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) 
  {
    this.addQuestionForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      language: ['', Validators.required],
      time_limit_seconds: ['', Validators.required],
      memory_limit: ['', Validators.required],
      cpu_limit: ['', Validators.required],
      submission_deadline: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sectionId');
    console.log(id)
    if (id !== null){
      this.sectionId = +id;
    }
    else 
      console.error('Sem ID');
  }

  confirmCreateQuestion(): void {
    if (this.addQuestionForm.valid) {
      const newQuestion: Question = { section: this.sectionId, ...this.addQuestionForm.value };
      console.log(newQuestion.url)
      this.questionService.postQuestion(newQuestion).subscribe({
        next: () => {
          this.addQuestionForm.reset();
          this.goBack();
        },
        error: err => {
          console.error(err);
        }
      });
    }
    else{
      console.log("invalid form");
    }
  }

  goBack(): void {
    this.location.back();
  }
}
