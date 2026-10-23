import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseListComponent } from '../../components/course-card-list/course-list.component';


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
        CourseListComponent
    ],
    templateUrl: './index-page.component.html',
    styleUrls: ['./index-page.component.css'],
})

export class IndexPageComponent {
}
