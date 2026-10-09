import { computed, Injectable, signal } from '@angular/core';

export type Role = 'student' | 'professor';

const uid = () => crypto.randomUUID().slice(0, 8);

@Injectable({ providedIn: 'root' })
export class TestrStore {
    /** Prototype only: in the real site derive the role from your auth/session. */
    readonly role = signal<Role>('student');
    readonly view_mode = signal<Role>('student');
    readonly isProfessor = computed(() => this.role() === 'professor');
    readonly viewAsProfessor = computed(() => this.view_mode() === 'professor');

    setProfessorRole() {
        this.role.set('professor');
        this.view_mode.set('professor');
    }

    setStudentRole() {
        this.role.set('student');
        this.view_mode.set('student');
    }
}
