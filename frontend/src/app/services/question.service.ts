import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../interfaces/question';
import { InputOutput } from '../interfaces/input-output';
import { environment } from '../../environments/environment';
import { QuestionFile } from '../interfaces/question-file';
@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiUrl}/questions`; // URL base da API para questões

  constructor(private http: HttpClient) { }

  getQuestions(): Observable<{ results: Question[] }> {
    return this.http.get<{ results: Question[] }>(`${this.apiUrl}/`, { withCredentials: true });
  }

  getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${id}/`, { withCredentials: true });
  }

  getInputsOutputs(id: number): Observable<{ results: InputOutput[] }> {
    return this.http.get<{ results: InputOutput[] }>(`${this.apiUrl}/${id}/inputs_outputs/`, { withCredentials: true });
  }

  postQuestion(data: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/`, data, { withCredentials: true });
  }

  editQuestion(url: string, data: Question): Observable<Question> {
    return this.http.put<Question>(url, data, { withCredentials: true });
  }

  deleteQuestion(url: string): Observable<void> {
    return this.http.delete<void>(url, { withCredentials: true });
  }

  getQuestionFiles(id: number): Observable<QuestionFile[]> {
    return this.http.get<QuestionFile[]>(`${this.apiUrl}/${id}/files/`);
  }
}
