import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  constructor(private rootService: RootService) {
  }

  route = '/companies';

  getCompanies(): Promise<any> {
    return this.rootService.getAdmin(this.route);
  }

  getCompany(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postCompany(data: any): Promise<any> {
    return this.rootService.postAdmin(this.route, data);
  }

  putCompany(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteCompany(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(image: any, database: string): Promise<any> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('database', database);
    return this.rootService.postFile(this.route + '/image', formData);
  }

  deleteImage(database: string): Promise<any> {
    return this.rootService.deleteFile(this.route + '/rm/image/' + database);
  }

}
