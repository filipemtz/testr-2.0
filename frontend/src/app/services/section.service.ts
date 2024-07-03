import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Section } from '../interfaces/section';
import { Question } from '../interfaces/question';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private apiUrl = `${environment.apiUrl}/sections`; // URL base da API para seções

  constructor(private http: HttpClient) { }

  getSections(): Observable<{ results: Section[] }> {
    return this.http.get<{ results: Section[] }>(`${this.apiUrl}/`, { withCredentials: true });
  }

  getSection(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/${id}/`, { withCredentials: true });
  }

  getQuestions(id: number): Observable<{ results: Question[] }> {
    return this.http.get<{ results: Question[] }>(`${this.apiUrl}/${id}/questions/`);
  }

  postSection(data: Section): Observable<Section> {
    return this.http.post<Section>(`${this.apiUrl}/`, data, { withCredentials: true });
  }

  editSection(url: string, data: Section): Observable<Section> {
    return this.http.put<Section>(url, data, { withCredentials: true });
  }

  deleteSection(url: string): Observable<void> {
    return this.http.delete<void>(url, { withCredentials: true });
  }
}
