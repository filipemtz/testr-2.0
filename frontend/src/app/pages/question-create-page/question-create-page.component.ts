import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../interfaces/question';
import { InputOutputComponent } from '../../components/input-output/input-output.component';

@Component({
  selector: 'app-question-create-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule, ReactiveFormsModule, InputOutputComponent],
  templateUrl: './question-create-page.component.html',
  styleUrl: './question-create-page.component.css'
})
export class QuestionCreatePageComponent {
  addQuestionForm: FormGroup;
  sectionId: number = -1;

  constructor (
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private location: Location,
    private fb: FormBuilder,
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

  defaultQuestion: Question = {
    id: -1,
    url: '',
    name: "def",
    description: '',
    language: "PT",
    submission_deadline: new Date().toISOString(),
    memory_limit: 200,
    time_limit_seconds: 30,
    cpu_limit: 0.25,
    section: -1,
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sectionId');
    if (id !== null){
      this.sectionId = +id;
      const defQuestion: Question = { ...this.defaultQuestion, section: this.sectionId };
      console.log(defQuestion);
      this.questionService.postQuestion(defQuestion).subscribe({
        next: question => {
          console.log(question);
        },
        error: err => {
          console.error(err);
        }
      });
    }
    else
      console.error('Sem ID');
  }

  confirmCreateQuestion(): void {
    if (this.addQuestionForm.valid) {
      const newQuestion: Question = { section: this.sectionId, ...this.addQuestionForm.value };
      this.questionService.postQuestion(newQuestion).subscribe({
        next: question => {
          console.log(question);
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
