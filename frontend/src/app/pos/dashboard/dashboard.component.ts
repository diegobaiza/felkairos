import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { CompaniesService } from 'src/app/services/companies.service';
import { environment } from 'src/environments/environment';
import { DashboardService } from 'src/app/services/dashboard.service';
import { TypeDocumentsService } from 'src/app/services/typeDocuments.service';

import { ReportsService } from 'src/app/services/reports.service';

import { Chart } from 'chart.js';
import 'chartjs-plugin-labels';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public barChartType: any = 'bar';
  public pieChartType: any = 'pie';

  pieChart: any;
  barChart: any;

  companyId: number;
  company: any;

  dashboard: any = [];
  // opera
  counters: any;
  operations: any = [];
  ops: any;
  filterType: string = '';

  colors: any = ['#EF9A9A', '#F48FB1', '#CE93D8', '#9FA8DA', '#90CAF9', '#80CBC4', '#A5D6A7', '#E6EE9C', '#FFF59D', '#FFCC80', '#BCAAA4', '#BDBDBD', '#B0BEC5'];
  colors2: any = ['#E53935', '#D81B60', '#8E24AA', '#303F9F', '#1976D2', '#00897B', '#43A047', '#C0CA33', '#FFB300', '#FB8C00', '#6D4C41', '#616161', '#546E7A'];
  labels: any = [];
  months: any = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  date: any;

  apiUrl: string = environment.api;

  range: any = { startDate: moment(), endDate: moment() }
  ranges: any = {
    'Hoy': [moment(), moment()],
    'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Últimos 7 Dias': [moment().subtract(6, 'days'), moment()],
    'Últimos 30 Dias': [moment().subtract(29, 'days'), moment()],
    'Este Mes': [moment().startOf('month'), moment().endOf('month')],
    'Mes Pasado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  };
  dataLabelsDatasets: any;

  constructor(
    private companiesService: CompaniesService,
    private dashboardService: DashboardService,
    private reportsService: ReportsService,
    private typeDocumentsService: TypeDocumentsService
  ) {
    AppComponent.dash();
    AppComponent.admin();
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    this.companyId = token.companyId;
  }

  ngOnInit(): void {
    this.getCompany();
    this.getDashboardCounters();
    this.getTypeDocuments();
  }

  getDashboard() {
    const startDate = this.range.startDate.format('YYYY-MM-DD');
    const endDate = this.range.endDate.format('YYYY-MM-DD');
    this.dashboardService.getDashboard(startDate, endDate).then(dashboard => {
      this.dashboard = dashboard.data;
    });
  }

  getDashboardOperations() {
    const startDate = this.range.startDate.format('YYYY-MM-DD');
    const endDate = this.range.endDate.format('YYYY-MM-DD');
    this.dashboardService.getDashboardOperations(startDate, endDate).then(dashboard => {
      this.ops = dashboard.data;

      if (this.pieChart) {
        this.pieChart.destroy();
      }
      const pie: any = document.getElementById('pieChart');
      this.pieChart = new Chart(pie, {
        type: this.pieChartType,
        data: {
          labels: this.labels,
          datasets: [{
            data: [
              this.ops[0].count,
              this.ops[1].count,
              this.ops[2].count,
              this.ops[3].count,
              this.ops[4].count,
              this.ops[5].count,
              this.ops[6].count,
              this.ops[7].count,
              this.ops[8].count
            ],
            backgroundColor: this.colors,
            borderColor: this.colors2,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          legend: {
            position: 'left',
          }
        }
      });

      if (this.barChart) {
        this.barChart.destroy();
      }
      const bar: any = document.getElementById('barChart');
      this.barChart = new Chart(bar, {
        type: this.barChartType,
        data: {
          labels: this.labels,
          datasets: [{
            data: [
              this.ops[0].count,
              this.ops[1].count,
              this.ops[2].count,
              this.ops[3].count,
              this.ops[4].count,
              this.ops[5].count,
              this.ops[6].count,
              this.ops[7].count,
              this.ops[8].count
            ],
            backgroundColor: this.colors,
            borderColor: this.colors2,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          legend: {
            position: 'bottom',
            display: false
          }
        }
      });


    });
  }

  setDash(type: any) {
    this.operations = [];
    for (let i = 0; i < this.dashboard.length; i++) {
      if (this.dashboard[i].document.typedocument.name == type) {
        this.operations.push(this.dashboard[i]);
      }
    }
    $('#select-document-panel').addClass('is-active');
  }

  getTypeDocuments() {
    this.typeDocumentsService.getTypeDocuments().then(typeDocument => {
      if (typeDocument) {
        for (let i = 0; i < typeDocument.data.length; i++) {
          this.labels.push(typeDocument.data[i].name);
        }
      }
    });
  }

  generate() {
    this.operations = this.dashboard;
    $('#select-document-panel').addClass('is-active');
  }

  report() {
    let ids = [];
    for (let i = 0; i < this.operations.length; i++) {
      ids.push(this.operations[i].id);
    }
    $('#rep-button').addClass('is-loading');
    this.reportsService.reportOperations(ids).then(report => {
      if (report.result) {
        window.open(`${this.apiUrl}${report.url}`, '_blank');
      }
      $('#rep-button').removeClass('is-loading');
    });
  }

  getDashboardCounters() {
    this.dashboardService.getDashboardCounters().then(dashboard => {
      this.counters = dashboard.data;
    });
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company.result) {
        this.company = company.data;
      }
    });
  }

  getCurrency(code: string) {
    if (code == 'GTQ') {
      return 'Q';
    }
    if (code == 'USD') {
      return '$';
    }
    return '';
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
