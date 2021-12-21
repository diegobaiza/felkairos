import { Injectable } from '@angular/core';
import { CompaniesService } from './companies.service';
import { RootService } from './root.service';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class DigifactService {

  constructor(
    private companiesService: CompaniesService,
    private rootService: RootService) {
  }

  url: string = '/digifact';
  route = '/digifact';

  async getInfoNit(nit: string, nitC: string = 'La_Lechita') {
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    const company = await this.companiesService.getCompany(token.companyId);
    if (company.result) {
      return this.rootService.getDigifact(this.route + '/infonit/' + nit + '/' + nitC, company.data.token);
    }
    return null;
  }

  getToken(data: any) {
    return this.rootService.postDigifact(this.route + '/token', data);
  }

  async certificacion(nit: string, xml: string) {
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    const company = await this.companiesService.getCompany(token.companyId);
    if (company.result) {
      return await this.rootService.postDigifactXml(this.route + '/certificar/' + nit, xml, company.data.token);
    }
    return null;
  }

  async anulacion(nit: string, xml: string) {
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    const company = await this.companiesService.getCompany(token.companyId);
    if (company.result) {
      return await this.rootService.postDigifactXml(this.route + '/anular/' + nit, xml, company.data.token);
    }
    return null;
  }

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

}
