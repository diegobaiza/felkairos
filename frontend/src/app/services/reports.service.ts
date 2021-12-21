import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private rootService: RootService) {
  }

  route = '/reports';

  reportInvoice(id: number, format: string): Promise<any> {
    return this.rootService.get(this.route + '/' + format + '/' + id);
  }

  reportOperations(data: any): Promise<any> {
    return this.rootService.post(this.route + '/operations', data);
  }

  reportCxC(data: any): Promise<any> {
    return this.rootService.post(this.route + '/cxc', data);
  }

  reportCxP(data: any): Promise<any> {
    return this.rootService.post(this.route + '/cxp', data);
  }

  reportStocks(data: any): Promise<any> {
    return this.rootService.post(this.route + '/stocks', data);
  }

}
