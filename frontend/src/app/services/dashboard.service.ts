import { Injectable } from '@angular/core';
import { RootService } from './root.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private rootService: RootService) {
  }

  route = '/dashboard';

  getDashboard(startDate: string, endDate: string): Promise<any> {
    return this.rootService.get(this.route + '/' + startDate + '/' + endDate);
  }
  
  getDashboardYear(year: string, type: string): Promise<any> {
    return this.rootService.get(this.route + '/year/' + year + '/' + type);
  }

  getDashboardOperations(startDate: string, endDate: string): Promise<any> {
    return this.rootService.get(this.route + '/operations/' + startDate + '/' + endDate);
  }

  getDashboardCounters(): Promise<any> {
    return this.rootService.get(this.route + '/counters');
  }

}
