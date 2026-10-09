import { signal, Component, ElementRef, ViewChild, OnInit, TemplateRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../models/course';
//import { CourseCardComponent } from '../../components/course-card/course-card.component';
// import { CourseDetailComponent } from '../course-detail/course-detail.component';

import {
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { notify_error, notify_success } from '../../utils/notifications';

import { inject, input, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonCloseDirective, ButtonDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent } from '@coreui/angular';
import { CourseCardComponentNew } from './../course-card-novo/course-card.component';
import { EntityFormModalComponent } from '../claude-components/entity-form-modal.component';
import { COURSE_FIELDS } from '../claude-components/mooc.forms';
import { TestrStore } from '../../services/testr.store';
import { ConfirmModalService } from '../confirm-modal/confirm-modal.service';



@Component({
    selector: 'app-course-list',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ButtonDirective, CourseCardComponentNew, EntityFormModalComponent,
        CommonModule,
        MatIconModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        // CourseCardComponent,
        ButtonDirective,
        CourseListComponent,
        // CourseDetailComponent,
        ModalComponent,
        ModalHeaderComponent,
        ModalBodyComponent,
        ModalFooterComponent,
        ButtonCloseDirective
    ],
    templateUrl: './course-list.component.html',
})
export class CourseListComponent {
    protected readonly store = inject(TestrStore);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    protected readonly edit_modal_visible = signal(false);
    private fb = inject(FormBuilder);  // must be initialized first
    editForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
    });
    course_to_edit: Course | null = null;
    card_course_to_edit: CourseCardComponentNew | null = null;

    private confirm_modal = inject(ConfirmModalService);

    courses = signal<Course[]>([]);
    user: any | null = null;
    isProfessor = signal(false);
    defaultCourse: Course = Course.getDefaultCourse();


    constructor(
        private authService: AuthService,
        private courseService: CourseService,
    ) { }

    ngOnInit(): void {
        // TODO: these API calls are unnecessary are all over the place
        this.authService.profile().subscribe({
            next: (response) => {
                this.user = response;
                // TODO: these API calls are unnecessary are all over the place (also in other components)
                this.authService.userInfo().subscribe({
                    next: (userInfo: any) => {
                        this.isProfessor.set(userInfo.groups.includes('teacher'));
                        this.loadCourses();
                    }
                });
            },
        });
    }

    loadCourses() {
        this.courseService.getCourses().subscribe({
            next: (response) => {
                this.courses.set(response.results);
            },
            error: (err) => {
                console.log(err);
                notify_error("Erro ao carregar os cursos");
            },
        });
    }

    toggle_visibility(course: Course, card: CourseCardComponentNew) {
        const updated_course: Course = {
            ...course,
            visible: !course.visible,
        };
        this.save_course_update(course.url, updated_course);
    }

    open_edit_modal(course: Course, card: CourseCardComponentNew) {
        this.course_to_edit = (course);
        this.card_course_to_edit = (card);
        this.editForm.patchValue({ name: course.name });
        this.edit_modal_visible.set(true);
    }

    close_edit_modal() {
        this.course_to_edit = (null);
        this.card_course_to_edit = (null);
        this.edit_modal_visible.set(false);
    }

    save_course_update(url: string, course: Course) {
        this.courseService.updateCourse(url, course).subscribe({
            next: () => {
                this.courses.update(list => list.map(i => (i.id === course.id ? course : i)));
                notify_success("Curso atualizado.");
            },
            error: (err) => {
                console.error(err);
                notify_error("Falha ao atualizar curso.");
            },
        });
        this.close_edit_modal();
    }

    update_course() {
        if (this.course_to_edit) {
            const course: Course = {
                ...this.course_to_edit,
                name: this.editForm.getRawValue().name,
            };

            this.save_course_update(course.url, course);
        }
    }

    create_default_course(): void {
        if (this.user == null) {
            notify_error("User information not found.");
            return;
        }

        const defaultCourse: Course = { ...this.defaultCourse }
        defaultCourse.teachers.push(this.user.id);
        this.courseService.createCourse(defaultCourse).subscribe({
            next: course => {
                this.courses.update(list => [course, ...list]);
            },
            error: (err) => {
                console.log(err);
                notify_error("Falha ao criar curso.");
            }
        })
    }

    copyCourse(course: Course): void {
        this.courseService.makeACopy(course.id).subscribe({
            next: (response) => {
                this.loadCourses();
                notify_success('Cópia do curso feita com sucesso');
            },
            error: (err) => {
                console.error(err);
                notify_error('Falha ao fazer cópia do curso');
            },
        });
    }

    async delete_course(course: Course) {
        if (!(await this.confirm_modal.delete(course.name)))
            return;

        if (!course.url)
            return;

        this.courseService.deleteCourse(course.url).subscribe({
            next: () => {
                this.courses.update(list => list.filter(x => (x.id !== course.id)));
                notify_success('Curso removido');
            },
            error: (err) => {
                console.error(err);
                notify_error('Falha ao deletar curso');
            },
        });
    }
}
