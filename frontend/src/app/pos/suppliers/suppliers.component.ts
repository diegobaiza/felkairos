import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { SuppliersService } from 'src/app/services/suppliers.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CompaniesService } from 'src/app/services/companies.service';
import { DigifactService } from 'src/app/services/digifact.service';
import jwt_decode from 'jwt-decode';
import { ReportsService } from 'src/app/services/reports.service';
import * as moment from 'moment';

declare var notyf: any;

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {

  suppliers: any = [];
  cxp: any = [];

  supplierForm: FormGroup;
  id: number = 0;
  index: number = 0;

  credito: number = 0;
  debito: number = 0;
  currency: string = '';

  companyId: number = 0;
  company: any;

  apiUrl: string = environment.api;

  range: any = { startDate: moment(), endDate: moment() }
  ranges: any = {
    'Hoy': [moment(), moment()],
    'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Últimos 7 Dias': [moment().subtract(6, 'days'), moment()],
    'Últimos 30 Dias': [moment().subtract(29, 'days'), moment()],
    'Este Mes': [moment().startOf('month'), moment().endOf('month')],
    'Mes Pasado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  };

  constructor(
    private suppliersService: SuppliersService,
    private companiesService: CompaniesService,
    private digifactService: DigifactService,
    private reportsService: ReportsService
  ) {
    this.supplierForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      nit: new FormControl(null, Validators.required),
      email: new FormControl(''),
      doc: new FormControl('NIT', Validators.required)
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getSuppliers();
    this.getCompany();
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company) {
        this.company = company.data;
      }
    });
  }

  getSuppliers() {
    $('.has-loader').addClass('has-loader-active');
    this.suppliersService.getSuppliers().then(supplier => {
      if (supplier.result) {
        this.suppliers = supplier.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postSupplier(e: any) {
    this.supplierForm.controls['nit'].setValue(this.supplierForm.controls['nit'].value.toUpperCase());
    if (this.validation(e)) {
      $('#bt-add-supplier').addClass('is-loading');
      if (this.supplierForm.controls['doc'].value == 'NIT') {
        this.digifactService.getInfoNit(this.company.nit, this.supplierForm.controls['nit'].value).then((digifact: any) => {
          if (digifact.RESPONSE[0].NOMBRE) {
            let felName = digifact.RESPONSE[0].NOMBRE;
            let name: any = felName.split(',,')[1] + ' ' + felName.split(',,')[0];
            name = name.replaceAll(',', ' ');
            this.supplierForm.controls['name'].setValue(name);
            this.suppliersService.postSupplier(this.supplierForm.value).then(supplier => {
              if (supplier.result) {
                this.suppliers.push(supplier.data);
                this.list();
                notyf.open({ type: 'success', message: supplier.message });
                $('#add-user-panel').removeClass('is-active');
                this.keyboard(e);
              } else {
                notyf.open({ type: 'error', message: supplier.message });
              }
              $('#bt-add-supplier').removeClass('is-loading');
            });
          } else {
            notyf.open({ type: 'error', message: 'NIT Inválido' });
          }
          $('#bt-add-supplier').removeClass('is-loading');
        });
      } else {
        this.suppliersService.postSupplier(this.supplierForm.value).then(supplier => {
          if (supplier.result) {
            this.suppliers.push(supplier.data);
            this.list();
            notyf.open({ type: 'success', message: supplier.message });
            $('#add-user-panel').removeClass('is-active');
            this.keyboard(e);
          } else {
            notyf.open({ type: 'error', message: supplier.message });
          }
          $('#bt-add-supplier').removeClass('is-loading');
        });
      }
    }
  }

  putSupplier(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-supplier').addClass('is-loading');
      this.suppliersService.putSupplier(this.id, this.supplierForm.value).then(supplier => {
        if (supplier.result == true) {
          this.suppliers[this.index].name = this.supplierForm.controls['name'].value;
          this.suppliers[this.index].nit = this.supplierForm.controls['nit'].value;
          this.suppliers[this.index].email = this.supplierForm.controls['email'].value;
          this.suppliers[this.index].doc = this.supplierForm.controls['doc'].value;
          this.list();
          notyf.open({ type: 'success', message: supplier.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: supplier.message });
        }
        $('#bt-edit-supplier').removeClass('is-loading');
      });
    }
  }

  deleteSupplier(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-supplier').addClass('is-loading');
      this.suppliersService.deleteSupplier(this.id).then(res => {
        if (res.result) {
          this.suppliers.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-supplier').removeClass('is-loading');
      });
    }
  }

  async getCxP() {
    let operations = await this.suppliersService.getCxP(this.id);
    if (operations.data) {
      this.cxp = operations.data;
      this.debito = 0
      this.credito = 0;
      for (let i = 0; i < this.cxp.length; i++) {
        if (this.cxp[i].operationId) {
          this.debito = this.debito + parseFloat(this.cxp[i].total)
        } else {
          this.credito = this.credito + parseFloat(this.cxp[i].total);
        }
      }
    }
  }

  reportCxP() {
    $('#rep-button').addClass('is-loading');
    let name = `CxC ${this.supplierForm.controls['nit'].value} ${this.supplierForm.controls['name'].value}`;
    let startDate = moment(this.range.startDate).format('YYYY-MM-DD');
    let endDate = moment(this.range.endDate).format('YYYY-MM-DD');
    this.to(`${this.apiUrl}/${this.company.database}/cxp/${startDate}/${endDate}/${this.id}/${name}`);
    $('#rep-button').removeClass('is-loading');
  }

  setData(i: any, u: number) {
    this.index = u;
    this.id = i.id;
    this.supplierForm.controls['name'].setValue(i.name);
    this.supplierForm.controls['nit'].setValue(i.nit);
    this.supplierForm.controls['email'].setValue(i.email);
    this.supplierForm.controls['doc'].setValue(i.doc);
    this.cxp = [];
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.supplierForm.controls).forEach(key => {
      if (this.supplierForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.supplierForm.controls).forEach(key => {
      let input = e.target.querySelector("input[formControlName^='" + [key] + "']");
      if (input) {
        input.blur();
      }
    });
    return true;
  }

  getCurrency(currency: string) {
    if (currency == 'GTQ') {
      return 'Q';
    }
    if (currency == 'USD') {
      return '$';
    }
    return '';
  }

  reset() {
    this.supplierForm.reset();
    this.supplierForm.controls['doc'].setValue('NIT');
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

  getOS() {
    var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }

    return os;
  }

  to(url: string) {
    if (this.getOS() == 'iOS') {
      location.href = url;
    } else {
      window.open(url, '_blank');
    }
  }

}
