import { Component, Input, ElementRef, ViewChild, OnInit, TemplateRef, HostListener, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Course } from '../../models/course';
import { Router, RouterModule } from '@angular/router';
import {
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { notify_error, notify_success } from '../../utils/notifications';

@Component({
    selector: 'app-course-card',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    templateUrl: './course-card.component.html',
    styleUrl: './course-card.component.css'
})
export class CourseCardComponent {
    isEditing: boolean = false;
    @Input() isProfessor: boolean = false;
    @Input() course: Course = Course.getDefaultCourse();
    @Output() editRequested = new EventEmitter<Course>();
    @Output() deleteRequested = new EventEmitter<Course>();
    @Output() copyRequested = new EventEmitter<Course>();
    @ViewChild('courseInput') courseInput!: ElementRef;
    private fb = inject(FormBuilder);  // initialized first
    editForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
    });

    constructor(
        private courseService: CourseService,
        config: NgbModalConfig,
        private modalService: NgbModal,
    ) {
        config.backdrop = 'static';
        config.keyboard = false;
    }

    openDeleteModal(content: TemplateRef<any>) {
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    }

    // confirmDelete(): void {
    //     this.deleteRequested.emit(this.course);
    // }

    enableEdit() {
        this.isEditing = true;
        //course.originalName = course.name;
        this.editForm.patchValue({
            name: this.course.name,
        });
        setTimeout(() => {
            this.courseInput.nativeElement.focus();
        });
    }

    confirmEditInline() {
        const updatedCourse = {
            ...this.course,
            name: this.editForm.getRawValue().name,
        };
        console.log(updatedCourse);
        this.courseService.updateCourse(this.course.url, updatedCourse).subscribe({
            next: () => {
                this.isEditing = false;
                this.course.name = updatedCourse.name;
                notify_success("Curso atualizado.");
            },
            error: (err) => {
                console.error(err);
                notify_error("Falha ao atualizar curso.");
            },
        });
    }

    cancelEdit() {
        this.isEditing = false;
        // course.name = course.originalName;
    }

    @HostListener('window:keydown', ['$event'])
    keyEventListener(event: KeyboardEvent): void {
        //const editingCourse = this.courses.find(course => course.isEditing);
        if (this.isEditing) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                this.cancelEdit();
            }
            else if (event.key === 'Enter') {
                this.confirmEditInline();
            }
        }
    }

    changeVisibilityCourse(course: Course): void {
        course.visible = !course.visible;
        this.courseService.updateCourse(course.url, course).subscribe({
            next: (response) => {
                //this.loadCourses();
                notify_success('Visibilidade atualizada');
            },
            error: (err) => {
                console.error(err);
                notify_error('Falha ao mudar visibilidade do curso');
            },
        });
    }
}
