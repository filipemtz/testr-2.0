import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const authToken = localStorage.getItem('token');
  
  // se o auth token não estiver armazenado ignora. 
  if( !authToken ){
    return next(req);
  }
  
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Token ${authToken}`
    }
  });

  return next(authReq).pipe(
    // Se o token expirou, redireciona o usuário para a página de login
    catchError( (error) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/accounts/login';
      }
      return throwError(error);
    })
  )
  ;
};