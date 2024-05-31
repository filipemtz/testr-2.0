import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParamsOptions } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http : HttpClient) { }

  getUsers(){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${this.getCookie('token')}`
    })

    return this.http.get<any>('http://localhost:8000/accounts/users/', {headers});
  }

  getUser(link: string){
    return this.http.get<any>(link);
  }

  editUser(link: string, data: any){
    return this.http.put<any>(link, data);
  }

  deleteUser(link: string){
    return this.http.delete<any>(link);
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}
