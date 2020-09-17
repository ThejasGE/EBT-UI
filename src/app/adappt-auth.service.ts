import { Injectable } from '@angular/core';
import { CookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AdapptAuthService {

  constructor( private cookieService: CookieService) { }

  saveSession(data) {
    let OrDate = new Date();
    OrDate.setHours(OrDate.getHours()+5);
    this.cookieService.set('auth_token', data.myToken,OrDate );
    this.cookieService.set('user', data.username);
    this.cookieService.set('name', data.name);
    this.cookieService.set('admin', data.isAdmin);
    this.cookieService.set('active', data.isActive)
  }
  deleteSession() {
    this.cookieService.delete('auth_token');
    this.cookieService.delete('user');
    this.cookieService.delete('admin');
    this.cookieService.delete('active');
    this.cookieService.delete('name');
  }
  getSession(): any {
    return this.cookieService.get('user');
  }
  getName(): any {
    return this.cookieService.get('name');
  }
  getAdminD(): any {
    return this.cookieService.get('admin');
  }
  getActiveD(): any {
    return this.cookieService.get('active');
  }
  getToken(): any {
    return this.cookieService.get('auth_token');
  }
  isAuthenticated(): Boolean {
    const token = this.cookieService.get('auth_token');
    return token !== null && token.length ? true : false;
  }
}
