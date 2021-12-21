import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { OperationsService } from 'src/app/services/operations.service';
import { CompaniesService } from 'src/app/services/companies.service';
import { DocumentsService } from 'src/app/services/documents.service';
import { DigifactService } from 'src/app/services/digifact.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TypeDocumentsService } from 'src/app/services/typeDocuments.service';

declare var notyf: any;

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {

  operationForm: FormGroup;
  id: number = 0;
  index: number = 0;

  operations: any = [];
  documents: any = [];

  companyId: number;
  company: any;

  today: any;
  document: any;
  filterType: any;
  nit: string = '';
  types: any = [];

  felDetails: any;

  apiUrl: string = environment.api;

  placeloader = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  range: any = { startDate: moment(), endDate: moment() }
  ranges: any = {
    'Hoy': [moment(), moment()],
    'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Últimos 7 Dias': [moment().subtract(6, 'days'), moment()],
    'Últimos 30 Dias': [moment().subtract(29, 'days'), moment()],
    'Este Mes': [moment().startOf('month'), moment().endOf('month')],
    'Mes Pasado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  };

  loader: boolean = false;

  constructor(
    private operationsService: OperationsService,
    private companiesService: CompaniesService,
    private documentsService: DocumentsService,
    private typeDocumentsService: TypeDocumentsService,
    private digifactService: DigifactService
  ) {
    this.operationForm = new FormGroup({
      serie: new FormControl(null, [Validators.required]),
      correlative: new FormControl(null, [Validators.required]),
      date: new FormControl(null, [Validators.required]),
      nit: new FormControl(null),
      total: new FormControl(0, [Validators.required]),
      subtotal: new FormControl(0, [Validators.required]),
      iva: new FormControl(0, [Validators.required]),
      currency: new FormControl('GTQ', [Validators.required]),
      autorizacionFel: new FormControl(null),
      serieFel: new FormControl(null),
      numberFel: new FormControl(null)
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.today = moment().format('YYYY-MM-DD');
    this.getTypeDocuments();
    this.getDocuments();
    this.getCompany();
    AppComponent.admin();
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company.result) {
        this.company = company.data;
      }
    });
  }

  getDocuments() {
    this.documentsService.getDocuments().then(documents => {
      if (documents.result) {
        this.documents = documents.data;
      }
    });
  }

  getTypeDocuments() {
    this.types = [];
    this.typeDocumentsService.getTypeDocuments().then(typeDocuments => {
      if (typeDocuments.result) {
        for (let i = 0; i < typeDocuments.data.length; i++) {
          this.types.push(typeDocuments.data[i].name);
        }
      }
    });
  }

  get documentsNotes() {
    let docs = [];
    for (let i = 0; i < this.documents.length; i++) {
      if (this.documents[i].typedocument.name == 'NOTA DE DEBITO' || this.documents[i].typedocument.name == 'NOTA DE CREDITO' || this.documents[i].typedocument.name == 'NOTA DE ABONO') {
        docs.push(this.documents[i]);
      }
    }
    return docs;
  }

  get documentsAbonos() {
    let docs = [];
    for (let i = 0; i < this.documents.length; i++) {
      if (this.documents[i].typedocument.inventory == 'ABONO') {
        docs.push(this.documents[i]);
      }
    }
    return docs;
  }

  async getOperationsRange() {
    this.loader = true;
    const startDate = this.range.startDate.format('YYYY-MM-DD');
    const endDate = this.range.endDate.format('YYYY-MM-DD');
    let operations = await this.operationsService.getOperationsRange(startDate, endDate);
    if (operations.result) {
      this.operations = operations.data;
      AppComponent.admin();
      this.list();
    }
    this.loader = false;
  }

  getOperationSerieFel(value: any) {
    value = value.target.value;
    if (value) {
      this.loader = true;
      this.operationsService.getOperationsSerieFel(value).then(operations => {
        if (operations.result) {
          this.operations = operations.data;
        }
        this.loader = false;
      });
    } else {
      this.getOperationsRange();
    }
  }

  getOperationNumberFel(value: any) {
    value = value.target.value;
    if (value) {
      this.loader = true;
      this.operationsService.getOperationsNumberFel(value).then(operations => {
        if (operations.result) {
          this.operations = operations.data;
        }
        this.loader = false;
      });
    } else {
      this.getOperationsRange();
    }
  }

  deleteOperation(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-operation').addClass('is-loading');
      this.operationsService.deleteOperation(this.id).then(operation => {
        if (operation.result) {
          this.operations.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: operation.message });
          $('#delete-operation-panel').removeClass('is-active');
          $('#bt-delete-operation').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-operation').removeClass('is-loading');
      });
    }
  }

  anulacionOperation(e: any) {
    if (this.validation(e)) {
      $('#bt-anular-operation').addClass('is-loading');
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
      <dte:GTAnulacionDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.1.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="0.1">
        <dte:SAT>
          <dte:AnulacionDTE ID="DatosCertificados">
            <dte:DatosGenerales ID="DatosAnulacion" NumeroDocumentoAAnular="${this.operationForm.controls['autorizacionFel'].value}"
              NITEmisor="${this.company.nit}" IDReceptor="${this.operationForm.controls['nit'].value}" FechaEmisionDocumentoAnular="${this.operationForm.controls['date'].value}"
              FechaHoraAnulacion="${this.operationForm.controls['date'].value}" MotivoAnulacion="Anulacion de Fac-4" />
          </dte:AnulacionDTE>
        </dte:SAT>
      </dte:GTAnulacionDocumento>`;
      this.digifactService.anulacion(this.formatNit(this.company.nit), xml).then((anulacion: any) => {
        if (anulacion.Codigo == 1) {
          this.operationsService.putOperation(this.id, { status: 'ANULADA', }).then(operation => {
            if (operation.result) {
              this.operations[this.index].status = 'ANULADA';
              notyf.open({ type: 'success', message: 'Operacion Anulada' });
              $('#anular-operation-panel').removeClass('is-active');
              $('#bt-anular-operation').removeClass('is-loading');
              this.keyboard(e);
            }
          });
        } else {
          $('#bt-anular-operation').removeClass('is-loading');
          $('#err-fel-panel').addClass('is-active');
          this.felDetails = anulacion;
          notyf.open({ type: 'error', message: anulacion.Mensaje });
        }
      }).catch((res: HttpErrorResponse) => {
        $('#bt-anular-operation').removeClass('is-loading');
        $('#err-fel-panel').addClass('is-active');
        this.felDetails = res.error;
        notyf.open({ type: 'error', message: res.error.Mensaje });
      });
    }
  }

  formatNit(nit: string) {
    let nitF = '';
    for (let i = 0; i < (12 - nit.length); i++) {
      nitF += '0';
    }
    return nitF + nit;
  }

  setData(i: any, u: number) {
    this.index = u;
    this.id = i.id;
    this.document = i.document;
    this.operationForm.controls['serie'].setValue(i.serie);
    this.operationForm.controls['correlative'].setValue(i.correlative);
    this.operationForm.controls['date'].setValue(i.date);
    this.operationForm.controls['nit'].setValue(i.nit);
    this.operationForm.controls['total'].setValue(i.total);
    this.operationForm.controls['subtotal'].setValue(i.subtotal);
    this.operationForm.controls['iva'].setValue(i.iva);
    this.operationForm.controls['currency'].setValue(i.currency);
    this.operationForm.controls['autorizacionFel'].setValue(i.autorizacionFel);
    this.operationForm.controls['serieFel'].setValue(i.serieFel);
    this.operationForm.controls['numberFel'].setValue(i.numberFel);
  }

  validNota(i: any) {
    if (i.document.typedocument.name == 'FACTURA' ||
      i.document.typedocument.name == 'FACTURA CAMBIARIA' ||
      i.document.typedocument.name == 'FACTURA ESPECIAL' ||
      i.document.typedocument.name == 'RECIBO' ||
      i.document.typedocument.name == 'RECIBO POR DONACION') {
      if (i.status == 'CERTIFICADA') {
        return true;
      }
    }
    return false;
  }

  validAbono(i: any) {
    if (i.document.typedocument.name == 'COMPRA' ||
      i.document.typedocument.name == 'FACTURA' ||
      i.document.typedocument.name == 'FACTURA CAMBIARIA' ||
      i.document.typedocument.name == 'FACTURA ESPECIAL' ||
      i.document.typedocument.name == 'RECIBO' ||
      i.document.typedocument.name == 'RECIBO POR DONACION') {
      if (i.status == 'CERTIFICADA' && i.payment == 'CREDITO') {
        return true;
      }
    }
    return false;
  }

  validAnulacion(i: any) {
    if (i.document.typedocument.certification) {
      if (i.status == 'CERTIFICADA') {
        return true;
      }
    }
    return false;
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.operationForm.controls).forEach(key => {
      if (this.operationForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.operationForm.controls).forEach(key => {
      let input = e.target.querySelector("input[formControlName^='" + [key] + "']");
      if (input) {
        input.blur();
      }
    });
    return true;
  }

  getCurrency(code: string) {
    if (code == 'GTQ') {
      return 'Q';
    }
    if (code == 'USD') {
      return '$';
    }
    return '';
  }

  list() {
    AppComponent.list();
  }

  openComboDesktop() {
    if ($('#comboType').hasClass('is-active')) {
      $('#comboType').removeClass('is-active');
    } else {
      $('#comboType').addClass('is-active')
    }
  }

  openComboMobile() {
    if ($('#comboTypeMobile').hasClass('is-active')) {
      $('#comboTypeMobile').removeClass('is-active');
    } else {
      $('#comboTypeMobile').addClass('is-active')
    }
  }

  openDrop(u: number) {
    $('.dropdown').removeClass('is-active');
    $(document).on('click', function (e) {
      var target = e.target;

      if (!$(target).is('.dropdown img, .kill-drop') && !$(target).parents().is('.dropdown')) {
        $('.dropdown').removeClass('is-active');
      }

      if ($(target).is('.kill-drop')) {
        $('.dropdown').removeClass('is-active');
      }
    });
    if ($('#drop-actions-' + u).hasClass('is-active')) {
      $('#drop-actions-' + u).removeClass('is-active');
    } else {
      $('#drop-actions-' + u).addClass('is-active');
    }
  }

  getFakeAvatar(name: string) {
    if (name) {
      return name[0];
    } else {
      return '';
    }
  }

  setType(type: any) {
    this.filterType = type;
  }

  getOperacionesRealizadas() {
    let total = 0;
    for (let o = 0; o < this.operations.length; o++) {
      if (this.operations[o].status == 'ANULADA') {
        total++;
      }
      total++;
    }
    return total;
  }

  upper(nit: string) {
    if (nit) {
      return nit.toUpperCase();
    }
    return '';
  }

  getTotal() {
    let total = 0;
    for (let i = 0; i < this.operations.length; i++) {
      total = total + parseFloat(this.operations[i].total);
    }
    return total;
  }

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

}
