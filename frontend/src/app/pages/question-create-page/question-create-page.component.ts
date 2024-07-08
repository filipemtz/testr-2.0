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
  currentQuestion: Question = {} as Question;
  questionId: number = -1;

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
    const id = this.route.snapshot.paramMap.get('questionId');
    if (id !== null){
      this.questionId = +id;
      this.questionService.getQuestion(this.questionId).subscribe({
        next: question => {
          this.currentQuestion = question;
        }
      })
    }
    else
      console.error('Questão sem ID; ERRO!');
  }

  confirmCreateQuestion(): void {
    if (this.addQuestionForm.valid) {
      const newQuestion: Question = { ...this.addQuestionForm.value };
      this.questionService.editQuestion(this.currentQuestion.url, newQuestion).subscribe({
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

  deleteDefaultQuestion(): void {
    this.questionService.deleteQuestion(this.currentQuestion.url).subscribe({
      next: () => {
        this.goBack();
      }
    })
  }

  goBack(): void {
    this.location.back();
  }
}
