import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  constructor(private rootService: RootService) {
  }

  route = '/units';

  getUnits(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getUnit(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postUnit(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putUnit(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteUnit(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any): Promise<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', image);
    return this.rootService.postFile(this.route + '/image', formData);
  }

}
