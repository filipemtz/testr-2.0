import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';


export const CanActivateTeacherOrStudent: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.userInfo().pipe(
    map((userInfo: any) => {
      if (userInfo.groups.includes('teacher') || userInfo.groups.includes('student')) {
        return true; 
      } else {
        router.navigate(['/forbidden']);
        return false; 
      }
    }),
    catchError((error) => {
      console.error('Error fetching user info', error);
      router.navigate(['/forbidden']);
      return of(false); 
    })
  );
};
