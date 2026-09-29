import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-student-page',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [],
    templateUrl: './student-page.component.html',
    styleUrl: './student-page.component.css'
})
export class StudentPageComponent {

}
