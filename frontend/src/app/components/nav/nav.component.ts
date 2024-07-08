import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule, CommonModule, NgbDropdownModule, NgbDropdown, ReactiveFormsModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {
  authenticated = false;
  changePasswordForm: FormGroup;
  user : any = {
    username: '',
  }
  constructor(private authService: AuthService, private router: Router, private modalService: NgbModal,  private fb: FormBuilder) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });

  }
  sidebarItems = [
    {
      id: 'multi',
      label: 'Multi Level',
      icon: 'fas fa-layer-group',
      dropdown: true,
      sublinks: [
        {
          id: 'link1',
          label: 'Link 1',
          link: '/multi/link1'
        },
        {
          id: 'link2',
          label: 'Link 2',
          link: '/multi/link2'
        }
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: 'fas fa-user-tie',
      link: '/admin'
    },
    {
      id: 'student',
      label: 'Student',
      icon: 'fas fa-user-graduate',
      link: '/student'
    },
    {
      id: 'teacher',
      label: 'Teacher',
      icon: 'fas fa-user-tie',
      link: '/teacher'
    }
  ];
  ngOnInit(): void {
    this.authenticated = localStorage.getItem('authenticated') === 'true';
    if (this.authenticated){
      this.authService.profile().subscribe({
        next: (res: any) => {
          this.user = res;
        }
      });
    }
    // AuthService.authEmitter.subscribe((authenticated) => {
    //   this.authenticated = authenticated;
    //   console.log('olaaaa');
    // });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('user');
        this.authenticated = false;
        // AuthService.authEmitter.emit(false);
        this.router.navigate(['/accounts/login']);
      },
    });
  }

  openChangePasswordModal(content: TemplateRef<any>): void {
    this.modalService.open(content, { ariaLabelledBy: 'changePasswordModalLabel' });
  }
  
  changePassword(): void {
    if (this.changePasswordForm.valid) {
      const currentPassword = this.changePasswordForm.get('currentPassword')!.value;
      const newPassword = this.changePasswordForm.get('newPassword')!.value;

      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          console.log('Senha alterada com sucesso');
          this.modalService.dismissAll(); 
        }
      });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')!.value;
    const confirmPassword = form.get('confirmPassword')!.value;

    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')!.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmPassword')!.setErrors(null);
    }
  }

  resetForm(): void {
    this.changePasswordForm.reset();
  }
}