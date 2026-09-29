import { signal, Component, OnInit, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    ButtonCloseDirective,
    ButtonDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective
} from '@coreui/angular';

@Component({
    selector: 'app-admin-page',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ModalComponent,
        ModalHeaderComponent,
        ModalTitleDirective,
        ButtonCloseDirective,
        ModalBodyComponent,
        ModalFooterComponent,
        ButtonDirective
    ],
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
    users = [] as any[];
    editForm: FormGroup;

    readonly userToEdit = signal<any | null>(null);
    readonly userToDelete = signal<any | null>(null);

    constructor(
        private adminService: AdminService,
        private fb: FormBuilder) {
        this.editForm = this.fb.group({
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    // Método para carregar usuários
    loadUsers(): void {
        this.adminService.getUsers().subscribe({
            next: response => {
                this.users = response.results;
            },
            error: err => {
                console.error(err);
            }
        });
    }

    openEdit(user: any): void {
        this.editForm.patchValue(user);
        this.userToEdit.set(user);
    }

    closeEdit(): void {
        this.userToEdit.set(null);
        this.editForm.reset();
    }

    onSave(): void {
        const user = this.userToEdit();
        if (!user || this.editForm.invalid) return;

        const updated = { ...user, ...this.editForm.value };
        this.adminService.editUser(user.id, updated).subscribe({
            next: () => {
                this.users = this.users.map(u => u.id === updated.id ? updated : u);
                this.closeEdit();
            },
            error: console.error
        });
    }

    confirmDelete(): void {
        const user = this.userToDelete();
        if (!user) return;

        this.adminService.deleteUser(user.id).subscribe({
            next: () => {
                this.users = this.users.filter(u => u.id !== user.id);
                this.userToDelete.set(null);
            },
            error: console.error
        });
    }
}