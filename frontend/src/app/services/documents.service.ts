import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  constructor(private rootService: RootService) {
  }

  route = '/documents';

  getDocuments(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getDocument(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postDocument(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putDocument(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteDocument(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(data: any): Promise<any> {
    return this.rootService.postFile(this.route + '/image', data);
  }

}
