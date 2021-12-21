import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class TypeDocumentsService {

  constructor(private rootService: RootService) {
  }

  route = '/typeDocuments';

  getTypeDocuments(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getTypeDocument(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postTypeDocument(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putTypeDocument(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteTypeDocument(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

}
