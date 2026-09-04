import { Component, ElementRef, ViewChild, OnInit, TemplateRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../models/course';
import Notify from 'simple-notify'
import 'simple-notify/dist/simple-notify.css'
import {
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-index-page',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './index-page.component.html',
    styleUrls: ['./index-page.component.css'],
})

export class IndexPageComponent implements OnInit {
    @ViewChild('courseInput') courseInput!: ElementRef;

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
                this.pushNotify('Erro!', 'Erro ao carregar os cursos', 'error');
            },
        });
    }

    pushNotify(title: string, text: string | undefined, status: any) {
        this.myNotify = new Notify({
            status: status,
            title: title,
            text: text,
            effect: 'slide',
            type: 'filled'
        })
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

    makeACopy(course: Course): void {
        this.courseService.makeACopy(course.id).subscribe({
            next: (response) => {
                this.pushNotify('Sucesso!', 'Cópia do curso feita com sucesso', 'success');
                this.loadCourses();
            },
            error: (err) => {
                console.error(err);
                this.pushNotify('Erro!', 'Falha ao fazer cópia do curso', 'error');
            },
        });
    }

    close() {
        this.myNotify.close()
    }
}
