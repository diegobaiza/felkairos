import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {

  constructor(private rootService: RootService) {
  }

  route = '/branches';

  getBranches(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getBranch(id: number): Promise<any> {
    return this.rootService.get(this.route + '/' + id);
  }

  postBranch(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putBranch(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteBranch(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }

}
