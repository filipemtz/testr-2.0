import { Component, inject } from '@angular/core';
import { ButtonDirective, ButtonGroupComponent } from '@coreui/angular';
import { TestrStore, Role } from '../../services/testr.store';

/** Prototype helper to toggle between views. Remove it once the role comes from authentication. */
@Component({
    selector: 'app-role-switcher',
    imports: [ButtonGroupComponent, ButtonDirective],
    templateUrl: 'role-switcher.component.html',
})
export class RoleSwitcherComponent {
    protected readonly store = inject(TestrStore);
    protected readonly view_modes: { value: Role; label: string }[] = [
        { value: 'student', label: '🎓 Student' },
        { value: 'professor', label: '👩‍🏫 Professor' },
    ];
}
