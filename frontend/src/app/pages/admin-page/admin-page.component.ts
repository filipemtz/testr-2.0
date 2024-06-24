import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  users = [] as any[];
  editForm: FormGroup;
  selectedUser: any;
  userToDelete: any;

  constructor(private adminService: AdminService, private fb: FormBuilder, private modalService: NgbModal) {
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

  // Método para abrir o modal de deleção
  openDeleteModal(user: any, content: TemplateRef<any>) {
    this.userToDelete = user;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  // Método para abrir o modal de edição e preencher o formulário com os dados do usuário
  onEdit(user: any, content: TemplateRef<any>): void {
    this.selectedUser = user;
    this.editForm.patchValue(user);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  // Método para salvar as alterações do usuário
  onSave(): void {
    if (this.editForm.valid) {
      const updatedUser = { ...this.selectedUser, ...this.editForm.value };

      this.adminService.editUser(this.selectedUser.id, updatedUser).subscribe({
        next: () => {
          this.resetForm();
          this.users = this.users.map(user => user.id === updatedUser.id ? updatedUser : user);
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  // Método para confirmar a deleção do usuário
  confirmDelete(): void {
    console.log(this.userToDelete);
    this.adminService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== this.userToDelete.id);
        this.modalService.dismissAll();
      },
      error: err => {
        console.error(err);
      }
    });
  }

  // Método para resetar o formulário e limpar o usuário selecionado
  resetForm(): void {
    this.selectedUser = null;
    this.editForm.reset();
    this.modalService.dismissAll();
  }
}