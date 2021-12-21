import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { UsersService } from 'src/app/services/users.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';

declare var notyf: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: any = [];

  userForm: FormGroup;
  id: number = 0;
  index: number = 0;

  apiUrl: string = environment.api;

  constructor(
    private usersService: UsersService
  ) {
    this.userForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
      access: new FormControl(true, Validators.required)
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    $('.has-loader').addClass('has-loader-active');
    this.usersService.getUsers().then(user => {
      if (user.result) {
        this.users = user.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postUser(e: any) {
    if (this.validation(e)) {
      $('#bt-add-user').addClass('is-loading');
      this.usersService.postUser(this.userForm.value).then(user => {
        if (user.result) {
          this.users.push(user.data);
          this.list();
          notyf.open({ type: 'success', message: user.message });
          $('#add-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Agregar' });
        }
        $('#bt-add-user').removeClass('is-loading');
      });
    }
  }

  putUser(e: any) {
    if (!this.userForm.controls['password'].value) {
      this.userForm.removeControl('password');
    }
    if (this.validation(e)) {
      $('#bt-edit-user').addClass('is-loading');
      this.usersService.putUser(this.id, this.userForm.value).then(user => {
        if (user.result == true) {
          this.users[this.index].name = this.userForm.controls['name'].value;
          this.users[this.index].username = this.userForm.controls['username'].value;
          // this.users[this.userIndex].password = this.userForm.controls.password.value;
          this.users[this.index].access = this.userForm.controls['access'].value;
          this.list();
          notyf.open({ type: 'success', message: user.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Actualizar' });
        }
        $('#bt-edit-user').removeClass('is-loading');
      });
    }
  }

  deleteUser(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-user').addClass('is-loading');
      this.usersService.deleteUser(this.id).then(res => {
        if (res.result) {
          this.users.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-user').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.userForm.controls).forEach(key => {
      if (this.userForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.userForm.controls).forEach(key => {
      let input = e.target.querySelector("input[formControlName^='" + [key] + "']");
      if (input) {
        input.blur();
      }
    });
    return true;
  }

  setData(i: any, u: number) {
    this.index = u;
    this.id = i.id;
    this.userForm.controls['name'].setValue(i.name);
    this.userForm.controls['username'].setValue(i.username);
    this.userForm.controls['password'].setValue(null);
    this.userForm.controls['access'].setValue(i.access);
    this.userForm.controls['password'].setValidators([]);
    this.userForm.controls['password'].updateValueAndValidity();
  }

  reset() {
    this.userForm.addControl('password', new FormControl(null));
    this.userForm.controls['password'].setValidators([Validators.required]);
    this.userForm.controls['password'].updateValueAndValidity();
    this.userForm.reset();
    this.userForm.controls['access'].setValue(true);
  }

  list() {
    AppComponent.admin();
    AppComponent.card();
  }

  getFakeAvatar(name: string) {
    if (name) {
      return name[0];
    } else {
      return '';
    }
  }

  updateAccess(i: any) {
    this.usersService.putUser(i.id, { access: i.access }).then(res => {
      if (res.result) {
        this.list();
        notyf.open({ type: 'success', message: res.message });
      } else {
        notyf.open({ type: 'error', message: 'Error al Actualizar' });
      }
    });
  }

  getSelectName(list: any, id: number) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        return list[i].name;
      }
    }
    return 'Selecciona';
  }

  selectItem(control: any, id: number) {
    control.setValue(id);
  }

}
