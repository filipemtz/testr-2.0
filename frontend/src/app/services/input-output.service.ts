import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InputOutput } from '../interfaces/input-output'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InputOutputService {
  private apiUrl = `${environment.apiUrl}/inputs_outputs`; // URL base da API para questões

  constructor(private http: HttpClient) { }

  getInputsAndOutputs(): Observable<{ results: InputOutput[] }> {
    return this.http.get<{ results: InputOutput[] }>(`${this.apiUrl}/`, { withCredentials: true });
  }

  getInputOutput(id: number): Observable<InputOutput> {
    return this.http.get<InputOutput>(`${this.apiUrl}/${id}/`, { withCredentials: true });
  }

  postInputOutput(data: InputOutput): Observable<InputOutput> {
    return this.http.post<InputOutput>(`${this.apiUrl}/`, data, { withCredentials: true });
  }

  editInputOutput(url: string, data: InputOutput): Observable<InputOutput> {
    return this.http.put<InputOutput>(url, data, { withCredentials: true });
  }

  deleteInputOutput(url: string): Observable<void> {
    return this.http.delete<void>(url, { withCredentials: true });
  }
}
