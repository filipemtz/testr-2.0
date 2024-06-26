import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../interfaces/course';
import { Section } from '../interfaces/section';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8000/courses'; // URL base da API para cursos

  constructor(private http: HttpClient) { }

  createCourse(data: Course): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/`, data, { withCredentials: true });
  }

  getCourses(): Observable<{ results: Course[] }> {
    return this.http.get<{ results: Course[] }>(`${this.apiUrl}/`, { withCredentials: true });
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}/`, { withCredentials: true });
  }

  getSections(id: number): Observable<{results: Section[]}> {
      return this.http.get<{results: Section[]}>(`${this.apiUrl}/${id}/sections/`, { withCredentials : true});
  }

  updateCourse(url: string, data: Course): Observable<Course> {
    return this.http.put<Course>(url, data, { withCredentials: true });
  }

  deleteCourse(url: string): Observable<void> {
    return this.http.delete<void>(url, { withCredentials: true });
  }

}
