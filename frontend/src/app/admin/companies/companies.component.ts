import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { CompaniesService } from 'src/app/services/companies.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DigifactService } from 'src/app/services/digifact.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

declare var notyf: any;

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  companies: any = [];

  companyForm: FormGroup;
  id: number = 0;
  index: number = 0;

  apiUrl: string = environment.api;

  constructor(
    private companiesService: CompaniesService,
    private digifactService: DigifactService,
    private authService: AuthService,
    private router: Router
  ) { 
    this.companyForm = new FormGroup({
      image: new FormControl(null),
      name: new FormControl(null, [Validators.required]),
      nit: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      tax: new FormControl(true, [Validators.required]),
      iva: new FormControl(12, [Validators.required]),
      exchange: new FormControl(7.5, [Validators.required]),
      documents: new FormControl(0, [Validators.required]),
      extra: new FormControl(0, [Validators.required]),
      access: new FormControl(true, [Validators.required]),
      printer: new FormControl(true, [Validators.required]),
      tabs: new FormControl(true, [Validators.required]),
      database: new FormControl(null, [Validators.required]),
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      exp: new FormControl(null, [Validators.required]),
      stock: new FormControl(null, [Validators.required]),
      token: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    this.getCompanies();
  }

  getCompanies() {
    $('.has-loader').addClass('has-loader-active');
    this.companiesService.getCompanies().then(companies => {
      if (companies.result) {
        this.companies = companies.data;
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
      this.list();
    });
  }

  putCompany(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-company').addClass('is-loading');
      this.companiesService.putCompany(this.id, this.companyForm.value).then(res => {
        if (res.result) {
          this.companies[this.index] = this.companyForm.value;
          this.companies[this.index].id = this.id;
          // this.companies[this.index].nit = this.companyForm.controls.nit.value;
          // this.companies[this.index].address = this.companyForm.controls.address.value;
          // this.companies[this.index].email = this.companyForm.controls.email.value;
          // this.companies[this.index].phone = this.companyForm.controls.phone.value;
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#edit-company-panel').removeClass('is-active');
          $('#bt-edit-company').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Actualizar' });
        }
      });
    }
  }

  deleteCompany(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-company').addClass('is-loading');
      this.companiesService.deleteCompany(this.id).then(res => {
        if (res.result) {
          this.companies.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-company-panel').removeClass('is-active');
          $('#bt-delete-company').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
      });
    }
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

  generateToken(i: any, u: number) {
    this.digifactService.getToken({ username: i.username, password: i.password }).subscribe((res: any) => {
      if (res.Token) {
        i.token = res.Token;
        this.companiesService.putCompany(i.id, i).then(res => {
          if (res.result) {
            notyf.open({ type: 'success', message: 'Token generado con exito' });
            this.setData(i, u);
            $('#edit-company-panel').addClass('is-active');
          } else {
            notyf.open({ type: 'error', message: 'Error al Actualizar' });
          }
        });
      } else {
        notyf.open({ type: 'error', message: res.description });
      }
    });
  }

  postImage() {
    let file: any = document.querySelector('input[type=file]');
    this.companiesService.postImage(file.files[0], this.companyForm.controls['database'].value).then(company => {
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
    this.companiesService.deleteImage(this.companyForm.controls['database'].value).then(comapany => {
      if (comapany.result) {
        $('#upload').addClass('is-hidden');
        $('#uploaded').removeClass('is-hidden');
        $('#uploaded-btn').removeClass('is-hidden');
        $('#upload-btn').addClass('is-hidden');
        location.reload();
      } else {
        notyf.open({ type: 'error', message: comapany.message });
      }
    });
  }

  login(i: any, u: number) {
    this.authService.login({ company: i.database, username: 'admin', password: 'sa@kairos' }).then(data => {
      if (data.result == true) {
        localStorage.setItem('token', data.token);
        this.router.navigate(['pos/dashboard']);
        notyf.success(data.message);
      } else {
        notyf.error(data.message);
      }
      // document.getElementById('login-submit').classList.remove('is-loading');
    });
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

  setData(i: any, u: number) {
    this.index = u;
    this.id = i.id;
    this.companyForm.controls['image'].setValue(i.image);
    this.companyForm.controls['name'].setValue(i.name);
    this.companyForm.controls['nit'].setValue(i.nit);
    this.companyForm.controls['address'].setValue(i.address);
    this.companyForm.controls['phone'].setValue(i.phone);
    this.companyForm.controls['email'].setValue(i.email);
    this.companyForm.controls['tax'].setValue(i.tax);
    this.companyForm.controls['iva'].setValue(i.iva);
    this.companyForm.controls['documents'].setValue(i.documents);
    this.companyForm.controls['extra'].setValue(i.extra);
    this.companyForm.controls['access'].setValue(i.access);
    this.companyForm.controls['printer'].setValue(i.printer);
    this.companyForm.controls['tabs'].setValue(i.tabs);
    this.companyForm.controls['database'].setValue(i.database);
    this.companyForm.controls['username'].setValue(i.username);
    this.companyForm.controls['password'].setValue(i.password);
    this.companyForm.controls['exp'].setValue(i.exp);
    this.companyForm.controls['stock'].setValue(i.stock);
    this.companyForm.controls['token'].setValue(i.token);
  }

  reset() {
    this.companyForm.reset();
    this.companyForm.controls['tax'].setValue(true);
    this.companyForm.controls['iva'].setValue(12);
    this.companyForm.controls['access'].setValue(true);
  }

  list() {
    AppComponent.admin();
    AppComponent.list();
    AppComponent.profile();
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

  getFakeAvatar(name: string) {
    if (name) {
      return name[0];
    } else {
      return '';
    }
  }

}