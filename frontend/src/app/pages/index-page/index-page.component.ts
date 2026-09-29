import { signal, Component, ElementRef, ViewChild, OnInit, TemplateRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../models/course';
import { CourseCardComponent } from '../../components/course-card/course-card.component';

import {
    ButtonDirective,
} from '@coreui/angular';

import {
    ReactiveFormsModule,
    FormsModule,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { notify_error, notify_success } from '../../utils/notifications';

@Component({
    selector: 'app-index-page',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        CourseCardComponent,
        ButtonDirective
    ],
    templateUrl: './index-page.component.html',
    styleUrls: ['./index-page.component.css'],
})

export class IndexPageComponent implements OnInit {
    // @ViewChild('courseInput') courseInput!: ElementRef;
    courses: Course[] = [];
    user: any | null = null;
    myNotify: any;
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
        console.log("load courses called.");
        this.courseService.getCourses().subscribe({
            next: (response) => {
                this.courses = response.results;
                console.log(this.courses);
            },
            error: (err) => {
                console.log(err);
                this.myNotify = notify_error('Erro ao carregar os cursos');
            },
        });
    }

    editCourse(course: Course, card: CourseCardComponent) {
        this.courseService.updateCourse(course.url, course).subscribe({
            next: () => {
                card.isEditing = false;
                card.course = course;
                notify_success("Curso atualizado.");
            },
            error: (err) => {
                console.error(err);
                notify_error("Falha ao atualizar curso.");
            },
        });
    }

    createDefaultCourse(): void {
        if (this.user == null) {
            notify_error("User information not found.");
            return;
        }

        console.log("called createDefaultCourse");
        console.log(this.user);
        const defaultCourse: Course = { ...this.defaultCourse }
        defaultCourse.teachers.push(this.user.id);
        this.courseService.createCourse(defaultCourse).subscribe({
            next: course => {
                this.courses.push(course);
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
                this.myNotify = notify_success('Cópia do curso feita com sucesso');
            },
            error: (err) => {
                console.error(err);
                this.myNotify = notify_error('Falha ao fazer cópia do curso');
            },
        });
    }

    deleteCourse(course: Course) {
        if (course && course.url) {
            this.courseService.deleteCourse(course.url).subscribe({
                next: () => {
                    this.courses = this.courses.filter(x => x.id !== course.id);
                    notify_success('Curso removido');
                },
                error: (err) => {
                    console.error(err);
                    notify_error('Falha ao deletar curso');
                },
            });
        }
    }

    close() {
        this.myNotify.close()
    }
}
