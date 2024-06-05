import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Course } from '../../interfaces/course';
import { Section } from '../../interfaces/section';
import { Question } from '../../interfaces/question';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

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
  questions: Question[] = [];
  idx: number = 1;
  cont: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.profile().subscribe( {next: resp => {
        // Pegar um curso baseado no id atual da pagina
        this.route.params.subscribe(params => {
          const id = params['id'];
          this.apiService.getCourse(id).subscribe( {next: response => {
            this.course = response;
          },
          error: err => {
            console.log(err);
          }});
        });
        // Pegar as sessões de um curso
        this.apiService.getSections().subscribe( {next: response => {
          console.log(response);  
          this.sections = response.results;
        }, 
        error: err => {
          console.log(err);
        }});

        // Pegar as questoes de uma sessão
        this.apiService.getQuestions().subscribe( {next: response => {
          console.log(response);  
          this.questions = response.results;
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

  reset_idx(){
    this.idx = 1;
  }

  inc_idx(){
    this.idx += 1;
  }

  reset_cont(){
    this.cont = 0;
  }

  inc_cont(){
    this.cont += 1;
  }
}
