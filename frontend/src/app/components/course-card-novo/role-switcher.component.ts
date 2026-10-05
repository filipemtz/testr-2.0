import { Component, inject } from '@angular/core';
import { ButtonDirective, ButtonGroupComponent } from '@coreui/angular';
import { MoocStore, Role } from './mooc.store';

/** Prototype helper to toggle between views. Remove it once the role comes from authentication. */
@Component({
  selector: 'app-role-switcher',
  imports: [ButtonGroupComponent, ButtonDirective],
  template: `
    <c-button-group aria-label="View as">
      @for (r of roles; track r.value) {
        <button cButton size="sm" color="primary"
                [variant]="store.role() === r.value ? undefined : 'outline'"
                [attr.aria-pressed]="store.role() === r.value"
                (click)="store.role.set(r.value)">{{ r.label }}</button>
      }
    </c-button-group>
  `,
})
export class RoleSwitcherComponent {
  protected readonly store = inject(MoocStore);
  protected readonly roles: { value: Role; label: string }[] = [
    { value: 'student', label: '🎓 Student' },
    { value: 'professor', label: '👩‍🏫 Professor' },
  ];
}
