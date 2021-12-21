import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardLoginService implements CanActivate {

  constructor(
    private router: Router
  ) { }

  canActivate(): boolean {
    if (!this.isAuthenticated()) {
      return true;
    }
    if (this.router.url == '/') {
      this.router.navigate(['admin']);
    }
    return false;
  }

  isAuthenticated(): boolean {
    if (localStorage.getItem('token')) {
      return true;
    } else {
      return false;
    }
  }

}
