import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompaniesService } from 'src/app/services/companies.service';
import { OperationsService } from 'src/app/services/operations.service';
import jwt_decode from 'jwt-decode';
import { AppComponent } from 'src/app/app.component';
import { environment } from 'src/environments/environment';
import { ReportsService } from 'src/app/services/reports.service';
import * as moment from 'moment';

declare function quickPrint(data: any): any;
declare var notyf: any;

@Component({
  selector: 'app-invoice-operation',
  templateUrl: './invoice-operation.component.html',
  styleUrls: ['./invoice-operation.component.css']
})
export class InvoiceOperationComponent implements OnInit {

  id: number = 0;
  companyId: number = 0;

  operation: any;
  company: any;
  customer: any;
  supplier: any;
  details: any = [];
  notes: any = [];

  format: string = 'invoice';

  apiUrl: string = environment.api;

  constructor(
    private activatedRoute: ActivatedRoute,
    private operationsService: OperationsService,
    private companiesService: CompaniesService,
    private reportsService: ReportsService,
    private elementRef: ElementRef
  ) {
    AppComponent.admin();
    AppComponent.list();
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((route: any) => {
      this.id = route.id;
      this.getOperation();
      this.getCompany();
    });
  }

  getOperation() {
    $('.has-loader').addClass('has-loader-active');
    this.operationsService.getOperation(this.id).then(operation => {
      if (operation.result) {
        this.operation = operation.data;

        operation.data.document.primaryColor ?
          this.elementRef.nativeElement.style.setProperty('--primaryColor', operation.data.document.primaryColor) : 'var(--color)';

        operation.data.document.secondaryColor ?
          this.elementRef.nativeElement.style.setProperty('--secondaryColor', operation.data.document.secondaryColor) : '#fff';

        this.customer = operation.data.customer;
        this.supplier = operation.data.supplier;
        this.details = operation.data.detailoperations;
        this.notes = operation.data.notes;
      }
      AppComponent.admin();
      AppComponent.list();
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  totalNotes(u: number) {
    let total = parseFloat(this.operation.total);
    for (let i = 0; i < u + 1; i++) {
      if (this.notes[i].document.typedocument.name == 'NOTA DE CREDITO') {
        total = total - parseFloat(this.notes[i].total);
      }
      if (this.notes[i].document.typedocument.name == 'NOTA DE DEBITO') {
        total = total + parseFloat(this.notes[i].total);
      }
      if (this.notes[i].document.typedocument.name == 'NOTA DE ABONO') {
        total = total - parseFloat(this.notes[i].total);
      }
      if (this.notes[i].document.typedocument.name == 'ABONO') {
        total = total - parseFloat(this.notes[i].total);
      }
    }
    return total;
  }

  pdfInvoice() {
    $('#pdfInvoice').addClass('is-loading');
    this.to(`${this.apiUrl}/${this.company.database}/invoice/${this.id}/`);
    $('#pdfInvoice').removeClass('is-loading');
    // this.reportsService.reportInvoice(this.id, this.format).then(report => {
    //   if (report.result) {
    //     this.to(`${this.apiUrl}${report.url}`);
    //     $('#pdfInvoice').removeClass('is-loading');
    //   }
    // });
  }

  async printInvoice() {
    $('#printInvoice').addClass('is-loading');

    let details = 'PRODUCTO';
    for (let t = 0; t < this.company.tabs - 14; t++) {
      details += ' ';
    }
    details += 'PRECIO';
    details += this.lines(this.company.tabs);
    for (let i = 0; i < this.details.length; i++) {
      details += this.items(Math.round(this.details[i].quantity), this.details[i].description, this.details[i].subtotal, this.company.tabs);
    }
    details += this.lines(this.company.tabs);

    details += this.totals(this.operation.total, this.company.tabs);

    if (this.operation.document.typedocument.certification) {
      details += `<CENTER>CERTIFICACION:<CENTER>${this.operation.autorizacionFel}<CENTER>SERIE FEL: ${this.operation.serieFel}<CENTER>NUMERO FEL: ${this.operation.numberFel}`;
    }

    quickPrint(`<PRINTER repeat='1' alias='felkairos'>
    <BOLD><CENTER>${this.company.name}<BR><CENTER>NIT: ${this.company.nit}
    <BR>${details}
    <CENTER>${moment().format('DD-MM-yyyy hh:mm:ss')}`);

    await this.delay(3);
    $('#printInvoice').removeClass('is-loading');
  }

  emailInvoice() {
    $('#emailInvoice').addClass('is-loading');
    this.operationsService.postOperationEmail(this.id).then(email => {
      if (email.error) {
        notyf.open({ type: 'error', message: email.error });
        $('#emailInvoice').removeClass('is-loading');
        return;
      }
      if (email.code) {
        notyf.open({ type: 'error', message: `${email.code} ${email.response} ${email.path}` });
        $('#emailInvoice').removeClass('is-loading');
      }
      if (email.accepted[0]) {
        notyf.open({ type: 'success', message: 'Factura enviada exitosamente' });
        $('#emailInvoice').removeClass('is-loading');
      }
    });
  }

  delay(n: any) {
    return new Promise(function (resolve) {
      setTimeout(resolve, n * 1000);
    });
  }

  items(quantity: number, description: string, subtotal: string, tabs: number) {
    let item = `${quantity} `;
    if (description.length > (tabs - 4 - subtotal.length)) {
      description = description.substr(0, tabs - 4 - subtotal.length);
      item += `${description}  ${subtotal}`;
    } else {
      item += description;
      let spaces = (tabs - item.length) - subtotal.length;
      for (let i = 1; i < spaces; i++) {
        item += ' ';
      }
      item += ` ${subtotal}`
    }
    return `${item}\n`;
  }

  lines(tabs: any) {
    let line = ''
    for (let t = 0; t < tabs; t++) {
      line += '-';
    }
    return line;
  }

  totals(total: string, tabs: number) {
    let spaces = 0;
    let item = `TOTAL:`;
    spaces = tabs - (item.length + 1) - total.length;
    for (let i = 1; i < spaces; i++) {
      item += ' ';
    }
    item += `Q.${total}\n`;
    return `${item}\n`;
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company.result) {
        this.company = company.data;
      }
    });
  }

  setFormat(format: any) {
    this.format = format;
  }

  getCurrency() {
    if (this.operation.currency == 'GTQ') {
      return 'Q';
    }
    if (this.operation.currency == 'USD') {
      return '$';
    }
    return '';
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
