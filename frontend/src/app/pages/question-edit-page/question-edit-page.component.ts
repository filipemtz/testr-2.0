import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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

  editForm: FormGroup;

  constructor(private authService: AuthService, private apiService: ApiService, private router: Router, 
    private fb: FormBuilder) {
      this.editForm = this.fb.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        language: ['', Validators.required]
      });
   }

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
