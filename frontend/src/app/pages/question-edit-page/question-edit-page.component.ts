import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {MatIconModule} from '@angular/material/icon';
import { QuestionService } from '../../services/question.service';
import { InputOutputComponent } from '../../components/input-output/input-output.component';
import {  map, Observable, of } from 'rxjs';
import { CalendarComponent } from "../../components/calendar/calendar.component";
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UploadQuestionFileComponent } from '../../components/upload-question-file/upload-question-file.component';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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
    MatDatepickerModule,
    UploadQuestionFileComponent,
    NgbDatepickerModule, NgbAlertModule
  ],
  providers: [provideNativeDateAdapter()],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question-edit-page.component.html',
  styleUrl: './question-edit-page.component.css'
})

export class QuestionEditPageComponent implements OnInit {

  editForm: FormGroup;
  selectedQuestion: any;
  erros: any[] = []
  
  constructor(private authService: AuthService, 
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private location: Location,
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
          },
          error: err => {
            console.log(err);
          }});
        });
      }
    });
  }


  confirmEditQuestion(): void {
    if (this.editForm.valid) {
      const updatedQuestion = { ...this.selectedQuestion, ...this.editForm.value };
      console.log(updatedQuestion.submission_deadline);
      this.questionService.editQuestion(this.selectedQuestion.url, updatedQuestion).subscribe({
        next: () => {
          this.resetForm();
          this.goBack();
        },
        error: (err:any) => {
          this.erros = err.error;
          
          this.erros.forEach((element) => {
            console.log(element);
          });
          
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
}
