import { Component, input, output } from '@angular/core';
import { ButtonDirective } from '@coreui/angular';
import { Question } from '../../models/question';
import { RouterLink } from '@angular/router';
import { DateFormatPipe } from '../../utils/date-format.pipe';

@Component({
    selector: 'app-activity-item',
    imports: [ButtonDirective, RouterLink, DateFormatPipe],
    templateUrl: 'activity-item.component.html',
})
export class ActivityItemComponent {
    readonly question = input.required<Question>();
    readonly done = input(false);
    readonly editable = input(false);
    readonly removeClick = output<Question>();
    readonly moveUpClick = output<Question>();
    readonly moveDownClick = output<Question>();
    readonly toggleVisibilityClick = output<Question>();
    readonly downloadClick = output<Question>();
}
