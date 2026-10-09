import { Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    AccordionButtonDirective, AccordionComponent, AccordionItemComponent, BadgeComponent, ButtonDirective,
    CardBodyComponent, CardComponent, ProgressBarComponent, ProgressComponent, TemplateIdDirective,
} from '@coreui/angular';
import { ActivityItemComponent } from './../activity-item/activity-item.component';
import { EntityFormModalComponent } from './../claude-components/entity-form-modal.component';

import { FormField } from './../claude-components/mooc.forms';
import { TestrStore } from '../../services/testr.store';

import {
    OnInit,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Course, CourseStats } from '../../models/course';
import { Section } from '../../models/section';
import { Question } from '../../models/question';
import { Submission } from '../../models/submission';
import { QuestionService } from '../../services/question.service';
import { SectionService } from '../../services/section.service';
import { CourseService } from '../../services/course.service';
import { SubmissionService } from '../../services/submission.service';


import {
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { notify_error, notify_success } from '../../utils/notifications';
import { ConfirmModalService } from '../confirm-modal/confirm-modal.service';
import { ButtonCloseDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent } from '@coreui/angular';

interface Dialog {
    title: string;
    fields: FormField[];
    value: Record<string, unknown>;
    onSave: (v: Record<string, unknown>) => void;
}
const str = (v: unknown) => String(v ?? '').trim();


@Component({
    selector: 'app-course-detail',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        AccordionComponent,
        AccordionItemComponent,
        AccordionButtonDirective,
        TemplateIdDirective,
        BadgeComponent,
        ButtonDirective,
        CardComponent,
        CardBodyComponent,
        ProgressComponent,
        ProgressBarComponent,
        ActivityItemComponent,
        EntityFormModalComponent,
        RouterLink,
        ModalComponent,
        ModalHeaderComponent,
        ModalBodyComponent,
        ModalFooterComponent,
        ButtonCloseDirective,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './course-detail.component.html',
})
export class CourseDetailComponent implements OnInit {
    protected readonly store = inject(TestrStore);
    @ViewChild('sectionInput') sectionInput!: ElementRef;
    course: Course = {} as Course;
    sections: Section[] = [] as Section[];
    submissions: Submission[] = [] as Submission[];
    stats: CourseStats = {} as CourseStats;
    import_question_modal_visible = signal(false);

    addSectionForm: FormGroup;
    addQuestionForm: FormGroup;

    questionToDelete: Question | null = null;
    sectionToDelete: Section | null = null;
    sectionToEdit: Section | null = null;
    selectedFile: File | null = null;

    private confirm_modal = inject(ConfirmModalService);
    protected readonly edit_modal_visible = signal(false);
    private fb = inject(FormBuilder);  // must be initialized first
    editForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
    });

    constructor(
        private route: ActivatedRoute,
        private questionService: QuestionService,
        private sectionService: SectionService,
        private courseService: CourseService,
        private submissionService: SubmissionService,
        private router: Router,
        private authService: AuthService,
    ) {
        this.addSectionForm = this.fb.group({
            name: ['', Validators.required],
        });


        this.addQuestionForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            language: ['', Validators.required],
            time_limit_seconds: ['', Validators.required],
            memory_limit: ['', Validators.required],
            cpu_limit: ['', Validators.required],
            submission_deadline: ['', Validators.required],
        });
    }

    isProfessor: boolean = false;

    ngOnInit(): void {
        this.authService.userInfo().subscribe({
            next: (response: any) => {
                this.isProfessor = response.groups.includes('teacher');
                this.loadCourse();
            },
        });
    }

    // Recupera um array de seções de um determinado curso
    loadQuestions(sections: Section[]) { // TODO: return questions as part of sections instead of making get requests for each question
        sections.forEach((element: Section) => {
            // Recupera um array de questões de uma determinada seção
            this.sectionService.getQuestions(element.id).subscribe({
                next: (response: any) => {
                    element.questions = response;
                },
                error: (err) => {
                    console.log(err);
                    notify_error('Erro ao carregar as seções');
                }
            });
        });
    }

    loadSubmissions(courseId: number) {
        this.submissionService.submissionsFromCourse(courseId).subscribe({
            next: (response: any) => {
                this.submissions = response;
            },
            error: (err) => {
                console.log(err);
                notify_error('Erro ao carregar as submissões');
            }
        });
    }

    loadStats(courseId: number) {
        this.courseService.getStats(courseId).subscribe({
            next: (stats: any) => {
                this.stats = stats;
            },
            error: (err) => {
                console.log(err);
                // keep the default values and do not show stats.
            }
        });
    }

    percent_done() {
        if (!this.stats)
            return 0;
        return Math.round(100 * (this.stats.n_solved / this.stats.n_solved));
    }

    loadCourse() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;

        this.courseService.getCourse(+id).pipe(
            switchMap(course => {
                this.course = course;
                return forkJoin({
                    submissions: this.submissionService.submissionsFromCourse(course.id),
                    sections: this.courseService.getSections(course.id),
                });
            })
        ).subscribe({
            next: ({ submissions, sections }) => {
                this.submissions = submissions;
                this.sections = sections;
                this.loadQuestions(sections);
                this.loadStats(this.course.id)
            }
        });
    }

    questionIsSolved(question: Question): boolean {
        for (var submission of this.submissions) {
            if ((submission.question == question.id) && (submission.status === "SC"))
                return true;
        }
        return false;
    }

    async removeSection(sectionToDelete: Section) {
        if (!(await this.confirm_modal.delete(sectionToDelete.name)))
            return;

        if (sectionToDelete && sectionToDelete.url) {
            this.sectionService
                .deleteSection(sectionToDelete.url)
                .subscribe({
                    next: () => {
                        this.sections = this.sections.filter(
                            (section) => section.url !== sectionToDelete.url,
                        );
                        notify_success('Seção removida.');
                    },
                    error: (err) => {
                        console.error(err);
                        notify_error('Falha ao deletar a seção.');
                    }
                });
        }
    }

    section_to_edit: Section | null = null;

    open_edit_modal(section: Section) {
        this.section_to_edit = (section);
        this.editForm.patchValue({ name: section.name });
        this.edit_modal_visible.set(true);
    }

    close_edit_modal() {
        this.section_to_edit = (null);
        this.edit_modal_visible.set(false);
    }

    save_section_update(url: string, section: Section) {
        this.sectionService.editSection(section.url, section).subscribe({
            next: () => {
                notify_success("Seção atualizada.");
                this.sections = this.sections.map(s => (s.id === section.id ? section : s));
            },
            error: (err) => {
                console.error(err);
                notify_error('Falha ao editar a seção');
            },
        });

        this.close_edit_modal();
    }

    update_section() {
        if (this.section_to_edit) {
            const section: Section = {
                ...this.section_to_edit,
                name: this.editForm.getRawValue().name,
            };

            this.save_section_update(section.url, section);
        }
    }

    async delete_question(questionToDelete: Question) {
        if (!(await this.confirm_modal.delete(questionToDelete.name)))
            return;

        if (questionToDelete && questionToDelete.url) {
            this.questionService
                .deleteQuestion(questionToDelete?.url ?? '')
                .subscribe({
                    next: () => {
                        this.sections = this.sections.map((section) => {
                            section.questions = section.questions?.filter(
                                (question) => question.url !== questionToDelete!.url,
                            );
                            return section;
                        });
                        notify_success('Questão removida.');
                    },
                    error: (err) => {
                        console.error(err);
                        notify_error('Falha ao deletar a questão');
                    }
                });
        }
    }

    changeSectionOrder(sections: Section[], section_idx: number, other_idx: number): void {
        if (other_idx < 0 || other_idx >= sections.length)
            return;

        const section = sections[section_idx];
        const otherSection = sections[other_idx];
        this.sectionService.swapOrder(section, otherSection).subscribe({
            next: (result) => {
                // swap locally
                const temp = section.order;
                section.order = otherSection.order;
                otherSection.order = temp;

                if (section) {
                    this.sections.sort((a, b) => a.order - b.order);
                }
            },
            error: err => {
                notify_error('Falha ao trocar a ordem das questões');
                console.log(err);
            }
        })
    }

    changeQuestionOrder(questions: Question[], question_idx: number, other_idx: number): void {
        if (other_idx < 0 || other_idx >= questions.length)
            return;

        const question = questions[question_idx];
        const otherQuestion = questions[other_idx];
        this.questionService.swapOrder(question, otherQuestion).subscribe({
            next: (result) => {
                // swap locally
                const temp = question.order;
                question.order = otherQuestion.order;
                otherQuestion.order = temp;

                // re-sort the list where they belong
                const section = this.sections.find(s =>
                    s.questions?.includes(question)
                );

                if (section) {
                    section.questions?.sort((a, b) => a.order - b.order);
                }
            },
            error: err => {
                notify_error('Falha ao trocar a ordem das questões');
                console.log(err);
            }
        })
    }

    createDefaultSection(courseId: number) {
        // const defaultSection: Section = { ...this.defaultSection, course: courseId }
        const defaultSection: Section = {
            id: -1,
            url: '',
            name: "Nova Seção",
            course: courseId,
            originalName: "Nova Seção",
            visible: true,
            order: this.sections.length
        }

        this.sectionService.postSection(defaultSection).subscribe({
            next: section => {
                this.sections.push(section);
            }
        })
    }

    createDefaultQuestion(section: Section) {
        const defaultQuestion: Question = {
            id: -1,
            url: '',
            name: "Nova Questão",
            description: '',
            language: "PT",
            submission_deadline: new Date(),
            memory_limit: 200,
            time_limit_seconds: 30,
            cpu_limit: 0.25,
            section: section.id,
            visible: true,
            order: section.questions?.length || 0
        };

        this.questionService.postQuestion(defaultQuestion).subscribe({
            next: question => {
                this.router.navigate([`/question/${question.id}/edit`]);
            },
            error: err => {
                notify_error('Falha ao criar questão');
                console.log(err);
            }
        });
    }

    putQuestion(q: Question) {
        const updatedQuestion = { ...q };
        this.questionService.editQuestion(q.url, updatedQuestion).subscribe({
            next: () => {
                notify_success("Questão atualizada.");
            },
            error: (err) => {
                console.error(err);
                notify_error('Falha ao editar uma questão');
            },
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    changeVisibilitySection(section: Section): void {
        section.visible = !section.visible;
        this.save_section_update(section.url, section);
    }

    changeVisibilityQuestion(question: Question): void {
        question.visible = !question.visible;
        this.putQuestion(question);
    }

    downloadQuestion(question: Question) {
        this.questionService.exportQuestion(question.id).subscribe({
            next: (response) => {
                const blob = new Blob([response], { type: 'application/zip' });

                // Cria um link temporário para o download do arquivo
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${question.name}.zip`;  // Define o nome do arquivo a ser baixado
                document.body.appendChild(a);
                a.click();  // Dispara o download
                document.body.removeChild(a);
            },
            error: (err) => {
                console.error(err);
                notify_error('Falha ao exportar a questão');
            },
        });
    }

    /** ************************************************* */
    /** ************************************************* */

    readonly courseId = input.required<string>();

    protected back() { this.router.navigate(['..'], { relativeTo: this.route }); }

    log(msg: string) {
        console.log(msg);
    }
}
