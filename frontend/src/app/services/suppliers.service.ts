import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor(private rootService: RootService) {
  }

  route = '/suppliers';

  getSuppliers(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getSupplier(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  getCxP(id: number): Promise<any> {
    return this.rootService.get(this.route + '/cxp/' + id);
  }

  postSupplier(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putSupplier(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteSupplier(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any): Promise<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', image);
    return this.rootService.postFile(this.route + '/image', formData);
  }

}
