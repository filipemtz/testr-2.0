import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  api = 'http://localhost:8000/accounts';
 
  // static authEmitter = new EventEmitter<boolean>();

  register(body: any){
    return this.http.post(`${this.api}/register/`, body);
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
}