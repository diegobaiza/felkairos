import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { CouponsService } from 'src/app/services/coupons.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CompaniesService } from 'src/app/services/companies.service';
import jwt_decode from 'jwt-decode';

declare var notyf: any;

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.css']
})
export class CouponsComponent implements OnInit {

  coupons: any = [];

  couponForm: FormGroup;
  id: number = 0;
  index: number = 0;

  companyId: number;
  company: any;

  apiUrl: string = environment.api;

  constructor(
    private couponsService: CouponsService,
    private companiesService: CompaniesService
  ) {
    this.couponForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      code: new FormControl(null, [Validators.required]),
      amount: new FormControl(null, [Validators.required])
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getCoupons();
    this.getCompany();
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company) {
        this.company = company.data;
      }
    });
  }

  getCoupons() {
    $('.has-loader').addClass('has-loader-active');
    this.couponsService.getCoupons().then(coupons => {
      if (coupons.result) {
        this.coupons = coupons.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postCoupon(e: any) {
    this.couponsService.postCoupon(this.couponForm.value).then(coupon => {
      if (coupon.result) {
        this.coupons.push(coupon.data);
        this.list();
        notyf.open({ type: 'success', message: coupon.message });
        $('#add-user-panel').removeClass('is-active');
        this.keyboard(e);
      } else {
        notyf.open({ type: 'error', message: coupon.message });
      }
      $('#bt-add-coupon').removeClass('is-loading');
    });
  }

  putCoupon(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-coupon').addClass('is-loading');
      this.couponsService.putCoupon(this.id, this.couponForm.value).then(coupon => {
        if (coupon.result == true) {
          this.coupons[this.index].name = this.couponForm.controls['name'].value;
          this.coupons[this.index].code = this.couponForm.controls['code'].value;
          this.coupons[this.index].amount = this.couponForm.controls['amount'].value;
          this.list();
          notyf.open({ type: 'success', message: coupon.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: coupon.message });
        }
        $('#bt-edit-coupon').removeClass('is-loading');
      });
    }
  }

  deleteCoupon(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-coupon').addClass('is-loading');
      this.couponsService.deleteCoupon(this.id).then(res => {
        if (res.result) {
          this.coupons.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-coupon').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.couponForm.controls).forEach(key => {
      if (this.couponForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.couponForm.controls).forEach(key => {
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
    this.couponForm.controls['name'].setValue(i.name);
    this.couponForm.controls['code'].setValue(i.code);
    this.couponForm.controls['amount'].setValue(i.amount);
  }

  reset() {
    this.couponForm.reset();
  }

  list() {
    AppComponent.admin();
    AppComponent.card();
  }

  toFix(val: number) {
    return Math.round(val * 100) / 100;
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
