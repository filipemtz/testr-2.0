import { Component, ElementRef, ViewChild, OnInit, TemplateRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../models/course';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import Notify from 'simple-notify'
import 'simple-notify/dist/simple-notify.css'
import {
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { notify_error, notify_success } from '../../utils/notifications';

@Component({
    selector: 'app-index-page',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        CourseCardComponent
    ],
    templateUrl: './index-page.component.html',
    styleUrls: ['./index-page.component.css'],
})

export class IndexPageComponent implements OnInit {
    // @ViewChild('courseInput') courseInput!: ElementRef;
    courses: Course[] = [];
    user: any;
    myNotify: any;
    isProfessor: boolean = false;

    defaultCourse: Course = Course.getDefaultCourse();

    constructor(
        private authService: AuthService,
        private courseService: CourseService,
        config: NgbModalConfig,
        private modalService: NgbModal,
        private fb: FormBuilder,
    ) {
        config.backdrop = 'static';
        config.keyboard = false;
    }

    ngOnInit(): void {
        this.authService.profile().subscribe({
            next: (response) => {
                this.user = response;

                this.authService.userInfo().subscribe({
                    next: (response: any) => {
                        this.isProfessor = response.groups.includes('teacher');
                    },
                });
                this.loadCourses();
            },
        });
    }

    loadCourses() {
        this.courseService.getCourses().subscribe({
            next: (response) => {
                this.courses = response.results;
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

    createDefaultCourse(userId: string): void {
        const defaultCourse: Course = { ...this.defaultCourse }
        defaultCourse.teachers.push(userId);
        this.courseService.createCourse(defaultCourse).subscribe({
            next: course => {
                this.courses.push(course);
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
                    this.modalService.dismissAll();
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
