import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8000'; // URL da API

  constructor(private http: HttpClient) { }

  // Método GET genérico para buscar dados
  get<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { headers: headers, withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Exemplo teste de get especifico com token
  getCourses(): Observable<any> {
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });

    return this.http.get<any>(this.apiUrl + '/courses/', {headers, withCredentials: true}).pipe(
      catchError(this.handleError));
  }

  // método para buscar uma pergunta específica com autenticação por sessão
  getCourse(id: number): Observable<any> {
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/courses/${id}/`, { headers, withCredentials: true });
  }

  getSections(): Observable<any> {
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/sections/`, { headers,  withCredentials: true }).pipe(
      catchError(this.handleError));
  }

  // Método POST genérico para enviar dados
  post<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, { headers: headers, withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Método PUT genérico para atualizar dados
  put<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, { headers: headers, withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Método DELETE genérico para excluir dados
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, { headers: headers, withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Manipulação de erros : Todo: Desenvolver um tratamento de erro mais robusto
  private handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}
