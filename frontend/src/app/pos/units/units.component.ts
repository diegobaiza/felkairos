import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { UnitsService } from 'src/app/services/units.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CompaniesService } from 'src/app/services/companies.service';
import jwt_decode from 'jwt-decode';
import * as $ from 'jquery';

declare var notyf: any;

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.css']
})
export class UnitsComponent implements OnInit {

  units: any = [];

  unitForm: FormGroup;
  id: number = 0;
  index: number = 0;

  companyId: number = 0;
  company: any;

  apiUrl: string = environment.api;

  constructor(
    private unitsService: UnitsService,
    private companiesService: CompaniesService
  ) {
    this.unitForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      symbol: new FormControl(null, Validators.required)
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getUnits();
    this.getCompany();
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company) {
        // this.company = company.data;
      }
    });
  }

  getUnits() {
    $('.has-loader').addClass('has-loader-active');
    this.unitsService.getUnits().then(units => {
      if (units.result) {
        this.units = units.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postUnit(e: any) {
    this.unitsService.postUnit(this.unitForm.value).then(unit => {
      if (unit.result) {
        this.units.push(unit.data);
        this.list();
        notyf.open({ type: 'success', message: unit.message });
        $('#add-user-panel').removeClass('is-active');
        this.keyboard(e);
      } else {
        notyf.open({ type: 'error', message: unit.message });
      }
      $('#bt-add-unit').removeClass('is-loading');
    });
  }

  putUnit(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-unit').addClass('is-loading');
      this.unitsService.putUnit(this.id, this.unitForm.value).then(unit => {
        if (unit.result == true) {
          this.units[this.index].name = this.unitForm.controls['name'].value;
          this.units[this.index].symbol = this.unitForm.controls['symbol'].value;
          this.list();
          notyf.open({ type: 'success', message: unit.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: unit.message });
        }
        $('#bt-edit-unit').removeClass('is-loading');
      });
    }
  }

  deleteUnit(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-unit').addClass('is-loading');
      this.unitsService.deleteUnit(this.id).then(res => {
        if (res.result) {
          this.units.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-unit').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.unitForm.controls).forEach(key => {
      if (this.unitForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.unitForm.controls).forEach(key => {
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
    this.unitForm.controls['name'].setValue(i.name);
    this.unitForm.controls['symbol'].setValue(i.symbol);
  }

  reset() {
    this.unitForm.reset();
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
