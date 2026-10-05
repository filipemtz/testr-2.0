import { Component, computed, input, output } from '@angular/core';
import { BadgeComponent, ButtonDirective } from '@coreui/angular';
import { Activity } from './mooc.store';

const ICONS: Record<Activity['type'], string> = { video: '🎬', reading: '📖', quiz: '📝', assignment: '💻' };

@Component({
  selector: 'app-activity-item',
  imports: [BadgeComponent, ButtonDirective],
  template: `
    <div class="d-flex align-items-center gap-3 py-2 border-bottom">
      <span class="fs-4" aria-hidden="true">{{ icon() }}</span>
      <div class="flex-grow-1 text-truncate">
        <div class="fw-semibold text-truncate" [class.text-decoration-line-through]="done() && !editable()"
             [class.text-body-secondary]="done() && !editable()">{{ activity().title }}</div>
        <small class="text-body-secondary">{{ activity().minutes }} min</small>
        <c-badge color="info" class="ms-2 text-capitalize">{{ activity().type }}</c-badge>
      </div>
      @if (editable()) {
        <button cButton size="sm" color="primary" variant="outline" (click)="editClick.emit()">Edit</button>
        <button cButton size="sm" color="danger" variant="outline" aria-label="Delete activity" (click)="removeClick.emit()">✕</button>
      } @else {
        <input type="checkbox" class="form-check-input m-0" style="width:1.25rem;height:1.25rem"
               [checked]="done()" (change)="toggled.emit()" [attr.aria-label]="'Mark ' + activity().title + ' as complete'" />
      }
    </div>
  `,
})
export class ActivityItemComponent {
  readonly activity = input.required<Activity>();
  readonly done = input(false);
  readonly editable = input(false);
  readonly toggled = output<void>();
  readonly editClick = output<void>();
  readonly removeClick = output<void>();
  protected readonly icon = computed(() => ICONS[this.activity().type]);
}
