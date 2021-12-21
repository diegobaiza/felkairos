import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { environment } from 'src/environments/environment';
import { PosComponent } from '../pos.component';
import jwt_decode from 'jwt-decode';

declare var notyf: any;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  profileForm: FormGroup;

  userId: number;
  image: any;
  apiUrl: string = environment.api;

  constructor(
    private usersService: UsersService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.profileForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      username: new FormControl(null, [Validators.required]),
      color: new FormControl(null)
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.userId = token.data.id;
  }

  ngOnInit(): void {
    this.getUser();
    this.profile();
  }

  getUser() {
    this.usersService.getUser(this.userId).then(user => {
      if (user.result) {
        PosComponent.u_name = user.data.name;
        PosComponent.u_username = user.data.username;
        PosComponent.u_color = user.data.color;
        this.image = user.image;
        this.profileForm.controls['name'].setValue(user.data.name);
        this.profileForm.controls['username'].setValue(user.data.username);
        this.profileForm.controls['color'].setValue(user.data.color);
      };
    });
  }

  updateProfile(e: any) {
    if (this.validation(e)) {
      $('#update-button').addClass('is-loading');
      $('#profile-button').addClass('is-loading');
      this.usersService.putUser(this.userId, this.profileForm.value).then(data => {
        if (data.result) {
          PosComponent.u_name = this.profileForm.controls['name'].value;
          PosComponent.u_username = this.profileForm.controls['username'].value;
          PosComponent.u_color = this.profileForm.controls['color'].value;
          localStorage.setItem('color', this.profileForm.controls['color'].value);
          this.elementRef.nativeElement.style.setProperty('--color', this.profileForm.controls['color'].value);
          $('#update-button').removeClass('is-loading');
          $('#profile-button').removeClass('is-loading');
          notyf.open({ type: 'success', message: 'Perfil Actualizado' });
          this.keyboard(e);
        }
      });
    }
  }

  postImage() {
    let file: any = document.querySelector('input[type=file]');
    this.usersService.postImage(this.userId, file.files[0]).then(res => {
      if (res.result) {
        notyf.open({ type: 'success', message: res.message });
      } else {
        notyf.open({ type: 'error', message: 'Error' });
      }
    });
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.profileForm.controls).forEach(key => {
      if (this.profileForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.profileForm.controls).forEach(key => {
      let input = e.target.querySelector("input[formControlName^='" + [key] + "']");
      if (input) {
        input.blur();
      }
    });
    return true;
  }

  profile() {
    AppComponent.admin();
    AppComponent.profile();
  }

  getFakeAvatar(name: string) {
    if (name) {
      return name[0];
    } else {
      return '';
    }
  }

  avatar() {
    return `
    <svg 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg" 
      xmlns:xlink="http://www.w3.org/1999/xlink" 
      width="600" 
      height="600"
      stroke="black"
      stroke-width="30"
      fill="none">
      <circle cx="300" cy="300" r="265" />
      <circle cx="300" cy="230" r="115" />	
      <path d="M106.81863443903,481.4 a205,205 1 0,1 386.36273112194,0" stroke-linecap="butt" />
    </svg>`;
  }

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

}
