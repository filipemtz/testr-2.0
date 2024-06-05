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
  errors: any[] = []; // Array para armazenar mensagens de erro

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    // Inicializa o formulário de registro com validações
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required]],
      password2: ['', [Validators.required]], 
      group: ['Student'] 
    });
  }

  // Método para submeter o formulário de registro
  onRegister() {
    if (this.registerForm.valid) { 
      // Chama o serviço de registro passando os valores do formulário
      this.authService.register(this.registerForm.value).subscribe({
        next: response => {
          this.router.navigate(['/']); // Redireciona para a página inicial em caso de sucesso
        },
        error: (err: HttpErrorResponse) => {
          console.error(err.error);

          if (err.error) {
            if (this.errors.length > 0) {
              this.errors = []; // Limpa o array de erros antes de adicionar novos
            }
            // Adiciona as mensagens de erro ao array de erros
            for (let key in err.error) {
              if (err.error.hasOwnProperty(key)) {
                this.errors.push(err.error[key]);
              }
            }
          } else {
            this.errors.push('An unknown error occurred.'); // Adiciona uma mensagem de erro desconhecido
          }
        }
      });

      console.log('Formulário enviado:', this.registerForm.value); // Exibe os valores do formulário no console
    }
  }
}