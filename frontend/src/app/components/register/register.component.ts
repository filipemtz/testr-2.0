import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatInputModule, MatButtonModule, MatCardModule, MatRadioModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  registerValid: boolean = true;
  errors: any[] = [];

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      password2: ['', [Validators.required]],
      group: ['Student'] // Valor padrão selecionado
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: response => {
          console.log('Product register:', response);
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => {
          console.log(err.error);
        
          if (err.error) {
            if (this.errors.length > 0) {
              this.errors = [];
            }
            for (let key in err.error) {
              if (err.error.hasOwnProperty(key)) {
                this.errors.push(err.error[key]);
              }
            }
          } else {
            this.errors.push('An unknown error occurred.');
          }
          
        }
      });
      
      console.log('Formulário enviado:', this.registerForm.value);
    }
  }
}
