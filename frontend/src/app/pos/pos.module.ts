import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgApexchartsModule } from 'ng-apexcharts';

import { AuthGuardService } from '../services/auth-guard.service';

import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

import { PosComponent } from './pos.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountComponent } from './account/account.component';
import { UsersComponent } from './users/users.component';
import { CustomersComponent } from './customers/customers.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { BranchesComponent } from './branches/branches.component';
import { ProductsComponent } from './products/products.component';
import { DocumentsComponent } from './documents/documents.component';
import { OperationsComponent } from './operations/operations.component';
import { AddOperationComponent } from './operations/add-operation/add-operation.component';
import { InvoiceOperationComponent } from './operations/invoice-operation/invoice-operation.component';
import { CompanyComponent } from './company/company.component';
import { WarehousesComponent } from './warehouses/warehouses.component';
import { KardexComponent } from './kardex/kardex.component';
import { UnitsComponent } from './units/units.component';
import { AttributesComponent } from './attributes/attributes.component';
import { CouponsComponent } from './coupons/coupons.component';
import { StocksComponent } from './stocks/stocks.component';

const routes: Routes = [
  {
    path: '', component: PosComponent, canActivate: [AuthGuardService],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'operations' },
      { path: 'users', component: UsersComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'branches', component: BranchesComponent },
      { path: 'warehouses', component: WarehousesComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'operations', component: OperationsComponent },
      { path: 'operations/add/:documentId', component: AddOperationComponent },
      { path: 'operations/add/:documentId/op/:operationId', component: AddOperationComponent },
      { path: 'operations/invoice/:id', component: InvoiceOperationComponent },
      { path: 'kardex', component: KardexComponent },
      { path: 'stocks', component: StocksComponent },
      { path: 'units', component: UnitsComponent },
      { path: 'attributes', component: AttributesComponent },
      { path: 'coupons', component: CouponsComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'account', component: AccountComponent },
      { path: 'company', component: CompanyComponent },
      { path: '**', pathMatch: 'full', redirectTo: 'operations' }
    ]
  }
];

@NgModule({
  declarations: [
    PosComponent,
    AccountComponent,
    UsersComponent,
    DocumentsComponent,
    CustomersComponent,
    SuppliersComponent,
    BranchesComponent,
    ProductsComponent,
    OperationsComponent,
    DashboardComponent,
    AddOperationComponent,
    InvoiceOperationComponent,
    CompanyComponent,
    WarehousesComponent,
    KardexComponent,
    UnitsComponent,
    AttributesComponent,
    CouponsComponent,
    StocksComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxDaterangepickerMd.forRoot(),
    NgApexchartsModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]
})
export class PosModule { }
