import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class AttributesService {

  constructor(private rootService: RootService) {
  }

  route = '/attributes';

  getAttributes(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getAttribute(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postAttribute(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putAttribute(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteAttribute(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any) {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', image);
    return this.rootService.postFile(this.route + '/image', formData);
  }

}
