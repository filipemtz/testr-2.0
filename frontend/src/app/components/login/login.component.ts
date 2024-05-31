import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginValid: boolean = true;
  error: string = '';
  user = {
    username: '',
    email: '',
    groups: [] as string[]
  }

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private httpClient: HttpClient) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
        next: response => {
          this.authService.profile().subscribe({
            next: response => {
              this.user = response;
              console.log(response);
              this.router.navigate(['/']);
            },
            error: err => {
              console.error(err);
            }
          });
        },
        error: err => {
          console.error(err);
        }


      });
      // Lógica de login aqui
      console.log('Form Submitted', this.loginForm.value);

      // Redirecionar após login bem-sucedido
    }
  }
}
