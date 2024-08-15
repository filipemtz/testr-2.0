import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  api = `${environment.apiUrl}/accounts`;
 
  // static authEmitter = new EventEmitter<boolean>();

  register(body: any){
    return this.http.post(`${this.api}/register/`, body);
  }

  registerStudentsCSV(body: any){
    return this.http.post(`${this.api}/register-student-csv/`, body);
  }

  login(body: any){
    return this.http.post(`${this.api}/login/`, body, {withCredentials: true});
  }

  profile(){
    return this.http.get(`${this.api}/profile/` ,{withCredentials: true});
  }

  refresh(){
    return this.http.post(`${this.api}/refresh/`,{}, {withCredentials: true});
  }

  logout(){
    return this.http.post(`${this.api}/logout/`, {}, {withCredentials: true});
  }

  getGroups(){
    return this.http.get<any>(`${this.api}/groups/`, {withCredentials: true});
  }

  getGroup(id: number){
    return this.http.get<any>(`${this.api}/groups/${id}/`, {withCredentials: true});
  }

  changePassword(currentPassword: string, newPassword: string){
    return this.http.post(`${this.api}/change-password/`, { currentPassword, newPassword }, { withCredentials: true });
  }

  userInfo(){
    return this.http.get(`${this.api}/user-info/`, { withCredentials: true });
  }
}