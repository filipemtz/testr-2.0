import { CommonModule, Location } from '@angular/common';
import {  Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { QuestionService } from '../../services/question.service';
import { InputOutputComponent } from '../../components/input-output/input-output.component';
import {  map, Observable, of } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UploadQuestionFileComponent } from '../../components/upload-question-file/upload-question-file.component';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import Notify from 'simple-notify';
import 'simple-notify/dist/simple-notify.css';

import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    UploadQuestionFileComponent,
    NgbDropdownModule
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  templateUrl: './question-edit-page.component.html',
  styleUrl: './question-edit-page.component.css'
})

export class QuestionEditPageComponent implements OnInit {
  editForm: FormGroup;
  selectedQuestion: any;
  erros: any[] = []
  myNotify: any;
  
  constructor(private authService: AuthService, 
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private location: Location,
    private modalService: NgbModal,
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
      this.questionService.editQuestion(this.selectedQuestion.url, updatedQuestion).subscribe({
        next: () => {
          this.pushNotify('Sucesso!', 'Questão editada com sucesso', 'success');
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

  openDeleteQuestionModal(content: TemplateRef<any>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  deleteQuestion(): void {
    this.questionService.deleteQuestion(this.selectedQuestion.url).subscribe({
      next: () => {
        this.modalService.dismissAll();
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

  pushNotify(title: string, text: string | undefined, status: any) {
    this.myNotify = new Notify({
      status: status,
      title: title,
      text: text,
      effect: 'slide',
      type: 'filled',
    });
  }
}
