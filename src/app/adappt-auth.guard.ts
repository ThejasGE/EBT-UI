import { Injectable } from '@angular/core';
import { AdapptAuthService } from './adappt-auth.service';
import { CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdapptAuthGuard {

  constructor(private auth: AdapptAuthService, private router: Router) { }
  canActivate(
    next: AdapptAuthGuard,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.isAuthenticated()) {
      if (state.url == '/login') {
        this.router.navigate(['commissioning']);
      } else {
        return true
      }
    } else {
      if (state.url !== '/login') {
        this.router.navigate(['login']);
      } else {
        return true
      }
    }
  }


}
