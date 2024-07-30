import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private apiUrl = `${environment.apiUrl}/submissions`; // URL base da API para submissões
  constructor(private http : HttpClient) { }

  // Método para obter uma submissão
  getSubmission(questionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/?question_id=${questionId}`);
  }

  // Método para adicionar uma submissão
  addSubmission(questionId: number, file: File, fileName: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('question', questionId.toString());
    formData.append('file', file);
    formData.append('file_name', fileName);

    return this.http.post(`${this.apiUrl}/add/`, formData);
  }
}
