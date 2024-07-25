import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleError } from '../../utils/handleError';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, MatIconModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: '',
      password: ''
    });
  }

  submit(){
     this.authService.login(this.form.getRawValue()).subscribe({
      next: (res : any) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        localStorage.setItem('authenticated', 'true');
      
        if (res.user.is_superuser) {
          this.router.navigate(['/admin']);
        }
        else{
          this.getUserGroups(res.user.groups).subscribe(groups => {
            this.redirectTo(groups);
          });
        }
      },
      error: (error: any) => {
        handleError(error);
      }
    });
  }

  getUserGroups(groups: any[]) {
    if (!groups.length) {
      return of([]); // Return an observable of an empty array if no groups
    }
  
    const groupObservables = groups.map(groupId => 
      this.authService.getGroup(groupId).pipe(
        catchError(error => {
          console.error('Error fetching group', groupId, error);
          return of(null); // In case of error, return null or a default value
        })
      )
    );
  
    return forkJoin(groupObservables).pipe(
      map(results => 
        results
          .filter(group => group !== null) // Filter out any null results due to errors
          .map(group => group.name) // Assuming the group object has a 'name' property
      )
    );
  }

  redirectTo(groups: any[]) {
    // if (groups.includes('student')) {
    //   //this.router.navigate(['/student']);
    
    // } else if (groups.includes('teacher')) {
    //   // this.router.navigate(['/teacher']);
   
    // } else{
    //   this.router.navigate(['/']);
    // }
    this.router.navigate(['/']);
  }

  
}