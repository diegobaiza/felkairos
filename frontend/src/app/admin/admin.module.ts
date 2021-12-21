import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AdminComponent } from './admin.component';
import { UsersComponent } from './users/users.component';
import { CompaniesComponent } from './companies/companies.component';
import { AddCompanyComponent } from './companies/add-company/add-company.component';


const routes: Routes = [
  {
    path: '', component: AdminComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'companies' },
      { path: 'companies', component: CompaniesComponent },
      { path: 'companies/add', component: AddCompanyComponent },
      { path: 'users', component: UsersComponent },
      { path: '**', pathMatch: 'full', redirectTo: 'companies' }
    ]
  }
];

@NgModule({
  declarations: [
    AdminComponent,
    UsersComponent,
    CompaniesComponent,
    AddCompanyComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
})
export class AdminModule { }
