import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(private rootService: RootService) {
  }

  route = '/customers';

  getCustomers(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getCustomer(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }
  
  getCxC(startDate: string, endDate: string, id: number): Promise<any> {
    return this.rootService.get(this.route + '/cxc/' + startDate + '/' + endDate + '/' + id);
  }

  postCustomer(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putCustomer(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteCustomer(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any): Promise<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', image);
    return this.rootService.postFile(this.route + '/image', formData);
  }

}
