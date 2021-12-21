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
import { ReportsService } from 'src/app/services/reports.service';

declare var notyf: any;

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {

  apiUrl: string = environment.api;

  branches: any = [];
  warehouses: any = [];
  products: any = [];
  variations: any = [];
  date: any = moment().format('YYYY-MM-DDTHH:mm');

  stocks: any = [];
  quantity: number = 0;
  stock: number = 0;

  total_stock: number = 0;
  total_branches: number = 0;
  total_warehouses: number = 0;
  total_products: number = 0;

  companyId: number = 0;
  company: any;

  description: string = '';

  branch: any = { id: null, name: 'Todas las sucursales' };
  warehouse: any = { id: null, name: 'Todas las bodegas' };
  product: any = { id: null, name: 'Todos los productos' };
  variation: any = { id: null, name: 'Todos las variaciones', attribute: { name: 'Todas las variaciones' } };

  placeloader = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  loader: boolean = false;
  auto_date: boolean = true;

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
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
    this.getCompany();
    AppComponent.admin();
    let myThis = this;
    setInterval(function () {
      if (myThis.auto_date) {
        myThis.date = moment().format('YYYY-MM-DDTHH:mm:ss');
      }
    }.bind(this), 1000);
  }

  async getStocks() {
    if (!this.branch.id && !this.branch.name) {
      notyf.open({ type: 'warning', message: 'Selecciona una Sucursal' });
      this.panelBranch();
      return;
    }
    if (this.warehouses.length > 0) {
      if (!this.warehouse.id && !this.warehouse.name) {
        notyf.open({ type: 'warning', message: 'Selecciona una Bodega' });
        this.panelWarehouse();
        return;
      }
    }
    $('#bt-search-stocks').addClass('is-loading');
    this.stocks = [];
    this.loader = true;
    let stocks = await this.kardexService.getStocks(this.date, this.branch.id, this.warehouse.id, this.product.id, this.variation.id);
    this.total_stock = stocks.total_stock;
    this.total_branches = stocks.total_branches;
    this.total_warehouses = stocks.total_warehouses;
    this.total_products = stocks.total_products;
    this.stocks = stocks.stocks;
    this.loader = false;
    $('#bt-search-stocks').removeClass('is-loading');
  }

  stockProduct(stocks: any) {
    let stock = 0;
    for (let i = 0; i < stocks.length; i++) {
      stock = stock + parseFloat(stocks[i].stock);
    }
    return stock;
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company.result) {
        this.company = company.data;
      }
    });
  }

  getBranches() {
    this.branchesService.getBranches().then(branches => {
      if (branches.result) {
        this.branches = branches.data;
        // this.setBranch(this.branches[0]);
      }
    });
  }

  async getWareHouses(branchId: number) {
    let warehouses = await this.warehouseService.getWarehousesBranch(branchId);
    if (warehouses.result) {
      this.warehouses = warehouses.data;
      // this.setWarehouse(this.warehouses[0]);
    }
  }

  async getProducts() {
    let products = await this.productsService.getProducts();
    if (products.result) {
      for (let p = 0; p < products.data.length; p++) {
        products.data[p].variations.sort(function (a: any, b: any) {
          return a.id - b.id;
        });
        this.products.push(products.data[p]);
      }
    }
  }

  getCost(cost: number, stock: number) {
    let total = (cost / 1.12) * stock;
    return this.decimal(total);
  }

  getTotalCost() {
    let total = 0;
    for (let b = 0; b < this.stocks.length; b++) {
      for (let w = 0; w < this.stocks[b].warehouses.length; w++) {
        for (let p = 0; p < this.stocks[b].warehouses[w].products.length; p++) {
          if (this.stocks[b].warehouses[w].products[p].data.length > 1) {
            for (let d = 0; d < this.stocks[b].warehouses[w].products[p].data.length; d++) {
              let cost = this.stocks[b].warehouses[w].products[p].costProm.cost;
              let stock = this.stocks[b].warehouses[w].products[p].data[d].stock;
              total = parseFloat(this.decimal(total)) + ((cost / 1.12) * stock);
            }
          } else {
            let cost = this.stocks[b].warehouses[w].products[p].costProm.cost;
            let stock = this.stocks[b].warehouses[w].products[p].data[0].stock;
            total = parseFloat(this.decimal(total)) + ((cost / 1.12) * stock);
          }
        }
      }
    }
    return this.decimal(total)
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

  panelDate() {
    $('#select-date-panel').addClass('is-active');
  }

  async setBranch(i: any = null) {
    if (i == null) {
      this.branch = { id: null, name: 'Todas las sucursales' };
      this.warehouse = { id: null, name: 'Todas las bodegas' };
      this.warehouses = [];
    } else {
      this.branch = i;
      await this.getWareHouses(i.id);
      this.panelWarehouse();
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

  async setProduct(i: any = null, description: any = false, variationChoose = false) {
    $('#select-product-panel').removeClass('is-active');
    if (i == null) {
      this.product = { id: null, name: 'Todos los productos' };
      this.variation = { id: null, name: 'Todas las variaciones', attribute: { name: 'Todas las variaciones' } };
      this.variations = [];
      this.panelBranch();
    } else {
      this.product = i;
      if (!description) {
        variationChoose ? description = this.description : description = i.name;
        this.description = '';
      }

      if (variationChoose == false) {
        this.variations = i.variations;
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
          this.variation = { id: null, name: 'Todas las variaciones', attribute: { name: 'Todas las variaciones' } };
        }
      } else {
        this.panelBranch();
      }
    }
  }

  setVariation(i: any = null) {
    $('#select-variation-panel').removeClass('is-active');
    if (i == null) {
      this.variation = { id: null, name: 'Todas las variaciones', attribute: { name: 'Todas las variaciones' } };
    } else {
      this.variation = i;
      this.description += ` ${i.attribute.symbol}`
    }
    this.setProduct(this.product, this.description, true);
  }

  async reportStocks() {
    let name = 'Reporte de Existencias';
    name += ` | ${this.company.name}`
    if (this.branch.id) {
      name += ` | ${this.branch.name}`
    }
    if (this.warehouse.id) {
      name += ` | ${this.warehouse.name}`
    }
    if (this.product.id) {
      name += ` | ${this.product.name}`
    }
    if (this.variation.id) {
      name += ` | ${this.variation.attribute.name}`
    }
    $('#bt-report-stocks').addClass('is-loading');
    $('#bt-report-stocks2').addClass('is-loading');
    this.to(`${this.apiUrl}/${this.company.database}/stocks/${this.date}/${this.branch.id}/${this.warehouse.id}/${this.product.id}/${this.variation.id}/${name}`);
    $('#bt-report-stocks').removeClass('is-loading');
    $('#bt-report-stocks2').removeClass('is-loading');
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

  decimal(number: number) {
    return (Math.round((number + Number.EPSILON) * 100) / 100).toFixed(2);
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
