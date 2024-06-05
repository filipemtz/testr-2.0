import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = 'http://localhost:8000/'; 

  constructor(private httpClient: HttpClient) { }

  // Método para login do usuário
  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' 
    });
    const body = { username, password }; // Corpo da requisição contendo as credenciais do usuário
    return this.httpClient.post<any>(`${this.baseUrl}accounts/login/`, body, { headers, withCredentials: true }).pipe(
      tap(response => {
        // Salvar o usuário retornado na resposta em local storage
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  // Método para logout do usuário
  logout(): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}accounts/logout/`,{}, {withCredentials: true});
  }

  // Método para registrar um novo usuário
  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<any>(`${this.baseUrl}accounts/register/`, userData, { headers, withCredentials: true});
  }

  // Método para obter o perfil do usuário
  profile(): Observable<any> {
    // Obtém o token de autenticação dos cookies
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', 
      'Authorization': `Token ${token}` 
    });
    return this.httpClient.get<any>(`${this.baseUrl}accounts/profile/`, { headers, withCredentials: true});
  }

  // Função auxiliar para obter um cookie específico pelo nome
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}