import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { AttributesService } from 'src/app/services/attributes.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CompaniesService } from 'src/app/services/companies.service';
import jwt_decode from 'jwt-decode';

declare var notyf: any;

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.css']
})
export class AttributesComponent implements OnInit {

  attributes: any = [];

  attributeForm: FormGroup;
  id: number = 0;
  index: number = 0;

  companyId: number;
  company: any;

  apiUrl: string = environment.api;

  constructor(
    private attributesService: AttributesService,
    private companiesService: CompaniesService
  ) {
    this.attributeForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      symbol: new FormControl(null, [Validators.required])
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getAttributes();
    this.getCompany();
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company) {
        this.company = company.data;
      }
    });
  }

  getAttributes() {
    $('.has-loader').addClass('has-loader-active');
    this.attributesService.getAttributes().then(attributes => {
      if (attributes.result) {
        this.attributes = attributes.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postAttribute(e: any) {
    this.attributesService.postAttribute(this.attributeForm.value).then(attribute => {
      if (attribute.result) {
        this.attributes.push(attribute.data);
        this.list();
        notyf.open({ type: 'success', message: attribute.message });
        $('#add-user-panel').removeClass('is-active');
        this.keyboard(e);
      } else {
        notyf.open({ type: 'error', message: attribute.message });
      }
      $('#bt-add-attribute').removeClass('is-loading');
    });
  }

  putAttribute(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-attribute').addClass('is-loading');
      this.attributesService.putAttribute(this.id, this.attributeForm.value).then(attribute => {
        if (attribute.result == true) {
          this.attributes[this.index].name = this.attributeForm.controls['name'].value;
          this.attributes[this.index].symbol = this.attributeForm.controls['symbol'].value;
          this.list();
          notyf.open({ type: 'success', message: attribute.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: attribute.message });
        }
        $('#bt-edit-attribute').removeClass('is-loading');
      });
    }
  }

  deleteAttribute(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-attribute').addClass('is-loading');
      this.attributesService.deleteAttribute(this.id).then(res => {
        if (res.result) {
          this.attributes.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-attribute').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.attributeForm.controls).forEach(key => {
      if (this.attributeForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.attributeForm.controls).forEach(key => {
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
    this.attributeForm.controls['name'].setValue(i.name);
    this.attributeForm.controls['symbol'].setValue(i.symbol);
  }

  reset() {
    this.attributeForm.reset();
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
