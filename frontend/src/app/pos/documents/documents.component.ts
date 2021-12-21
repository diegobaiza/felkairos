import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { DocumentsService } from 'src/app/services/documents.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { TypeDocumentsService } from 'src/app/services/typeDocuments.service';
import jwt_decode from 'jwt-decode';
import { PosComponent } from '../pos.component';
import { CompaniesService } from 'src/app/services/companies.service';
import * as moment from 'moment';
import { BranchesService } from 'src/app/services/branches.service';
import { WarehousesService } from 'src/app/services/warehouse.service';

declare var notyf: any;

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  documents: any = [];
  typeDocuments: any = [];
  branches: any = [];
  warehouses: any = [];

  documentForm: FormGroup;
  id: number = 0;
  index: number = 0;

  apiUrl: string = environment.api;

  filter: any;

  companyId: number = 0;
  company: any;

  constructor(
    private documentsService: DocumentsService,
    private typeDocumentsService: TypeDocumentsService,
    private companyService: CompaniesService,
    private branchesService: BranchesService,
    private warehousesService: WarehousesService
  ) {
    this.documentForm = new FormGroup({
      image: new FormControl(null),
      name: new FormControl(null, [Validators.required]),
      serie: new FormControl(null, [Validators.required]),
      correlative: new FormControl(null, [Validators.required]),
      primaryColor: new FormControl(null),
      secondaryColor: new FormControl(null),
      typeDocumentId: new FormControl(1, [Validators.required]),
      branchId: new FormControl(null, [Validators.required]),
      warehouseId: new FormControl(null),
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getDocuments();
    this.getTypeDocuments();
    this.getCompany();
    this.getBranches();
  }

  getCompany() {
    this.companyService.getCompany(this.companyId).then(company => {
      if (company.result) {
        this.company = company.data;
        PosComponent.u_logo = company.data.image;
      };
    });
  }

  getBranches() {
    this.branchesService.getBranches().then(branches => {
      if (branches.result) {
        this.branches = branches.data;
      }
    });
  }

  getWarehouses() {
    this.documentForm.controls['warehouseId'].setValue(null);
    this.warehousesService.getWarehousesBranch(this.documentForm.controls['branchId'].value).then(warehouses => {
      if (warehouses.result) {
        this.warehouses = warehouses.data;

        if (this.warehouses.length > 0) {
          this.documentForm.controls['warehouseId'].setValidators([Validators.required]);
        } else {
          this.documentForm.controls['warehouseId'].clearValidators();
        }
        this.documentForm.controls['warehouseId'].updateValueAndValidity();
      }
    });
  }

  getDocuments() {
    $('.has-loader').addClass('has-loader-active');
    this.documentsService.getDocuments().then(document => {
      if (document.result) {
        this.documents = document.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  getTypeDocuments() {
    this.typeDocumentsService.getTypeDocuments().then(typeDocument => {
      if (typeDocument.result) {
        this.typeDocuments = typeDocument.data;
      }
    });
  }

  async postDocument(e: any) {
    if (this.validation(e)) {
      $('#bt-add-document').addClass('is-loading');
      let document = await this.documentsService.postDocument(this.documentForm.value);
      if (document.result) {
        let res = await this.documentsService.postImage({
          database: this.company.database,
          documentId: document.data.id,
          primaryColor: this.documentForm.controls['primaryColor'].value,
          secondaryColor: this.documentForm.controls['secondaryColor'].value
        });
        if (res.result) {
          this.getDocuments();
          this.list();
          notyf.open({ type: 'success', message: document.message });
          $('#add-user-panel').removeClass('is-active');
          $('#bt-add-document').removeClass('is-loading');
          this.keyboard(e);
        }
      } else {
        notyf.open({ type: 'error', message: 'Error al Agregar' });
      }
      $('#bt-add-document').removeClass('is-loading');
    }
  }

  putDocument(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-document').addClass('is-loading');
      this.documentsService.putDocument(this.id, this.documentForm.value).then(document => {
        if (document.result == true) {
          this.documentsService.postImage({
            database: this.company.database,
            documentId: this.id,
            primaryColor: this.documentForm.controls['primaryColor'].value,
            secondaryColor: this.documentForm.controls['secondaryColor'].value
          }).then(res => {
            if (res.result) {
              this.documentForm.controls['image'].setValue(res.image);
              this.documents[this.index].image = res.image;
              this.list();
              notyf.open({ type: 'success', message: document.message });
              $('#edit-user-panel').removeClass('is-active');
              $('#bt-edit-document').removeClass('is-loading');
              this.keyboard(e);
            } else {
              notyf.open({ type: 'error', message: 'Error' });
            }
          });
        } else {
          notyf.open({ type: 'error', message: 'Error al Actualizar' });
        }
        $('#bt-edit-document').removeClass('is-loading');
      });
    }
  }

  deleteDocument(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-document').addClass('is-loading');
      this.documentsService.deleteDocument(this.id).then(res => {
        if (res.result) {
          this.documents.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          $('#bt-delete-document').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-document').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.documentForm.controls).forEach(key => {
      if (this.documentForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.documentForm.controls).forEach(key => {
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
    this.documentForm.controls['name'].setValue(i.name);
    this.documentForm.controls['image'].setValue(i.image);
    this.documentForm.controls['serie'].setValue(i.serie);
    this.documentForm.controls['correlative'].setValue(i.correlative);
    this.documentForm.controls['primaryColor'].setValue(i.primaryColor);
    this.documentForm.controls['secondaryColor'].setValue(i.secondaryColor);
    this.documentForm.controls['typeDocumentId'].setValue(i.typeDocumentId);
    this.documentForm.controls['branchId'].setValue(i.branchId);
    this.getWarehouses();
    this.documentForm.controls['warehouseId'].setValue(i.warehouseId);
  }

  reset() {
    this.documentForm.reset();
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
