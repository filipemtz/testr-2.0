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

  getUrl(url: string): Observable<any> {
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });

    return this.http.get<any>(`${url}`, {headers}).pipe(
      catchError(this.handleError));
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

  getSectionsByCourse(id: number): Observable<any> {
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/courses/${id}/sections/`, { headers}).pipe(
      catchError(this.handleError));
  }

  getQuestion(id: number): Observable<any> {
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/questions/${id}/`, { headers,  withCredentials: true }).pipe(
      catchError(this.handleError));
    }

  editCourse(link: string, data: any){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${this.getCookie('token')}`
    })

    return this.http.put<any>(link, data, {headers, withCredentials: true});
  }

  getQuestions(): Observable<any> {
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/questions/`, { headers,  withCredentials: true }).pipe(
      catchError(this.handleError));
  }

  edit(url: string, data: any){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${this.getCookie('token')}`
    })

    return this.http.put<any>(url, data, {headers, withCredentials: true});
  }

  post(endpoint: string, data: any){
    const token = this.getCookie('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}/${endpoint}`, data, { headers, withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // Método PUT genérico para atualizar dados
  put<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, { headers: headers, withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  delete(url: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${this.getCookie('token')}`
    })

    return this.http.delete(url, {headers, withCredentials: true}).pipe(
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
