import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-professor-page',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [],
    templateUrl: './professor-page.component.html',
    styleUrl: './professor-page.component.css'
})
export class ProfessorPageComponent {

}
