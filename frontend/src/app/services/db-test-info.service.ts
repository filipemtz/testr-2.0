import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DbTestInfo } from '../models/db_test_info'
import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class DbTestInfoService {
    private api_url = `${environment.apiUrl}/db_test_info`; // URL base da API para questões

    constructor(private http: HttpClient) { }

    databases(): Observable<string[]> {
        return this.http.get<string[]>(`${environment.apiUrl}/pyrelax/databases/`, { withCredentials: true });
    }

    get(question_id: number): Observable<DbTestInfo> {
        return this.http.get<DbTestInfo>(`${environment.apiUrl}/questions/${question_id}/db-test-info/`, { withCredentials: true });
    }

    post(data: DbTestInfo): Observable<DbTestInfo> {
        console.log("post:" + data);
        console.log("http:", this.http);

        return this.http.post<DbTestInfo>(`${this.api_url}/`, data, { withCredentials: true });
    }

    edit(data: DbTestInfo): Observable<DbTestInfo> {
        return this.http.put<DbTestInfo>(`${this.api_url}/${data.id}/`, data, { withCredentials: true });
    }

    delete(db_test_info_id: number): Observable<void> {
        return this.http.delete<void>(`${this.api_url}/${db_test_info_id}/`, { withCredentials: true });
    }
}
