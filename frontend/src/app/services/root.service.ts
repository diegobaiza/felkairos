import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class RootService {

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private alertService: AlertService
  ) {
  }

  dataUser: any;

  url = environment.api;

  async get(path: string) {
    let data: any = this.httpClient.get(this.url + path, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.isToken(localStorage.getItem('token'))
      }
    }).toPromise();
    this.verify(data);
    return data;
  }

  getAdmin(path: string) {
    let data: any = this.httpClient.get(this.url + path, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.isToken(localStorage.getItem('tokenAdmin'))
      }
    }).toPromise();
    this.verify(data);
    return data;
  }

  post(path: string, body: any) {
    let data: any = this.httpClient.post(this.url + path, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.isToken(localStorage.getItem('token'))
      }
    }).toPromise();
    this.verify(data);
    return data;
  }

  postAdmin(path: string, body: any) {
    let data: any = this.httpClient.post(this.url + path, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.isToken(localStorage.getItem('tokenAdmin'))
      }
    }).toPromise();
    this.verify(data);
    return data;
  }

  getDigifact(path: string, token: any) {
    let data: any = this.httpClient.get(this.url + path, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    }).toPromise();
    this.verify(data);
    return data;
  }

  postDigifact(path: string, body: any) {
    return this.httpClient.post(this.url + path, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  postDigifactXml(path: string, body: any, token: any) {
    let data: any = this.httpClient.post(this.url + path, body, {
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': token
      }
    }).toPromise();
    return data;
  }

  put(path: string, body: any) {
    let data: any = this.httpClient.put(this.url + path, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.isToken(localStorage.getItem('token'))
      }
    }).toPromise();
    this.verify(data);
    return data;
  }

  delete(path: string) {
    let data: any = this.httpClient.delete(this.url + path, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.isToken(localStorage.getItem('token'))
      }
    }).toPromise();
    this.verify(data);
    return data;
  }

  authPost(path: string, body: any) {
    let data: any = this.httpClient.post(this.url + path, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.isToken(localStorage.getItem('token'))
      }
    }).toPromise();
    return data;
  }

  postFile(path: string, body: any) {
    let data: any = this.httpClient.post(this.url + path, body, {
      headers: {
        'Authorization': this.isToken(localStorage.getItem('token'))
      }
    }).toPromise();
    return data;
  }

  deleteFile(path: string) {
    let data: any = this.httpClient.delete(this.url + path, {
      headers: {
        'Authorization': this.isToken(localStorage.getItem('token'))
      }
    }).toPromise();
    return data;
  }

  async verify(data: any) {
    await data.then((res: any) => {
      if (res.code == 0) {
        this.alertService.alertSequelize('Sesión Cerrada', 'Token Expirado', 'info');
        this.clear();
        this.router.navigate(['login']);
      }
      if (res.message && res.message.name == 'SequelizeForeignKeyConstraintError') {
        this.alertService.alertSequelize('ForeignKeyConstraintError', res.message.original.sqlMessage, 'error');
      }
    });
  }

  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('remember');
    localStorage.removeItem('companyId');
    localStorage.removeItem('username');
    localStorage.removeItem('locked');
  }

  clearAdmin() {
    localStorage.removeItem('tokenAdmin');
    localStorage.removeItem('remember');
    localStorage.removeItem('companyId');
    localStorage.removeItem('username');
    localStorage.removeItem('locked');
  }

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

}
