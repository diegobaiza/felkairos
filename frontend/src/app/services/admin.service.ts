import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private rootService: RootService) {
  }

  route = '/admin';

  getAdmin(): Promise<any> {
    return this.rootService.getAdmin(this.route);
  }

  getAdminByIdr(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postAdmin(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putAdmin(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteAdmin(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }
  
}
