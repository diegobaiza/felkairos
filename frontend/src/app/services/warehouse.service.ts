import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class WarehousesService {

  constructor(private rootService: RootService) {
  }

  route = '/warehouses';

  getWarehouses(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getWarehouse(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  getWarehousesBranch(id: number): Promise<any> {
    return this.rootService.get(this.route + '/branch/' + id);
  }

  postWarehouse(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putWarehouse(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteWarehouse(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

}
