import { Component, OnInit, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
    email: ['', [Validators.required, Validators.email]],
    groups: ['', Validators.required]
  });
  selectedUser: any;
  userToDelete: any;

  constructor(private adminService: AdminService, private fb: FormBuilder, private modalService: NgbModal, private http: HttpClient) {}

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
      const token = this.getCookie('token');

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      });
      
      this.http.put(updatedUser.url, updatedUser, { headers }).subscribe({
        next: response => {
          console.log(response);
          this.modalService.dismissAll();
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  confirmDelete(modal: any): void {
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });

    this.http.delete(this.userToDelete.url, { headers }).subscribe({
      next: response => {
        console.log(response);
        this.users = this.users.filter(u => u !== this.userToDelete);
        modal.close();
      },
      error: err => {
        console.error(err);
      }
    });
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}
