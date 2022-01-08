import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ProductsCategoriesService } from 'src/app/services/productsCategories.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CompaniesService } from 'src/app/services/companies.service';
import jwt_decode from 'jwt-decode';
import * as $ from 'jquery';

declare var notyf: any;

@Component({
  selector: 'app-productsCategories',
  templateUrl: './products-categories.component.html',
  styleUrls: ['./products-categories.component.css']
})
export class ProductsCategoriesComponent implements OnInit {

  productsCategories: any = [];

  productCategoryForm: FormGroup;
  id: number = 0;
  index: number = 0;

  companyId: number = 0;
  company: any;

  apiUrl: string = environment.api;

  constructor(
    private productsCategoriesService: ProductsCategoriesService,
    private companiesService: CompaniesService
  ) {
    this.productCategoryForm = new FormGroup({
      name: new FormControl(null, Validators.required)
    });
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getProductsCategories();
    this.getCompany();
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company) {
        // this.company = company.data;
      }
    });
  }

  getProductsCategories() {
    $('.has-loader').addClass('has-loader-active');
    this.productsCategoriesService.getProductsCategories().then(productsCategories => {
      if (productsCategories.result) {
        this.productsCategories = productsCategories.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postProductCategory(e: any) {
    this.productsCategoriesService.postProductCategory(this.productCategoryForm.value).then(productCategory => {
      if (productCategory.result) {
        this.productsCategories.push(productCategory.data);
        this.list();
        notyf.open({ type: 'success', message: productCategory.message });
        $('#add-user-panel').removeClass('is-active');
        this.keyboard(e);
      } else {
        notyf.open({ type: 'error', message: productCategory.message });
      }
      $('#bt-add-productCategory').removeClass('is-loading');
    });
  }

  putProductCategory(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-productCategory').addClass('is-loading');
      this.productsCategoriesService.putProductCategory(this.id, this.productCategoryForm.value).then(productCategory => {
        if (productCategory.result == true) {
          this.productsCategories[this.index].name = this.productCategoryForm.controls['name'].value;
          this.list();
          notyf.open({ type: 'success', message: productCategory.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: productCategory.message });
        }
        $('#bt-edit-productCategory').removeClass('is-loading');
      });
    }
  }

  deleteProductCategory(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-productCategory').addClass('is-loading');
      this.productsCategoriesService.deleteProductCategory(this.id).then(res => {
        if (res.result) {
          this.productsCategories.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-productCategory').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.productCategoryForm.controls).forEach(key => {
      if (this.productCategoryForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.productCategoryForm.controls).forEach(key => {
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
    this.productCategoryForm.controls['name'].setValue(i.name);
  }

  reset() {
    this.productCategoryForm.reset();
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
