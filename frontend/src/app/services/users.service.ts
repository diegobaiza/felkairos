import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private rootService: RootService) {
  }

  route = '/users';

  getUsers(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getUser(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  getUsersByRole(role: string): Promise<any> {
    return this.rootService.get(this.route + '/role/' + role);
  }

  postUser(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putUser(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteUser(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

  postImage(id: number, image: any): Promise<any> {
    const formData = new FormData();
    formData.append('userId', id.toString());
    formData.append('image', image);
    return this.rootService.postFile(this.route + '/image', formData);
  }

}
