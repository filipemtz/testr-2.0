import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-question-detail-page',
  standalone: true,
  imports: [],
  templateUrl: './question-detail-page.component.html',
  styleUrl: './question-detail-page.component.css'
})
export class QuestionDetailPageComponent {

  constructor(private authService: AuthService, private router: Router, ){}

  ngOnInit(): void {
    this.authService.profile().subscribe({
      next: response => {
      },
      error: err => {
        this.router.navigate(['/accounts/login']);
      }
    });
  }
}
