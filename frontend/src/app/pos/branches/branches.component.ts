import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { BranchesService } from 'src/app/services/branches.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { WarehousesService } from 'src/app/services/warehouse.service';

declare var notyf: any;

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.css']
})
export class BranchesComponent implements OnInit {

  branches: any = [];
  warehouses: any = [];

  branchForm: FormGroup;
  id: number = 0;
  index: number = 0;

  apiUrl: string = environment.api;

  constructor(
    private branchesService: BranchesService
  ) {
    this.branchForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      number: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    this.getBranches();
  }

  getBranches() {
    $('.has-loader').addClass('has-loader-active');
    this.branchesService.getBranches().then(branch => {
      if (branch.result) {
        this.branches = branch.data;
        this.list();
      }
      $('.has-loader').removeClass('has-loader-active');
      $('.has-loader').addClass('is-hidden');
    });
  }

  postBranch(e: any) {
    if (this.validation(e)) {
      $('#bt-add-branch').addClass('is-loading');
      this.branchesService.postBranch(this.branchForm.value).then(branch => {
        if (branch.result) {
          this.branches.push(branch.data);
          this.list();
          notyf.open({ type: 'success', message: branch.message });
          $('#add-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Agregar' });
        }
        $('#bt-add-branch').removeClass('is-loading');
      });
    }
  }

  putBranch(e: any) {
    if (this.validation(e)) {
      $('#bt-edit-branch').addClass('is-loading');
      this.branchesService.putBranch(this.id, this.branchForm.value).then(branch => {
        if (branch.result == true) {
          this.branches[this.index].name = this.branchForm.controls['name'].value;
          this.branches[this.index].number = this.branchForm.controls['number'].value;
          this.branches[this.index].address = this.branchForm.controls['address'].value;
          this.branches[this.index].phone = this.branchForm.controls['phone'].value;
          this.list();
          notyf.open({ type: 'success', message: branch.message });
          $('#edit-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Actualizar' });
        }
        $('#bt-edit-branch').removeClass('is-loading');
      });
    }
  }

  deleteBranch(e: any) {
    if (this.validation(e)) {
      $('#bt-delete-branch').addClass('is-loading');
      this.branchesService.deleteBranch(this.id).then(res => {
        if (res.result) {
          this.branches.splice(this.index, 1);
          this.list();
          notyf.open({ type: 'success', message: res.message });
          $('#delete-user-panel').removeClass('is-active');
          this.keyboard(e);
        } else {
          notyf.open({ type: 'error', message: 'Error al Eliminar' });
        }
        $('#bt-delete-branch').removeClass('is-loading');
      });
    }
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.branchForm.controls).forEach(key => {
      if (this.branchForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.branchForm.controls).forEach(key => {
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
    this.branchForm.controls['name'].setValue(i.name);
    this.branchForm.controls['number'].setValue(i.number);
    this.branchForm.controls['address'].setValue(i.address);
    this.branchForm.controls['phone'].setValue(i.phone);
  }

  reset() {
    this.branchForm.reset();
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
