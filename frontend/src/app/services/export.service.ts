
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../.env';

@Injectable({
    providedIn: 'root'
})
export class ExportService {
    private http = inject(HttpClient);

    private readonly apiUrl = environment.apiUrl;

    downloadCourse(courseId: number): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/export/courses/${courseId}/`,
            { responseType: 'blob', withCredentials: true }
        );
    }

    downloadSection(sectionId: number): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/export/sections/${sectionId}/`,
            { responseType: 'blob', withCredentials: true }
        );
    }

    downloadQuestion(questionId: number): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/export/questions/${questionId}/`,
            { responseType: 'blob', withCredentials: true }
        );
    }
}
