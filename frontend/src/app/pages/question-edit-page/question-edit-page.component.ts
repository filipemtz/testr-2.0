import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-question-edit-page',
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-edit-page.component.html',
  styleUrl: './question-edit-page.component.css'
})
export class QuestionEditPageComponent implements OnInit {
  question: any;
  editForm: FormGroup;
  selectedQuestion: any;

  constructor(private authService: AuthService, 
    private apiService: ApiService, 
    private router: Router,
    private route: ActivatedRoute, 
    private fb: FormBuilder) {
      this.editForm = this.fb.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        language: ['', Validators.required],
        time_limit_seconds: ['', Validators.required],
        memory_limit: ['', Validators.required],
        cpu_limit: ['', Validators.required],
        submission_deadline: ['', Validators.required]
      });
   }

   ngOnInit(): void {
    this.authService.profile().subscribe({
      next: response => {
        this.route.params.subscribe(params => {
          const id = params['id'];
          this.apiService.getSection(id).subscribe( {next: response => {
            this.question = response;
            this.editForm.patchValue(response);
            console.log(this.question.time_limit_seconds)
          },
          error: err => {
            console.log(err);
          }});
        });
      },
      error: err => {
        this.router.navigate(['/accounts/login']);
      }
    });
  }
}
