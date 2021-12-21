import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {

  constructor(private rootService: RootService) {
  }

  route = '/coupons';

  getCoupons(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getCoupon(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postCoupon(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putCoupon(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteCoupon(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any): Promise<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', image);
    return this.rootService.postFile(this.route + '/image', formData);
  }

}
