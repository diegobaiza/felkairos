import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router
  ) { }

  canActivate(): boolean {
    if (!this.isAuthenticated()) {
      this.logout();
      return false;
    }
    return true;
  }

  isAuthenticated(): boolean {
    try {
      if (localStorage.getItem('token')) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('remember');
    localStorage.removeItem('companyId');
    this.router.navigateByUrl('login', { skipLocationChange: true });
  }

}
