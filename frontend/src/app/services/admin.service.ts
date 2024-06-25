import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParamsOptions } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  api = 'http://localhost:8000/accounts/users';
  constructor(private http : HttpClient) { }

  getUsers(){
    return this.http.get<any>(`${this.api}/`, {withCredentials: true});
  }

  getUser(link: string){
    return this.http.get<any>(link, {withCredentials: true});
  }

  editUser(id: number, data: any){
    return this.http.put<any>(`${this.api}/${id}/`, data, {withCredentials: true});
  }

  deleteUser(id : number){
    return this.http.delete<any>(`${this.api}/${id}/`, {withCredentials: true});
  }
}
