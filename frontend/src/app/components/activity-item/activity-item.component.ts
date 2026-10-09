import { Component, computed, input, output } from '@angular/core';
import { BadgeComponent, ButtonDirective } from '@coreui/angular';
import { Question } from '../../models/question';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-activity-item',
    imports: [BadgeComponent, ButtonDirective, RouterLink],
    template: `
    <div  class="d-flex align-items-center gap-3 py-2 border-bottom">
      <span class="fs-4" aria-hidden="true">💻</span>
      <div class="flex-grow-1 text-truncate">
        <div class="fw-semibold text-truncate" tabindex="0" role="button" [routerLink]="['/question', question().id]"
             [class.text-body-secondary]="!question().visible"
             [class.fst-italic]="!question().visible"
             >{{ question().name }}
        </div>
        <small class="text-body-secondary">{{ question().submission_deadline }} min</small>
      </div>
    @if (done()) {
        <i style="font-size: 24pt" class="bi bi-balloon-fill text-success"></i>
    }
     @if (editable()) {
        <button title="edit" cButton size="sm" color="primary" variant="outline" [routerLink]="['/question', question().id, 'edit']">Edit</button>
        <button title="toggle visibility" cButton (click)="toggleVisibilityClick.emit(question())"  size="sm" color="primary" variant="outline" >
            @if (question().visible) { <i class="bi bi-eye-fill"></i> }
            @else { <i class="bi bi-eye-slash-fill"></i> }
        </button>
        <button title="move up" cButton (click)="moveUpClick.emit(question())"  size="sm" color="primary" variant="outline" ><i class="bi bi-arrow-up"></i></button>
        <button title="move down" cButton (click)="moveDownClick.emit(question())"  size="sm" color="primary" variant="outline" ><i class="bi bi-arrow-down"></i></button>
        <button title="download" cButton size="sm" color="primary" variant="outline" aria-label="Download question" (click)="downloadClick.emit(question())"><i class="bi bi-download"></i></button>
        <button title="remove" cButton size="sm" color="danger" variant="outline" aria-label="Delete question" (click)="removeClick.emit(question())">✕</button>
      }
    </div>
  `,
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
