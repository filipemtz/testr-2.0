import { signal, Component, Input, ElementRef, ViewChild, TemplateRef, HostListener, inject, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ButtonCloseDirective,
    ButtonDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective
} from '@coreui/angular';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ModalComponent,
        ModalHeaderComponent,
        ModalTitleDirective,
        ButtonCloseDirective,
        ModalBodyComponent,
        ModalFooterComponent,
        ButtonDirective
    ],
    templateUrl: './course-card.component.html',
    styleUrl: './course-card.component.css'
})
export class CourseCardComponent {

    isEditing: boolean = false;
    readonly visible = signal(false);

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

    constructor() {
    }

    toogleDeleteModal() {
        this.visible.update((value) => !value);
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
