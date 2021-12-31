import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { RolesService } from 'src/app/services/roles.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CompaniesService } from 'src/app/services/companies.service';
import jwt_decode from 'jwt-decode';
import * as $ from 'jquery';

declare var notyf: any;

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  roles: any = [];

  roleForm: FormGroup;
  id: number = 0;
  index: number = 0;

  companyId: number = 0;
  company: any;

  apiUrl: string = environment.api;

  constructor(
    private rolesService: RolesService,
    private companiesService: CompaniesService
  ) {
    this.roleForm = new FormGroup({
      name: new FormControl(null, Validators.required)
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getRoles();
    this.getCompany();
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company) {
        // this.company = company.data;
      }
    });
  }

  getRoles() {
    $('.has-loader').addClass('has-loader-active');
    this.rolesService.getRoles().then(roles => {
      if (roles.result) {
        this.roles = roles.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postRole(e: any) {
    this.rolesService.postRole(this.roleForm.value).then(role => {
      if (role.result) {
        this.roles.push(role.data);
        this.list();
        notyf.open({ type: 'success', message: role.message });
        $('#add-user-panel').removeClass('is-active');
        this.keyboard(e);
      } else {
        notyf.open({ type: 'error', message: role.message });
      }
      $('#bt-add-role').removeClass('is-loading');
    });
  }

  putRole(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-role').addClass('is-loading');
      this.rolesService.putRole(this.id, this.roleForm.value).then(role => {
        if (role.result == true) {
          this.roles[this.index].name = this.roleForm.controls['name'].value;
          this.list();
          notyf.open({ type: 'success', message: role.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: role.message });
        }
        $('#bt-edit-role').removeClass('is-loading');
      });
    }
  }

  deleteRole(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-role').addClass('is-loading');
      this.rolesService.deleteRole(this.id).then(res => {
        if (res.result) {
          this.roles.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-role').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.roleForm.controls).forEach(key => {
      if (this.roleForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.roleForm.controls).forEach(key => {
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
    this.roleForm.controls['name'].setValue(i.name);
  }

  reset() {
    this.roleForm.reset();
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

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

}
