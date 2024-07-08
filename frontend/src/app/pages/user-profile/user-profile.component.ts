
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit{
  user: any = {
    id: '',
    username: '',
    email: '',
  }
  activeTab = 'profile';
  editForm: FormGroup;
  changePasswordForm: FormGroup;
  editMode: boolean = false;
  constructor(private adminService: AdminService, private authService: AuthService, private router: Router, private formBuilder: FormBuilder) {
    this.editForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });



    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }
  ngOnInit(): void {
    this.authService.profile().subscribe({
      next: (response) => {
        this.user = response;
        this.editForm.patchValue(this.user);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  editProfile(): void {
    this.adminService.editUser(this.user.id, this.editForm.getRawValue()).subscribe({
      next: (response) => {
        console.log(response);
      },
    });
  }

  changePassword(): void {
    if (this.changePasswordForm.valid) {
      const currentPassword = this.changePasswordForm.get('currentPassword')!.value;
      const newPassword = this.changePasswordForm.get('newPassword')!.value;

      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          console.log('Senha alterada com sucesso');
        }
      });
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
    this.changePasswordForm.markAsUntouched();
    this.editForm.reset();
    this.editForm.markAsUntouched();
    this.editForm.patchValue(this.user);
  }
  
  
}
