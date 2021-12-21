import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

declare var notyf: any;

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css']
})
export class LoginAdminComponent implements OnInit {

  loginForm: FormGroup;
  remember: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    });
    AppComponent.loadScript('assets/js/auth.js');
    AppComponent.loadScript('assets/js/components.js');
  }

  ngOnInit(): void {
  }

  login() {
    $('#login-submit').addClass('is-loading');
    this.authService.loginAdmin(this.loginForm.value).then(data => {
      if (data.result == true) {
        if (this.remember) {
          localStorage.setItem('remember', 'true');
        } else {
          localStorage.setItem('remember', 'false');
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenAdmin', data.token);
        this.router.navigate(['admin']);
        notyf.success(data.message);
      } else {
        notyf.error(data.message);
      }
      $('#login-submit').removeClass('is-loading');
    });
  }

  restore() {
    $('#restore-submit').addClass('is-loading');
    setTimeout(function () {
      $('#restore-submit').removeClass('is-loading');
      notyf.success('Correo Enviado');
    }, 1000);
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

}
