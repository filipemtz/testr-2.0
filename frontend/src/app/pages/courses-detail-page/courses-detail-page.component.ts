import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';
import { Section } from '../../interfaces/section';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-courses-detail-page',
  standalone: true,
  imports: [ CommonModule, RouterModule],
  templateUrl: './courses-detail-page.component.html',
  styleUrls: ['./courses-detail-page.component.css']
})
export class CoursesDetailPageComponent implements OnInit {
  course: Course = {} as Course;
  sections: Section[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe( {next: resp => {
        this.route.params.subscribe(params => {
          const id = params['id'];
          this.apiService.getCourse(id).subscribe( {next: response => {
            this.course = response;
          },
          error: err => {
            console.log(err);
          }});
        });
        this.apiService.getSections().subscribe( {next: response => {
          console.log(response);  
          this.sections = response.results;
        }});
      },
      error: err => {
        this.router.navigate(['/accounts/login']);
      }
    });
  }

}
