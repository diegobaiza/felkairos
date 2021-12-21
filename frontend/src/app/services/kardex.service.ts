import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class KardexsService {

  constructor(private rootService: RootService) {
  }

  route = '/kardex';

  getKardex(startDate: string, endDate: string, branch: number, warehouse: number, product: number, variation: number): Promise<any> {
    return this.rootService.get(this.route + '/' + startDate + '/' + endDate + '/' + branch + '/' + warehouse + '/' + product + '/' + variation);
  }

  getStocks(date: string, branch: number, warehouse: number, product: number, variation: number): Promise<any> {
    return this.rootService.get(this.route + '/stocks/' + date + '/' + branch + '/' + warehouse + '/' + product + '/' + variation);
  }

  postKardex(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putKardex(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteKardex(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

}
