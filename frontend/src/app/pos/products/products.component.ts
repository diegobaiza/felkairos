import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ProductsService } from 'src/app/services/products.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { KardexsService } from 'src/app/services/kardex.service';
import * as moment from 'moment';
import { UnitsService } from 'src/app/services/units.service';
import { RecipesService } from 'src/app/services/recipes.service';
import { AttributesService } from 'src/app/services/attributes.service';
import { VariationsService } from 'src/app/services/variations.service';
import { ProductsCategoriesService } from 'src/app/services/productsCategories.service';
import Swal from 'sweetalert2';

declare var notyf: any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  products: any = [];
  units: any = [];
  recipes: any = [];
  variations: any = [];
  attributes: any = [];
  productsCategories: any = [];

  variationId: number = 0;
  variations2: any = [];
  product: any;
  description: string = '';

  productForm: FormGroup;
  id: number = 0;
  index: number = 0;
  companyId: number = 0;
  company: any;

  apiUrl: string = environment.api;

  database: any = localStorage.getItem('database');
  productCategoryForm: any;

  constructor(
    private productsService: ProductsService,
    private unitsService: UnitsService,
    private recipesService: RecipesService,
    private attributesService: AttributesService,
    private variationService: VariationsService,
    private productsCategoriesService: ProductsCategoriesService,
  ) {
    this.productForm = new FormGroup({
      image: new FormControl(null),
      name: new FormControl(null, [Validators.required]),
      sku: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
      cost: new FormControl(null, [Validators.required]),
      price: new FormControl(null, [Validators.required]),
      unitId: new FormControl(1, [Validators.required]),
      equivalence: new FormControl(1, [Validators.required]),
      entryUnitId: new FormControl(1, [Validators.required]),
      recipes: new FormControl([]),
      variations: new FormControl([]),
      productCategoryId: new FormControl(1, [Validators.required])
    });

  }
  ngOnInit(): void {
    this.getProducts();
    this.getUnits();
    this.getAttributes();
    this.getProductsCategories();
  }

  getProducts() {
    $('.has-loader').addClass('has-loader-active');
    this.productsService.getProducts().then(product => {
      if (product.result) {
        this.products = product.data;
        this.list();
        AppComponent.profile();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  getUnits() {
    this.unitsService.getUnits().then(units => {
      if (units.result) {
        this.units = units.data;
        this.list();
      }
    });
  }

  getAttributes() {
    this.attributesService.getAttributes().then(attributes => {
      if (attributes.result) {
        this.attributes = attributes.data;
        this.list();
      }
    });
  }

  getProductsCategories() {
    this.productsCategoriesService.getProductsCategories().then(productsCategories => {
      if (productsCategories.result) {
        this.productsCategories = productsCategories.data;
        this.list();
      }
    });
  }

  postProduct(e: any) {
    if (this.validation(e)) {
      $('#bt-add-product').addClass('is-loading');
      this.productsService.postProduct(this.productForm.value).then(product => {
        if (product.result) {
          this.products.push(product.data);
          this.list();
          notyf.open({ type: 'success', message: product.message });
          $('#add-product-panel').removeClass('is-active');
          $('#bt-add-product').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Agregar' });
        }
        $('#bt-add-product').removeClass('is-loading');
      });
    }
  }

  putProduct(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-product').addClass('is-loading');
      this.productsService.putProduct(this.id, this.productForm.value).then(product => {
        if (product.result == true) {
          this.products[this.index].name = this.productForm.controls['name'].value;
          this.products[this.index].image = this.productForm.controls['image'].value;
          this.products[this.index].sku = this.productForm.controls['sku'].value;
          this.products[this.index].type = this.productForm.controls['type'].value;
          this.products[this.index].cost = this.productForm.controls['cost'].value;
          this.products[this.index].price = this.productForm.controls['price'].value;
          this.products[this.index].unitId = this.productForm.controls['unitId'].value;
          this.products[this.index].equivalence = this.productForm.controls['equivalence'].value;
          this.products[this.index].entryUnitId = this.productForm.controls['entryUnitId'].value;
          this.products[this.index].productCategoryId = this.productForm.controls['productCategoryId'].value;
          this.list();
          notyf.open({ type: 'success', message: product.message });
          $('#edit-product-panel').removeClass('is-active');
          $('#bt-edit-product').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Actualizar' });
        }
        $('#bt-edit-product').removeClass('is-loading');
      });
    }
  }

  deleteProduct(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-product').addClass('is-loading');
      this.productsService.deleteProduct(this.id).then(res => {
        if (res.result) {
          this.products.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-product-panel').removeClass('is-active');
          $('#bt-delete-product').removeClass('is-loading');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-product').removeClass('is-loading');
      });
    }
  }

  costTotal() {
    let cost = 0;
    for (let i = 0; i < this.recipes.length; i++) {
      cost += parseFloat(this.recipes[i].cost) / parseFloat(this.recipes[i].equivalence) * parseFloat(this.recipes[i].quantity);
    }
    this.productForm.controls['cost'].setValue(cost);
    this.productForm.controls['recipes'].setValue(this.recipes);
  }

  postImage() {
    let file: any = document.querySelector('input[type=file]');
    this.productsService.postImage(this.id, file.files[0], this.database).then(res => {
      if (res.result) {
        this.productForm.controls['image'].setValue(res.image);
        this.products[this.index].image = res.image;
        $('#upload').addClass('is-hidden');
        $('#uploaded').removeClass('is-hidden');
        $('#uploaded-btn').removeClass('is-hidden');
        $('#upload-btn').addClass('is-hidden');
        AppComponent.list();
        notyf.open({ type: 'success', message: res.message });
      } else {
        notyf.open({ type: 'error', message: 'Error' });
      }
    });
  }

  deleteImage() {
    this.productsService.deleteImage(this.database, this.id).then(product => {
      if (product.result) {
        this.productForm.controls['image'].setValue(null);
        this.products[this.index].image = null;
        $('#upload').addClass('is-hidden');
        $('#uploaded').removeClass('is-hidden');
        $('#uploaded-btn').removeClass('is-hidden');
        $('#upload-btn').addClass('is-hidden');
        AppComponent.list();
        notyf.open({ type: 'success', message: product.message });
      } else {
        notyf.open({ type: 'error', message: product.message });
      }
    });
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.productForm.controls).forEach(key => {
      if (this.productForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.productForm.controls).forEach(key => {
      let input = e.target.querySelector("input[formControlName^='" + [key] + "']");
      if (input) {
        input.blur();
      }
    });
    return true;
  }

  panelVariation() {
    $('#select-variation-panel').addClass('is-active');
  }

  panelReceta() {
    $('#select-receta-panel').addClass('is-active');
  }

  async setProduct(i: any, description: any = false, variationChoose = false) {

    if (i.type == 'COMBO') {
      if (i.recipes.length > 0) {

        for (let r = 0; r < i.recipes.length; r++) {

          let prod = await this.productsService.getProduct(i.recipes[r].productRecipeId);

          let exist = false;
          for (let m = 0; m < this.recipes.length; m++) {
            if (this.recipes[m].productRecipeId == i.recipes[r].productRecipeId) {
              exist = true;
              break;
            }
          }


          if (!exist) {
            this.recipes.push({
              id: null,
              image: prod.data.image,
              name: `${prod.data.name}`,
              sku: prod.data.sku,
              cost: prod.data.cost,
              price: prod.data.price,
              quantity: i.recipes[r].quantity,
              productRecipeId: i.recipes[r].productRecipeId,
              unit: prod.data.unit,
              variationId: i.recipes[r].variationId,
              equivalence: prod.data.equivalence
            });
          } else {
            notyf.open({ type: 'warning', message: `${prod.data.name} ya esta en la receta` });
            return;
          }

        }
        this.costTotal();
        this.productForm.controls['recipes'].setValue(this.recipes);
        notyf.open({ type: 'success', message: 'Productos agregados' });
        $('#select-receta-panel').removeClass('is-active');
        $('#select-variation2-panel').removeClass('is-active');
      } else {
        notyf.open({ type: 'error', message: 'Este COMBO no contiene receta' });
      }
      return;
    }

    if (!description) {
      variationChoose ? description = this.description : description = i.name;
      this.description = '';
    }

    if (variationChoose == false) {
      if (i.variations.length > 0) {
        this.variations2 = i.variations;
        this.description = description;
        this.product = i;
        $('#select-receta-panel').removeClass('is-active');
        $('#select-variation2-panel').addClass('is-active');
        AppComponent.list();
        return;
      }
    }

    let prod = await this.productsService.getProduct(i.id);

    let exist = false;
    for (let m = 0; m < this.recipes.length; m++) {
      if (this.recipes[m].productRecipeId == i.id) {
        exist = true;
      }
    }

    if (!exist) {
      this.recipes.push({
        id: null,
        image: i.image,
        name: description,
        sku: i.sku,
        cost: i.cost,
        price: i.price,
        quantity: 1,
        productRecipeId: i.id,
        unit: prod.data.unit,
        variationId: this.variationId,
        productCategoryId: i.productCategoryId,
        equivalence: i.equivalence
      });
    } else {
      notyf.open({ type: 'warning', message: `${prod.data.name} ya esta en la receta` });
      return;
    }

    this.variationId = 0;
    this.costTotal();
    this.productForm.controls['recipes'].setValue(this.recipes);
    notyf.open({ type: 'success', message: 'Producto agregado' });
    $('#select-receta-panel').removeClass('is-active');
    $('#select-variation2-panel').removeClass('is-active');
  }

  setVariation(i: any) {
    this.description += ` ${i.attribute.symbol}`
    this.variationId = i.id;
    this.setProduct(this.product, this.description, true);
  }

  async deleteRecipe(u: number, i: any = null) {
    if (i.id != null) {
      let recipe = await this.recipesService.deleteRecipe(i.id);
      if (recipe.result == false) {
        notyf.open({ type: 'error', message: 'Error al eliminar componente' });
        return;
      }
    }
    this.recipes.splice(u, 1);
    this.costTotal();
    this.productsService.putProduct(this.id, this.productForm.value);
    notyf.open({ type: 'success', message: 'Producto eliminado' });
  }

  async setAttribute(i: any) {
    for (let v = 0; v < this.variations.length; v++) {
      if (i.id == this.variations[v].attributeId) {
        notyf.open({ type: 'error', message: `${i.name} ya ha sido agregado como atributo` });
        return;
      }
    }
    this.variations.push({
      id: null,
      name: i.name,
      symbol: i.symbol,
      attributeId: i.id
    });
    this.productForm.controls['variations'].setValue(this.variations);
    notyf.open({ type: 'success', message: 'Variación agregada' });
    // $('#select-variation-panel').removeClass('is-active');
  }

  async deleteVariation(u: number, i: any = null) {
    if (i.id != null) {
      let variation = await this.variationService.deleteVariation(i.id);
      if (variation.result) {
        this.variations.splice(u, 1);
        notyf.open({ type: 'success', message: 'Variacion eliminada' });
      } else {
        notyf.open({ type: 'error', message: 'Error al eliminar variacion' });
      }
      return;
    }
    this.variations.splice(u, 1);
    notyf.open({ type: 'success', message: 'Variacion eliminada' });
  }

  selectedVariation(id: number) {
    for (let i = 0; i < this.variations.length; i++) {
      if (id == this.variations[i].attributeId) {
        return true;
      }
    }
    return false;
  }

  async setData(i: any, u: number) {
    let product = await this.productsService.getProduct(i.id);
    if (product.result) {
      product = product.data;
      this.index = u;
      this.id = product.id;
      this.productForm.controls['name'].setValue(product.name);
      this.productForm.controls['image'].setValue(product.image);
      this.productForm.controls['sku'].setValue(product.sku);
      this.productForm.controls['type'].setValue(product.type);
      this.productForm.controls['cost'].setValue(product.cost);
      this.productForm.controls['price'].setValue(product.price);
      this.productForm.controls['unitId'].setValue(product.unitId);
      this.productForm.controls['equivalence'].setValue(product.equivalence);
      this.productForm.controls['entryUnitId'].setValue(product.entryUnitId);
      this.productCategoryForm.controls['name'].setValue(i.name);
      this.recipes = [];
      this.variations = [];
      this.products.forEach(async (prod: any) => {
        await product.recipes.forEach(async (recipe: any) => {
          if (prod.id == recipe.productRecipeId) {
            let rec = await this.productsService.getProduct(prod.id);
            this.recipes.push({
              id: recipe.id,
              image: prod.image,
              name: prod.name,
              sku: prod.sku,
              cost: prod.cost,
              price: prod.price,
              quantity: recipe.quantity,
              productRecipeId: recipe.productRecipeId,
              unit: rec.data.unit,
              variationId: recipe.variationId,
              productCategoryId: recipe.productCategoryId,
              equivalence: prod.equivalence
            });
          }
        });
      });
      this.attributes.forEach(async (attr: any) => {
        await product.variations.forEach(async (variation: any) => {
          if (attr.id == variation.attributeId) {
            this.variations.push({
              id: variation.id,
              name: attr.name,
              symbol: attr.symbol,
              attributeId: variation.attributeId
            });
          }
        });
      });
    }
  }

  reset() {
    this.productForm.reset();
    this.recipes = [];
    this.productForm.controls['unitId'].setValue(1);
    this.productForm.controls['equivalence'].setValue(1);
    this.productForm.controls['entryUnitId'].setValue(1);
    this.productCategoryForm.controls['productCategoryId'].setValue(1);
    this.variations = [];
  }

  list() {
    AppComponent.admin();
    AppComponent.card();
  }

  formatDate(date: string) {
    return moment(date).format('DD-MM-YYYY HH:mm')
  }

  getFakeAvatar(name: string) {
    if (name) {
      return name[0];
    } else {
      return '';
    }
  }

  openDrop(u: string) {
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

  decimal(number: number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

}
