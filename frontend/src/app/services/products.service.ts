import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private rootService: RootService) {
  }

  route = '/products';

  getProducts(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getProduct(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }
  
  getProductStock(branch: number, warehouse: number, product: number, variation: number): Promise<any> {
    return this.rootService.get(this.route + '/stock/' + branch + '/' + warehouse + '/' + product + '/' + variation);
  }

  postProduct(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putProduct(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteProduct(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any, database: string): Promise<any> {
    const formData = new FormData();
    formData.append('productId', id.toString());
    formData.append('image', image);
    formData.append('database', database);
    return this.rootService.postFile(this.route + '/image', formData);
  }

  deleteImage(database: string, id: number): Promise<any> {
    return this.rootService.deleteFile(this.route + '/rm/image/' + database + '/' + id);
  }
  
}
