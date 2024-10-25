import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Question } from '../models/question';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl =`${environment.apiUrl}`; // URL da API

  constructor(private http: HttpClient) { }

  // Método GET genérico para buscar dados
  getUrl(url: string){
    return this.http.get<any>(`${url}`, {withCredentials: true});
  }

  // Exemplo teste de get especifico com token
  getCourses() {
    return this.http.get<any>(this.apiUrl + '/courses/', {withCredentials: true});
  }

  getCourse(id: number) {
    return this.http.get<any>(`${this.apiUrl}/courses/${id}/`, { withCredentials: true });
  }

  getSections() {
    return this.http.get<any>(`${this.apiUrl}/sections/`, { withCredentials: true });
  }

  getSectionsByCourse(id: number) {
    return this.http.get(`${this.apiUrl}/courses/${id}/sections/`, {withCredentials: true});
  }

  getQuestion(id: number) {
    return this.http.get(`${this.apiUrl}/questions/${id}/`, { withCredentials: true });
  }

  editCourse(link: string, data: any){
    return this.http.put(link, data, { withCredentials: true});
  }

  getQuestions():  Observable<{ results: Question[] }>{
    return this.http.get<{ results: Question[] }>(`${this.apiUrl}/questions/`, { withCredentials: true });
  }

  edit(url: string, data: any){
    return this.http.put(url, data, { withCredentials: true});
  }

  post(endpoint: string, data: any){
    return this.http.post(`${this.apiUrl}/${endpoint}`, data, { withCredentials: true });
  }

  delete(url: string) {
    return this.http.delete(url, { withCredentials: true});
  }
}
