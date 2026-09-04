import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RelaxTestInfo } from '../models/relax_test_info'
import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class RelaxTestInfoService {
    private api_url = `${environment.apiUrl}/relax_test_info`; // URL base da API para questões

    constructor(private http: HttpClient) { }

    databases(): Observable<string[]> {
        return this.http.get<string[]>(`${environment.apiUrl}/pyrelax/databases/`, { withCredentials: true });
    }

    get(question_id: number): Observable<RelaxTestInfo> {
        return this.http.get<RelaxTestInfo>(`${environment.apiUrl}/questions/${question_id}/relax-test-info/`, { withCredentials: true });
    }

    post(data: RelaxTestInfo): Observable<RelaxTestInfo> {
        console.log("post:" + data);
        console.log("http:", this.http);

        return this.http.post<RelaxTestInfo>(`${this.api_url}/`, data, { withCredentials: true });
    }

    edit(data: RelaxTestInfo): Observable<RelaxTestInfo> {
        return this.http.put<RelaxTestInfo>(`${this.api_url}/${data.id}/`, data, { withCredentials: true });
    }

    delete(relax_test_info_id: number): Observable<void> {
        return this.http.delete<void>(`${this.api_url}/${relax_test_info_id}/`, { withCredentials: true });
    }
}
