import { Injectable } from '@angular/core';
import { RootService } from './root.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private rootService: RootService, private router: Router) { }

  login(data: any): Promise<any> {
    return this.rootService.authPost('/login', data);
  }

  loginAdmin(data: any): Promise<any> {
    return this.rootService.authPost('/login-admin', data);
  }

}
