import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  users = [] as any[];
  closeResult = '';
  editForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });
  selectedUser: any;
  userToDelete: any;

  constructor(private adminService: AdminService, private fb: FormBuilder, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next: response => {
        this.users = response.results;
        console.log(this.users);
      },
      error: err => {
        console.error(err);
      }
    });
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    );
  }

  openDeleteModal(user: any, content: TemplateRef<any>) {
    this.userToDelete = user;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  onEdit(user: any, content: any): void {
    this.selectedUser = user;
    this.editForm.patchValue(user);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  onSave(modal: any): void {
    if (this.editForm.valid) {
      const updatedUser = { ...this.selectedUser, ...this.editForm.value };
      
      this.adminService.editUser(this.selectedUser.url, updatedUser).subscribe({
        next: response => {
          console.log(response);
          this.selectedUser = null;
          this.editForm.reset();
          this.modalService.dismissAll();
          this.users = this.users.map(user => user.url === updatedUser.url ? updatedUser : user);
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  confirmDelete(modal: any): void {
    this.adminService.deleteUser(this.userToDelete.url).subscribe({
      next: response => {
        console.log(response);
        this.users = this.users.filter(user => user.url !== this.userToDelete.url);
        this.modalService.dismissAll();
      },
      error: err => {
        console.error(err);
      }
    });
  }
}
