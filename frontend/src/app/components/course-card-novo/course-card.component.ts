import { ChangeDetectionStrategy, Component, HostListener, inject, input, output } from '@angular/core';
import { BadgeComponent, CardBodyComponent, CardFooterComponent, CardComponent, ProgressBarComponent, ProgressComponent, ButtonDirective } from '@coreui/angular';
import { Course } from '../../models/course';
import { Role } from '../../services/testr.store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { Course, Role } from './mooc.store';
import { RouterLink } from '@angular/router';
import { ColComponent, ContainerComponent, RowComponent } from '@coreui/angular';

@Component({
    selector: 'app-course-card-new',
    imports: [
        CardComponent,
        CardBodyComponent,
        CardFooterComponent,
        BadgeComponent,
        ProgressComponent,
        ProgressBarComponent,
        ButtonDirective,
        RouterLink,
        ContainerComponent,
        RowComponent,
        ColComponent
    ],
    host: {
        // Max visible lines before the text is clipped with "…" (configurable per instance).
        '[style.--mooc-title-lines]': 'titleLines()',
        '[style.--mooc-desc-lines]': 'descLines()',
    },
    templateUrl: './course-card.component.html',
    styles: `
    :host { display: block; height: 100%; }
    .mooc-card { height: 100%; cursor: pointer; transition: transform .15s, border-color .15s; }
    .mooc-card:hover { transform: translateY(-2px); border-color: var(--cui-primary); }
    .meta { height: 1.5rem; }
    .clamp { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
    .title { line-height: 1.3; height: calc(1.3em * var(--mooc-title-lines)); -webkit-line-clamp: var(--mooc-title-lines); }
    .desc  { line-height: 1.4; height: calc(1.4em * var(--mooc-desc-lines));  -webkit-line-clamp: var(--mooc-desc-lines); }
    .title.course-hidden {
        color: var(--cui-secondary-color) !important;
        font-style: italic;
    }
  `,
})
export class CourseCardComponentNew {
    readonly course = input.required<Course>();
    readonly isProfessor = input.required<boolean>();
    readonly progress = input(0);
    readonly titleLines = input(2);
    readonly descLines = input(2);
    readonly opened = output<number>();
    copyRequested = output<Course>();
    deleteRequested = output<Course>();
    editRequested = output<{ course: Course, card: CourseCardComponentNew }>();
    toggleVisibilityRequested = output<{ course: Course, card: CourseCardComponentNew }>();

    edit(): void {
        this.editRequested.emit({ course: this.course(), card: this });
    }

    toogleCourseVisibility(): void {
        this.toggleVisibilityRequested.emit({ course: this.course(), card: this });
    }
}
