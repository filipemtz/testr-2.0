import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { Course } from '../../interfaces/course';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.css'
})
export class IndexPageComponent implements OnInit {
  courses: Course[] = [];

  constructor(private authService: AuthService, private apiService: ApiService ,private router: Router) { }

  ngOnInit(): void {
    // Verifica se o usuário está autenticado
    this.authService.isAuthenticated().subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/account/login']);
      } else{
        this.apiService.getCourses().subscribe((courses: Course[]) => {
            this.courses = courses;
          },
          error => {
            console.error('Erro ao buscar perguntas:', error);
          }
        );
      }
    });
  }
}
