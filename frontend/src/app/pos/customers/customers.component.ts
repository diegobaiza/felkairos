import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { CustomersService } from 'src/app/services/customers.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { DigifactService } from 'src/app/services/digifact.service';
import { CompaniesService } from 'src/app/services/companies.service';
import jwt_decode from 'jwt-decode';
import { ReportsService } from 'src/app/services/reports.service';
import * as moment from 'moment';

declare var notyf: any;

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  customers: any = [];
  cxc: any = [];

  customerForm: FormGroup;
  id: number = 0;
  index: number = 0;

  credito: number = 0;
  debito: number = 0;
  currency: string = '';

  companyId: number;
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
    private customersService: CustomersService,
    private companiesService: CompaniesService,
    private digifactService: DigifactService,
    private reportsService: ReportsService
  ) {
    this.customerForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      nit: new FormControl(null, [Validators.required]),
      email: new FormControl(''),
      doc: new FormControl('NIT', [Validators.required])
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getCustomers();
    this.getCompany();
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company) {
        this.company = company.data;
      }
    });
  }

  getCustomers() {
    $('.has-loader').addClass('has-loader-active');
    this.customersService.getCustomers().then(customer => {
      if (customer.result) {
        this.customers = customer.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postCustomer(e: any) {
    this.customerForm.controls['nit'].setValue(this.customerForm.controls['nit'].value.toUpperCase());
    if (this.validation(e)) {
      $('#bt-add-customer').addClass('is-loading');
      if (this.customerForm.controls['doc'].value == 'NIT') {
        this.digifactService.getInfoNit(this.company.nit, this.customerForm.controls['nit'].value).then((digifact: any) => {
          if (digifact.RESPONSE[0].NOMBRE) {
            let felName = digifact.RESPONSE[0].NOMBRE;
            let name: any = felName.split(',,')[1] + ' ' + felName.split(',,')[0];
            name = name.replaceAll(',', ' ');
            this.customerForm.controls['name'].setValue(name);
            this.customersService.postCustomer(this.customerForm.value).then(customer => {
              if (customer.result) {
                this.customers.push(customer.data);
                this.list();
                notyf.open({ type: 'success', message: customer.message });
                $('#add-user-panel').removeClass('is-active');
                this.keyboard(e);
              } else {
                notyf.open({ type: 'error', message: customer.message });
              }
              $('#bt-add-customer').removeClass('is-loading');
            });
          } else {
            notyf.open({ type: 'error', message: 'NIT Inválido' });
          }
          $('#bt-add-customer').removeClass('is-loading');
        });
      } else {
        this.customersService.postCustomer(this.customerForm.value).then(customer => {
          if (customer.result) {
            this.customers.push(customer.data);
            this.list();
            notyf.open({ type: 'success', message: customer.message });
            $('#add-user-panel').removeClass('is-active');
            this.keyboard(e);
          } else {
            notyf.open({ type: 'error', message: customer.message });
          }
          $('#bt-add-customer').removeClass('is-loading');
        });
      }
    }
  }

  putCustomer(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-customer').addClass('is-loading');
      this.customersService.putCustomer(this.id, this.customerForm.value).then(customer => {
        if (customer.result == true) {
          this.customers[this.index].name = this.customerForm.controls['name'].value;
          this.customers[this.index].nit = this.customerForm.controls['nit'].value;
          this.customers[this.index].email = this.customerForm.controls['email'].value;
          this.customers[this.index].doc = this.customerForm.controls['doc'].value;
          this.list();
          notyf.open({ type: 'success', message: customer.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: customer.message });
        }
        $('#bt-edit-customer').removeClass('is-loading');
      });
    }
  }

  deleteCustomer(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-customer').addClass('is-loading');
      this.customersService.deleteCustomer(this.id).then(res => {
        if (res.result) {
          this.customers.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-customer').removeClass('is-loading');
      });
    }
  }

  async getCxC() {
    $('#search-button').addClass('is-loading');
    let operations = await this.customersService.getCxC(moment(this.range.startDate).format('YYYY-MM-DD'), moment(this.range.endDate).format('YYYY-MM-DD'), this.id);
    if (operations.data) {
      this.cxc = operations.data;
      this.debito = 0
      this.credito = 0;
      for (let i = 0; i < this.cxc.length; i++) {
        if (this.cxc[i].operationId) {
          this.debito = this.debito + parseFloat(this.cxc[i].total)
        } else {
          this.credito = this.credito + parseFloat(this.cxc[i].total);
        }
      }
    }
    $('#search-button').removeClass('is-loading');
  }

  reportCxC() {
    $('#rep-button').addClass('is-loading');
    let name = `CxC ${this.customerForm.controls['nit'].value} ${this.customerForm.controls['name'].value}`;
    let startDate = moment(this.range.startDate).format('YYYY-MM-DD');
    let endDate = moment(this.range.endDate).format('YYYY-MM-DD');
    this.to(`${this.apiUrl}/${this.company.database}/cxc/${startDate}/${endDate}/${this.id}/${name}`);
    $('#rep-button').removeClass('is-loading');
  }

  setData(i: any, u: number) {
    this.index = u;
    this.id = i.id;
    this.customerForm.controls['name'].setValue(i.name);
    this.customerForm.controls['nit'].setValue(i.nit);
    this.customerForm.controls['email'].setValue(i.email);
    this.customerForm.controls['doc'].setValue(i.doc);
    this.cxc = [];
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.customerForm.controls).forEach(key => {
      if (this.customerForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.customerForm.controls).forEach(key => {
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
    this.customerForm.reset();
    this.customerForm.controls['doc'].setValue('NIT');
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
