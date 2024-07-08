import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {MatIconModule} from '@angular/material/icon';
import { QuestionService } from '../../services/question.service';
import { InputOutputComponent } from '../../components/input-output/input-output.component';

@Component({
  selector: 'app-question-edit-page',
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule, InputOutputComponent],
  templateUrl: './question-edit-page.component.html',
  styleUrl: './question-edit-page.component.css'
})
export class QuestionEditPageComponent implements OnInit {
  editForm: FormGroup;
  selectedQuestion: any;

  constructor(private authService: AuthService, 
    private questionService: QuestionService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {
      this.editForm = this.fb.group({
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
    this.authService.profile().subscribe({
      next: () => {
        this.route.params.subscribe(params => {
          const id = params['questionId'];
          this.questionService.getQuestion(id).subscribe( {next: response => {
            this.selectedQuestion = response;
            this.editForm.patchValue(response);
          },
          error: err => {
            console.log(err);
          }});
        });
      },
      error: err => {
        this.router.navigate(['/accounts/login']);
      }
    });
  }

  confirmSave(): void {
    if (this.editForm.valid) {
      const updatedQuestion = { ...this.selectedQuestion, ...this.editForm.value };
      console.log(updatedQuestion.url)
      this.questionService.editQuestion(this.selectedQuestion.url, updatedQuestion).subscribe({
        next: () => {
          this.resetForm();
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

  resetForm(): void {
    this.selectedQuestion = null;
    this.editForm.reset();
  }
}
