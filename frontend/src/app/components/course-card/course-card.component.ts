import { Component, Input, ElementRef, ViewChild, OnInit, TemplateRef, HostListener } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Course } from '../../models/course';
import {
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-course-card',
    standalone: true,
    imports: [],
    templateUrl: './course-card.component.html',
    styleUrl: './course-card.component.css'
})
export class CourseCardComponent {

    editForm: FormGroup;
    addForm: FormGroup;
    courseToDelete: Course | null = null;
    @Input() course: Course = Course.getDefaultCourse();
    @ViewChild('courseInput') courseInput!: ElementRef;

    constructor(
        private courseService: CourseService,
        config: NgbModalConfig,
        private modalService: NgbModal,
        private fb: FormBuilder,
    ) {
        this.editForm = this.fb.group({
            name: ['', Validators.required],
        });
        this.addForm = this.fb.group({
            name: ['', Validators.required],
        });
        config.backdrop = 'static';
        config.keyboard = false;
    }

    openDeleteModal(content: TemplateRef<any>) {
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    }

    confirmDelete(): void {
        if (this.course && this.course.url) {
            this.courseService.deleteCourse(this.course.url).subscribe({
                next: () => {
                    this.pushNotify('Sucesso!', 'Curso removido.', 'success');
                    this.modalService.dismissAll();
                },
                error: (err) => {
                    console.error(err);
                    this.pushNotify('Erro!', 'Falha ao deletar curso', 'error');
                },
            });
        }
    }

    enableEdit(course: Course) {
        course.isEditing = true;
        course.originalName = course.name;
        setTimeout(() => {
            this.courseInput.nativeElement.focus();
        });
    }

    confirmEditInline(course: Course) {
        const updatedCourse = { ...course };
        this.courseService.updateCourse(course.url, updatedCourse).subscribe({
            next: () => {
                course.isEditing = false;
            },
            error: (err) => {
                console.error(err);
                this.pushNotify('Erro!', 'Falha ao atualizar curso', 'error');
            },
        });
    }

    cancelEdit(course: Course) {
        course.isEditing = false;
        course.name = course.originalName;
    }

    resetAddForm(): void {
        this.addForm.reset();
    }

    @HostListener('window:keydown', ['$event'])
    keyEventListener(event: KeyboardEvent): void {
        const editingCourse = this.courses.find(course => course.isEditing);
        if (editingCourse) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                this.cancelEdit(editingCourse);
            }
            else if (event.key === 'Enter') {
                this.confirmEditInline(editingCourse);
            }
        }
    }


    changeVisibilityCourse(course: Course): void {
        course.visible = !course.visible;
        this.courseService.updateCourse(course.url, course).subscribe({
            next: (response) => {
                this.loadCourses();
            },
            error: (err) => {
                console.error(err);
                this.pushNotify('Erro!', 'Falha ao mudar visibilidade do curso', 'error');
            },
        });
    }
}
