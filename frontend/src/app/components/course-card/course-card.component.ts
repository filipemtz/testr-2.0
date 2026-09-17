import { Component, Input, ElementRef, ViewChild, TemplateRef, HostListener, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Course } from '../../models/course';
import { RouterModule } from '@angular/router';
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
    @Output() editRequested = new EventEmitter<{ course: Course, card: CourseCardComponent }>();
    @Output() deleteRequested = new EventEmitter<Course>();
    @Output() copyRequested = new EventEmitter<Course>();
    @ViewChild('courseInput') courseInput!: ElementRef;

    private fb = inject(FormBuilder);  // must be initialized first
    editForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
    });


    constructor(
        config: NgbModalConfig,
        private modalService: NgbModal,
    ) {
        config.backdrop = 'static';
        config.keyboard = false;
    }


    openDeleteModal(content: TemplateRef<any>) {
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    }


    enableEdit() {
        this.editForm.patchValue({ name: this.course.name });
        setTimeout(() => { this.courseInput.nativeElement.focus() });
        this.isEditing = true;
    }


    confirmEditInline() {
        this.editRequested.emit({
            course: {
                ...this.course,
                name: this.editForm.getRawValue().name,
            },
            card: this
        });
    }


    @HostListener('window:keydown', ['$event'])
    keyEventListener(event: KeyboardEvent): void {
        if (this.isEditing) {
            if (event.key === 'Escape' || event.key === 'Esc') this.isEditing = false;
            else if (event.key === 'Enter') this.confirmEditInline();
        }
    }


    changeVisibilityCourse(course: Course): void {
        course.visible = !course.visible;
        this.editRequested.emit({ course: course, card: this });
    }
}
