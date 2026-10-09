import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { CourseListComponent } from '../../components/course-card-list/course-list.component';


import {
    ButtonDirective,
} from '@coreui/angular';

import {
    ReactiveFormsModule,
    FormsModule,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-index-page',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        CourseCardComponent,
        ButtonDirective,
        CourseListComponent
    ],
    templateUrl: './index-page.component.html',
    styleUrls: ['./index-page.component.css'],
})

export class IndexPageComponent {
}
