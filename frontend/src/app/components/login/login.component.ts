import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup; 
  errors: any[] = []; // Array para armazenar erros de login
  user = {
    username: '',
    email: '',
    groups: [] as string[]
  };

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private httpClient: HttpClient, private adminService: AdminService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]], 
      password: ['', [Validators.required]] 
    });
  }

  // Método para submeter o formulário de login
  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
        next: response => {
          this.user = response.user;
          this.getGroupNames();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err.error);
          this.errors = [];
          if (err.error) {
            for (let key in err.error) {
              if (err.error.hasOwnProperty(key)) {
                this.errors.push(err.error[key]); // Adiciona erros ao array de erros
              }
            }
          } else {
            this.errors.push('An unknown error occurred.'); // Adiciona mensagem de erro desconhecido
          }
        }
      });
      console.log('Form Submitted', this.loginForm.value);
    }
  }

  // Método para obter nomes dos grupos do usuário
  getGroupNames() {
    const groups = this.user.groups;
    for(let group of groups) {
      this.adminService.getGroup(group).subscribe({
        next: response => {
          this.user.groups.push(response.name); // Adiciona nome do grupo ao array de grupos
          this.redirectUser();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err.error);
          this.errors = [];
          if (err.error) {
            for (let key in err.error) {
              if (err.error.hasOwnProperty(key)) {
                this.errors.push(err.error[key]); // Adiciona erros ao array de erros
              }
            }
          } else {
            this.errors.push('An unknown error occurred.'); // Adiciona mensagem de erro desconhecido
          }
        }
      });
    }
  }

  // Método para redirecionar usuário baseado no grupo
  redirectUser() {
    const groups = this.user.groups;
    if (groups.includes('Admin')) {
      this.router.navigate(['/admin']);
    } else if (groups.includes('Professor')) {
      this.router.navigate(['/professor']);
    } else if (groups.includes('Student')) {
      this.router.navigate(['/student']);
    } else {
      this.errors.push('No valid group found for the user.'); // Adiciona mensagem de grupo inválido
    }
  }
}