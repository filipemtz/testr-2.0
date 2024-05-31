import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apiService: ApiService) { }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const body = { username, password };
    return this.apiService.post<any>('accounts/login/', body, headers);
  }

  logout(): Observable<any> {
    // Implemente a lógica de logout aqui, se necessário
    return this.apiService.post<any>('accounts/logout/', {});
  }

  register(userData: any): Observable<any> {
    // Aqui userData é um objeto que contém os dados de registro do usuário
    // Você pode ajustar os dados conforme necessário
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.apiService.post<any>('accounts/register/', userData, headers);
  }

  profile(): Observable<any> {
    // from cookies get token
    const token = this.getCookie('token');
    console.log('Token:', token);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });

    return this.apiService.get<any>('accounts/profile/', headers);
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}
