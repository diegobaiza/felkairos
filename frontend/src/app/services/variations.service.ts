import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class VariationsService {

  constructor(private rootService: RootService) {
  }

  route = '/variations';

  getVariations(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getVariation(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postVariation(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putVariation(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteVariation(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any): Promise<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', image);
    return this.rootService.postFile(this.route + '/image', formData);
  }

}
