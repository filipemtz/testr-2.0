import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import {MatIconModule} from '@angular/material/icon';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../interfaces/question';
import { QuestionFile } from '../../interfaces/question-file';
import { QuestionFileService } from '../../services/question-file.service';

@Component({
  selector: 'app-question-edit-page',
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './question-edit-page.component.html',
  styleUrl: './question-edit-page.component.css'
})
export class QuestionEditPageComponent implements OnInit {
  editForm: FormGroup;
  selectedQuestion: any;
  files: QuestionFile[] = [] as QuestionFile[];
  selectedFile: File | null = null;

  constructor(private authService: AuthService, 
    private questionService: QuestionService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private questionFileService: QuestionFileService,
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
      next: response => {
        this.route.params.subscribe(params => {
          const id = params['id'];
          this.questionService.getQuestion(id).subscribe( {next: response => {
            this.selectedQuestion = response;
            this.editForm.patchValue(response);
            this.loadFiles(id);
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

  loadFiles(questionId: number): void {
    this.questionService.getQuestionFiles(questionId).subscribe({
      next: (files: QuestionFile[]) => {
        this.files = files;
      },
      error: err => {
        console.error(err);
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

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (this.selectedFile && this.selectedQuestion) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('question', this.selectedQuestion.id.toString());
      formData.append('file_name', this.selectedFile.name); // Ensure file_name is provided
  
      this.questionFileService.createFile(formData).subscribe({
        next: () => {
          this.loadFiles(this.selectedQuestion.id);
          this.selectedFile = null;
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }
  

  deleteFile(fileId: number): void {
    this.questionFileService.deleteFile(fileId).subscribe({
      next: () => {
        this.files = this.files.filter(file => file.id !== fileId);
      },
      error: err => {
        console.error(err);
      }
    });
  }
}
