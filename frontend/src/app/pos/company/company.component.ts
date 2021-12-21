import { Component, OnInit } from '@angular/core';
import { CompaniesService } from 'src/app/services/companies.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { environment } from 'src/environments/environment';
import { PosComponent } from '../pos.component';
import jwt_decode from 'jwt-decode';

declare var notyf: any;

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit {

  companyForm: FormGroup;

  companyId: number;
  company: any = {};
  image: any;
  apiUrl: string = environment.api;

  constructor(
    private companyService: CompaniesService
  ) {
    this.companyForm = new FormGroup({
      image: new FormControl(null),
      name: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      tax: new FormControl(null, [Validators.required]),
      iva: new FormControl(null, [Validators.required]),
      exchange: new FormControl(null, [Validators.required]),
      nit: new FormControl(null, [Validators.required]),
      printer: new FormControl(null, [Validators.required]),
      tabs: new FormControl(null, [Validators.required]),
      username: new FormControl(null, [Validators.required]),
      database: new FormControl(null, [Validators.required]),
      exp: new FormControl(null, [Validators.required]),
      stock: new FormControl(false, [Validators.required])
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getCompany();
    this.profile();
  }

  getCompany() {
    this.companyService.getCompany(this.companyId).then(company => {
      if (company.result) {
        this.company = company.data;
        PosComponent.u_logo = company.data.image;
        this.companyForm.controls['image'].setValue(company.data.image);
        this.companyForm.controls['name'].setValue(company.data.name);
        this.companyForm.controls['phone'].setValue(company.data.phone);
        this.companyForm.controls['email'].setValue(company.data.email);
        this.companyForm.controls['tax'].setValue(company.data.tax);
        this.companyForm.controls['iva'].setValue(company.data.iva);
        this.companyForm.controls['exchange'].setValue(company.data.exchange);
        this.companyForm.controls['nit'].setValue(company.data.nit);
        this.companyForm.controls['printer'].setValue(company.data.printer);
        this.companyForm.controls['tabs'].setValue(company.data.tabs);
        this.companyForm.controls['username'].setValue(company.data.username);
        this.companyForm.controls['database'].setValue(company.data.database);
        this.companyForm.controls['exp'].setValue(company.data.exp);
        this.companyForm.controls['stock'].setValue(company.data.stock);
      };
    });
  }

  updateCompany(e: any) {
    if (this.validation(e)) {
      $('#update-button').addClass('is-loading');
      $('#profile-button').addClass('is-loading');
      this.companyService.putCompany(this.companyId, this.companyForm.value).then(data => {
        if (data.result) {
          PosComponent.u_logo = this.companyForm.controls['image'].value;
          notyf.open({ type: 'success', message: 'Perfil Actualizado' });
          $('#update-button').removeClass('is-loading');
          $('#profile-button').removeClass('is-loading');
          this.keyboard(e);
        }
      });
    }
  }

  postImage() {
    let file: any = document.querySelector('input[type=file]');
    this.companyService.postImage(file.files[0], this.companyForm.controls['database'].value).then(company => {
      if (company.result) {
        $('#uploaded').removeClass('is-hidden');
        $('#uploaded-btn').removeClass('is-hidden');
        $('#upload-btn').addClass('is-hidden');
        location.reload();
      } else {
        notyf.open({ type: 'error', message: 'Error' });
      }
    });
  }

  deleteImage() {
    this.companyService.deleteImage(this.companyForm.controls['database'].value).then(comapany => {
      if (comapany.result) {
        this.company.image = null;
        this.companyForm.controls['image'].setValue(null);
        PosComponent.u_logo = '';
        $('#upload').addClass('is-hidden');
        $('#uploaded').removeClass('is-hidden');
        $('#uploaded-btn').removeClass('is-hidden');
        $('#upload-btn').addClass('is-hidden');
        notyf.open({ type: 'success', message: comapany.message });
      } else {
        notyf.open({ type: 'error', message: comapany.message });
      }
    });
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.companyForm.controls).forEach(key => {
      if (this.companyForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.companyForm.controls).forEach(key => {
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

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

}
