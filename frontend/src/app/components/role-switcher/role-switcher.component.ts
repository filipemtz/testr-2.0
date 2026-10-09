import { Component, inject } from '@angular/core';
import { ButtonDirective, ButtonGroupComponent } from '@coreui/angular';
import { TestrStore, Role } from '../../services/testr.store';

/** Prototype helper to toggle between views. Remove it once the role comes from authentication. */
@Component({
    selector: 'app-role-switcher',
    imports: [ButtonGroupComponent, ButtonDirective],
    template: `
    <c-button-group aria-label="View as">
      @for (r of view_modes; track r.value) {
        <button cButton size="sm" color="primary"
                [variant]="store.view_mode() === r.value ? undefined : 'outline'"
                [attr.aria-pressed]="store.view_mode() === r.value"
                (click)="store.view_mode.set(r.value)">{{ r.label }}</button>
      }
    </c-button-group>
  `,
})
export class RoleSwitcherComponent {
    protected readonly store = inject(TestrStore);
    protected readonly view_modes: { value: Role; label: string }[] = [
        { value: 'student', label: '🎓 Student' },
        { value: 'professor', label: '👩‍🏫 Professor' },
    ];
}
