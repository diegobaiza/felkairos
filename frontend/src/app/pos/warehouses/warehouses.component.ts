import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { WarehousesService } from 'src/app/services/warehouse.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { BranchesService } from 'src/app/services/branches.service';
import * as $ from 'jquery';

declare var notyf: any;

@Component({
  selector: 'app-warehouses',
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.css']
})
export class WarehousesComponent implements OnInit {

  warehouses: any = [];
  branches: any = [];

  warehouseForm: FormGroup;
  id: number = 0;
  index: number = 0;

  apiUrl: string = environment.api;

  constructor(
    private warehousesService: WarehousesService,
    private branchesService: BranchesService
  ) {
    this.warehouseForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      number: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.required),
      branchId: new FormControl(null, Validators.required)
    });
  }

  ngOnInit(): void {
    this.getWarehouses();
    this.getBranches();
  }

  getWarehouses() {
    $('.has-loader').addClass('has-loader-active');
    this.warehousesService.getWarehouses().then(warehouse => {
      if (warehouse.result) {
        this.warehouses = warehouse.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  getBranches() {
    this.branchesService.getBranches().then(branch => {
      if (branch.result) {
        this.branches = branch.data;
      }
    });
  }

  postWarehouse(e: any) {
    if (this.validation(e)) {
      $('#bt-add-warehouse').addClass('is-loading');
      this.warehousesService.postWarehouse(this.warehouseForm.value).then(warehouse => {
        if (warehouse.result) {
          this.warehouses.push(warehouse.data);
          this.list();
          notyf.open({ type: 'success', message: warehouse.message });
          $('#add-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Agregar' });
        }
        $('#bt-add-warehouse').removeClass('is-loading');
      });
    }
  }

  putWarehouse(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-warehouse').addClass('is-loading');
      this.warehousesService.putWarehouse(this.id, this.warehouseForm.value).then(warehouse => {
        if (warehouse.result == true) {
          this.warehouses[this.index].name = this.warehouseForm.controls['name'].value;
          this.warehouses[this.index].number = this.warehouseForm.controls['number'].value;
          this.warehouses[this.index].address = this.warehouseForm.controls['address'].value;
          this.warehouses[this.index].phone = this.warehouseForm.controls['phone'].value;
          this.warehouses[this.index].branchId = this.warehouseForm.controls['branchId'].value;
          this.list();
          notyf.open({ type: 'success', message: warehouse.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Actualizar' });
        }
        $('#bt-edit-warehouse').removeClass('is-loading');
      });
    }
  }

  deleteWarehouse(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-warehouse').addClass('is-loading');
      this.warehousesService.deleteWarehouse(this.id).then(res => {
        if (res.result) {
          this.warehouses.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-warehouse').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.warehouseForm.controls).forEach(key => {
      if (this.warehouseForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.warehouseForm.controls).forEach(key => {
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
    this.warehouseForm.controls['name'].setValue(i.name);
    this.warehouseForm.controls['number'].setValue(i.number);
    this.warehouseForm.controls['address'].setValue(i.address);
    this.warehouseForm.controls['phone'].setValue(i.phone);
    this.warehouseForm.controls['branchId'].setValue(i.branchId);
  }

  reset() {
    this.warehouseForm.reset();
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

}
