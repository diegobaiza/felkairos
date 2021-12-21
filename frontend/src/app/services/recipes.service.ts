import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  constructor(private rootService: RootService) {
  }

  route = '/recipes';

  getRecipes(): Promise<any> {
    return this.rootService.get(this.route);
  }

  getRecipe(productId: number): Promise<any> {
    return this.rootService.get(this.route + '/' + productId);
  }

  postRecipe(data: any): Promise<any> {
    return this.rootService.post(this.route, data);
  }

  putRecipe(id: number, data: any): Promise<any> {
    return this.rootService.put(this.route + '/' + id, data);
  }

  deleteRecipe(id: number): Promise<any> {
    return this.rootService.delete(this.route + '/' + id);
  }
  
}
