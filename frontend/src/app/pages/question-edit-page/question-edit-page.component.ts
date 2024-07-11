import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {MatIconModule} from '@angular/material/icon';
import { QuestionService } from '../../services/question.service';
import { InputOutputComponent } from '../../components/input-output/input-output.component';
import {  map, Observable, of } from 'rxjs';
import { QuestionFile } from '../../interfaces/question-file';
import { QuestionFileService } from '../../services/question-file.service';
import { CalendarComponent } from "../../components/calendar/calendar.component";
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-question-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    InputOutputComponent,
    CalendarComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        cpu_limit: ['', Validators.required, [this.cpuLimitValidator] ],
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
            this.loadFiles(id);
          },
          error: err => {
            console.log(err);
          }});
        });
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

  confirmEditQuestion(): void {
    if (this.editForm.valid) {
      const updatedQuestion = { ...this.selectedQuestion, ...this.editForm.value };
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

  deleteQuestion(): void {
    this.questionService.deleteQuestion(this.selectedQuestion.url).subscribe({
      next: () => {
        this.goBack();
      }
    })
  }

  cpuLimitValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      map(value => {
        return (value >= 0 && value <= 1) ? null : { cpuLimit: { value: value } };
      })
    );
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
