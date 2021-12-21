import { Component, OnInit } from '@angular/core';
import { KardexsService } from 'src/app/services/kardex.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { BranchesService } from 'src/app/services/branches.service';
import { WarehousesService } from 'src/app/services/warehouse.service';
import { ProductsService } from 'src/app/services/products.service';
import { AppComponent } from 'src/app/app.component';
import { CompaniesService } from 'src/app/services/companies.service';
import jwt_decode from 'jwt-decode';

declare var notyf: any;

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit {

  apiUrl: string = environment.api;

  branches: any = [];
  warehouses: any = [];
  products: any = [];
  variations: any = [];

  kardex: any = [];
  quantity: number = 0;
  stock: number = 0;

  company: any;

  description: string = '';

  branch: any = { id: null, name: '' };
  warehouse: any = { id: null, name: '' };
  product: any = { id: null, name: '' };
  variation: any = { id: null, name: '', attribute: { name: '' } };

  range: any = { startDate: moment().format('YYYY-MM-DD'), endDate: moment().format('YYYY-MM-DD') }
  ranges: any = {
    'Hoy': [moment(), moment()],
    'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Últimos 7 Dias': [moment().subtract(6, 'days'), moment()],
    'Últimos 30 Dias': [moment().subtract(29, 'days'), moment()],
    'Este Mes': [moment().startOf('month'), moment().endOf('month')],
    'Mes Pasado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  };

  constructor(
    private kardexService: KardexsService,
    private branchesService: BranchesService,
    private warehouseService: WarehousesService,
    private productsService: ProductsService,
    private companiesService: CompaniesService
  ) {
    AppComponent.admin();
  }

  ngOnInit(): void {
    this.getBranches();
    this.getProducts();
  }

  async getKardex() {
    if (!this.product.id) {
      notyf.open({ type: 'warning', message: 'Selecciona un Produto' });
      return;
    }
    if (!this.branch.id) {
      notyf.open({ type: 'warning', message: 'Selecciona una Sucursal' });
      this.panelBranch();
      return;
    }
    if (this.warehouses.length > 0) {
      if (!this.warehouse.id) {
        notyf.open({ type: 'warning', message: 'Selecciona una Bodega' });
        this.panelWarehouse();
        return;
      }
    }
    let kar = [];
    kar = await this.kardexService.getKardex(moment(this.range.startDate).format('YYYY-MM-DD'), moment(this.range.endDate).format('YYYY-MM-DD'), this.branch.id, this.warehouse.id, this.product.id, this.variation.id);
    if (kar.result) {
      this.kardex = []
      if (this.warehouses.length > 0) {
        for (let w = 0; w < this.warehouses.length; w++) {

          this.kardex.push({ warehouse: this.warehouses[w], data: [], variations: [] });

          if (this.product.variations && this.product.variations.length > 0 && this.variation.id == null) {

            this.product.variations.sort(function (a: any, b: any) {
              return a.id - b.id;
            });
            this.kardex[w].variations = this.product.variations;

            for (let v = 0; v < this.kardex[w].variations.length; v++) {
              this.kardex[w].variations[v].data = [];
              for (let c = 0; c < kar.data.length; c++) {
                if (this.kardex[w].variations[v].id == kar.data[c].variationId) {
                  this.kardex[w].variations[v].data.push(kar.data[c]);
                }
              }
            }
          } else {
            for (let k = 0; k < kar.data.length; k++) {
              if (this.warehouses[w].id == kar.data[k].warehouseId) {
                this.kardex[w].data.push(kar.data[k]);
              }
            }
          }

        }

      } else {
        this.kardex.push({ warehouse: this.branch, data: [] });
        for (let k = 0; k < kar.data.length; k++) {
          this.kardex[0].data.push(kar.data[k]);
        }
      }
    }
  }

  getBranches() {
    this.branches = [];
    this.branchesService.getBranches().then(branches => {
      if (branches.result) {
        this.branches = branches.data;
        // this.setBranch(this.branches[0]);
      }
    });
  }

  async getWareHouses(branchId: number) {
    this.warehouses = [];
    let warehouses = await this.warehouseService.getWarehousesBranch(branchId);
    if (warehouses.result) {
      this.warehouses = warehouses.data;
      // this.setWarehouse(this.warehouses[0]);
    }
  }

  getProducts() {
    this.products = [];
    this.productsService.getProducts().then(products => {
      if (products.result) {
        this.products = products.data;
        // this.products.forEach(function (e) {
        //   if (typeof e === "object") {
        //     e['selected'] = false;
        //   }
        // });
      }
    });
  }

  panelBranch() {
    $('#select-branch-panel').addClass('is-active');
  }

  panelWarehouse() {
    $('#select-warehouse-panel').addClass('is-active');
  }

  panelProduct() {
    $('#select-product-panel').addClass('is-active');
    $('#prod').blur();
    $('#prod').focus();
  }

  panelVariation() {
    $('#select-variation-panel').addClass('is-active');
    $('#vari').blur();
    $('#vari').focus();
  }

  async setBranch(i: any = null) {
    if (i == null) {
      this.branch = { id: null, name: '' };
    } else {
      this.branch = i;
      await this.getWareHouses(i.id);
      this.warehouse = { id: null, name: '' };

      if (this.warehouses.length > 0) {
        notyf.open({ type: 'warning', message: 'Selecciona una Bodega' });
        this.panelWarehouse();
        $('#select-branch-panel').removeClass('is-active');
        return;
      }
    }
    $('#select-branch-panel').removeClass('is-active');
  }

  setWarehouse(i: any = null) {
    if (i == null) {
      this.warehouse = { id: null, name: 'Todas las bodegas' };
    } else {
      this.warehouse = i;
    }
    $('#select-warehouse-panel').removeClass('is-active');
  }

  setProduct(i: any = null, description: any = false, variationChoose = false) {

    if (i == null) {
      this.product = { id: null, name: '' };
    } else {
      this.product = i;
    }

    if (!description) {
      variationChoose ? description = this.description : description = i.name;
      this.description = '';
    }

    if (variationChoose == false) {
      this.variations = i.variations;
      this.variations.sort(function (a: any, b: any) {
        return a.id - b.id;
      });
      if (this.variations.length > 0) {
        this.description = description;
        this.product = i;
        $('#select-product-panel').removeClass('is-active');
        $('#select-variation-panel').addClass('is-active');
        notyf.open({ type: 'warning', message: 'Selecciona una Variacion' });
        AppComponent.list();
        return;
      } else {
        this.panelBranch();
        this.variation = { id: null, name: '', attribute: { name: '' } };
      }
    } else {
      this.panelBranch();
    }
    $('#select-product-panel').removeClass('is-active');
    $('#select-variation-panel').removeClass('is-active');
  }

  setVariation(i: any = null) {
    if (i == null) {
      this.variation = { id: null, name: '', attribute: { name: '' } };
    } else {
      this.variation = i;
      this.description += ` ${i.attribute.symbol}`
    }

    this.setProduct(this.product, this.description, true);
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

}
