import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { QuestionService } from '../../services/question.service';
import { InputOutputComponent } from '../../components/input-output/input-output.component';
import { RelaxTestInfoComponent } from '../../components/relax-test-info/relax-test-info.component';
import { map, Observable, of } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UploadQuestionFileComponent } from '../../components/upload-question-file/upload-question-file.component';
import {
    ButtonCloseDirective,
    ButtonDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective
} from '@coreui/angular';
import { FormSelectDirective } from '@coreui/angular';

import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Question } from '../../models/question';
import { notify_error, notify_success } from '../../utils/notifications';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        UploadQuestionFileComponent,
        FormSelectDirective,
        InputOutputComponent,
        RelaxTestInfoComponent,
        ModalComponent,
        ModalHeaderComponent,
        ModalTitleDirective,
        ButtonCloseDirective,
        ModalBodyComponent,
        ModalFooterComponent,
        ButtonDirective,

    ],
    providers: [provideNativeDateAdapter(), { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
    ],
    templateUrl: './question-edit-page.component.html',
    styleUrl: './question-edit-page.component.css'
})

export class QuestionEditPageComponent implements OnInit {
    editForm: FormGroup;
    question: Question | null = null;
    delete_modal_visible: boolean = false;
    erros: any[] = []
    myNotify: any;

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
            cpu_limit: ['', Validators.required, [this.cpuLimitValidator]],
            submission_deadline: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.authService.profile().subscribe({
            next: () => {
                this.route.params.subscribe(params => {
                    const id = params['questionId'];
                    this.questionService.getQuestion(id).subscribe({
                        next: response => {
                            this.question = response;
                            this.editForm.patchValue(response);
                        },
                        error: err => {
                            console.log(err);
                        }
                    });
                });
            }
        });
    }

    confirmEditQuestion(): void {
        if (this.question && this.editForm.valid) {
            const updatedQuestion = { ...this.question, ...this.editForm.value };
            this.questionService.editQuestion(this.question.url, updatedQuestion).subscribe({
                next: () => {
                    notify_success('Questão editada com sucesso');
                },
                error: (err: any) => {
                    console.log(err);
                    notify_error("Falha ao atualizar a questão");
                }
            });
        }
        else {
            console.log("invalid form");
        }
    }

    deleteQuestion(): void {
        if (this.question) {
            this.questionService.deleteQuestion(this.question.url).subscribe({
                next: () => {
                    this.question = null;
                    this.goBack();
                }
            });
        }
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
}
