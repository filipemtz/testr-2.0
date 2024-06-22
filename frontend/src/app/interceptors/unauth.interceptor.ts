import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, switchMap, tap, throwError } from 'rxjs';

export const unauthErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('token');

  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse &&
        !(req.url.includes('login') || req.url.includes('refresh')) && // <- this will avoid an infinite loop when the accessToken expires.
        error.status === 401) {
          return authService.refresh().pipe(
            switchMap((res: any) => {
              console.log(res);
              localStorage.setItem('token', res.token);
              return next(req.clone({
                headers: req.headers.set('Authorization', `Bearer ${res.token}`),
              }));
            }),
            catchError((error) => {
              console.log('error')
              if (error.status == '403' || error.status === '401') {
                authService.logout();
              }
              return throwError(() => error);
            })
          );
      }
      authService.logout();
      return throwError(() => new Error('Unauthorized Exception'));
    })
  );
};