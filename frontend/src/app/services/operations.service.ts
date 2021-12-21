import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {

  constructor(private rootService: RootService) {
  }

  route = '/operations';

  getOperations(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getOperationsType(type: string): Promise<any> {
    return this.rootService.get(this.route + '/type/' + type);
  }

  getOperationsRange(startDate: string, endDate: string): Promise<any> {
    return this.rootService.get(this.route + '/range/' + startDate + '/' + endDate);
  }

  getOperationsSerieFel(serieFel: string): Promise<any> {
    return this.rootService.get(this.route + '/serieFel/' + serieFel);
  }

  getOperationsNumberFel(numberFel: string): Promise<any> {
    return this.rootService.get(this.route + '/numberFel/' + numberFel);
  }

  getOperation(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postOperation(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  postOperationEmail(id: number): Promise<any> {
    return this.rootService.post(this.route + '/email/' + id, null);
  }

  putOperation(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteOperation(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any): Promise<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('image', image);
    return this.rootService.postFile(this.route + '/image', formData);
  }

}
