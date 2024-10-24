import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course';
import { Section } from '../models/section';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`; // URL base da API para cursos

  constructor(private http: HttpClient) { }

  createCourse(data: Course): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/`, data, { withCredentials: true });
  }

  getCourses(): Observable<{ results: Course[] }> {
    return this.http.get<{ results: Course[] }>(`${this.apiUrl}/`, { withCredentials: true });
  }

  registerStudentsCSV(body: any, course_id: number){
    return this.http.post(`${this.apiUrl}/${course_id}/register-students/`, body);
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

  getReport(course_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${course_id}/report/`, { withCredentials: true });
  }

  makeACopy(course_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${course_id}/copy/`, {}, { withCredentials: true });
  }

}
