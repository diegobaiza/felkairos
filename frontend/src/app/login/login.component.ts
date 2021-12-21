import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CompaniesService } from '../services/companies.service';

declare var notyf: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  remember: boolean = true;
  apiUrl: string = environment.api;

  companyId: number = 0;
  company: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private companiesService: CompaniesService
  ) {
    this.loginForm = new FormGroup({
      company: new FormControl(null, [Validators.required]),
      username: new FormControl(localStorage.getItem('username'), [Validators.required]),
      password: new FormControl(null, [Validators.required])
    });
    if (localStorage.getItem('locked') == 'false') {
      router.navigateByUrl("/pos");
      return;
    }
    AppComponent.loadScript('assets/js/auth.js');
    AppComponent.loadScript('assets/js/components.js');
  }

  ngOnInit(): void {
    if (localStorage.getItem('companyId')) {
      this.companyId = parseInt(this.isToken(localStorage.getItem('companyId')));
      this.companiesService.getCompany(this.companyId).then(company => {
        if (company.data) {
          this.company = company.data;
          this.loginForm.controls['company'].setValue(this.company.database);
        }
      });
    }
  }

  async login() {
    $('#login-submit').addClass('is-loading');
    // document.getElementById('login-submit').classList.add('is-loading');
    let data = await this.authService.login(this.loginForm.value);
    if (data.result == true) {
      if (this.remember) {
        localStorage.setItem('remember', 'true');
      } else {
        localStorage.setItem('remember', 'false');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('locked', 'false');
      localStorage.setItem('username', this.loginForm.controls['username'].value);
      location.reload();
      notyf.success(data.message);
    } else {
      notyf.error(data.message);
    }
    $('#login-submit').removeClass('is-loading');
  }

  restore() {
    $('#restore-submit').addClass('is-loading');
    // document.getElementById('restore-submit').classList.add('is-loading');
    setTimeout(function () {
      $('#restore-submit').removeClass('is-loading');
      // document.getElementById('restore-submit').classList.remove('is-loading');
      notyf.success('Correo Enviado');
    }, 1000);
  }

  newLogin() {
    this.company = null;
    this.companyId = 0;
  }

  changeTheme() {
    if (localStorage.getItem('theme') == 'dark') {
      localStorage.removeItem('theme');
      document.body.classList.remove('is-dark');
      return;
    }
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'dark');
      document.body.classList.add('is-dark');
      return;
    }
  }

  getFakeAvatar(name: string) {
    if (name) {
      return name[0];
    } else {
      return '';
    }
  }

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

}
