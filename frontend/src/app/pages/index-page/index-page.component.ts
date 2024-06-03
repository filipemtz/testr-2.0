import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.css'
})
export class IndexPageComponent implements OnInit {
  courses: Course[] = [];
  constructor(private authService: AuthService, private apiService: ApiService ,private router: Router) { }

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe({
      next: response => {
        this.apiService.getCourses().subscribe( {next: response => {
          this.courses = response.results;
        },
        error: err => {
          console.log(err);
        }});
      },
      error: err => {
        this.router.navigate(['/accounts/login']);
      }
    });
  }
}
