import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { AdminService } from 'src/app/services/admin.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

declare var notyf: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  admin: any = [];

  adminForm: FormGroup;
  adminId: number = 0;
  adminIndex: number = 0;

  apiUrl: string = environment.api;

  constructor(
    private adminService: AdminService
  ) {
    this.adminForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    $('.has-loader').addClass('has-loader-active');
    this.adminService.getAdmin().then(user => {
      if (user.result) {
        this.admin = user.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postUser(e: any) {
    if (this.validation(e)) {
      $('#bt-add-user').addClass('is-loading');
      this.adminService.postAdmin(this.adminForm.value).then(user => {
        if (user.result) {
          this.admin.push(user.data);
          this.list();
          notyf.open({ type: 'success', message: user.message });
          $('#add-user-panel').removeClass('is-active');
          $('#bt-add-user').removeClass('is-loading');
          this.keyboard(e);
        }
      });
    }
  }

  putUser(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-user').addClass('is-loading');
      this.adminService.putAdmin(this.adminId, this.adminForm.value).then(user => {
        if (user.result == true) {
          this.admin[this.adminIndex].name = this.adminForm.controls['name'].value;
          this.admin[this.adminIndex].email = this.adminForm.controls['email'].value;
          this.admin[this.adminIndex].username = this.adminForm.controls['username'].value;
          this.admin[this.adminIndex].password = this.adminForm.controls['password'].value;
          this.list();
          notyf.open({ type: 'success', message: user.message });
          $('#edit-user-panel').removeClass('is-active');
          $('#bt-edit-user').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Actualizar' });
        }
      });
    }
  }

  deleteUser(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-user').addClass('is-loading');
      this.adminService.deleteAdmin(this.adminId).then(res => {
        if (res.result) {
          this.admin.splice(this.adminIndex, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          $('#bt-delete-user').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.adminForm.controls).forEach(key => {
      if (this.adminForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.adminForm.controls).forEach(key => {
      let input = e.target.querySelector("input[formControlName^='" + [key] + "']");
      if (input) {
        input.blur();
      }
    });
    return true;
  }

  setData(i: any, u: number) {
    this.adminIndex = u;
    this.adminId = i.id;
    this.adminForm.controls['name'].setValue(i.name);
    this.adminForm.controls['email'].setValue(i.email);
    this.adminForm.controls['username'].setValue(i.username);
    this.adminForm.controls['password'].setValue(i.realPassword);
  }

  reset() {
    this.adminForm.reset();
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

}
