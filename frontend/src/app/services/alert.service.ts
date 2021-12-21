import { Injectable } from '@angular/core';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  alertMin(title: any, icon: any) {
    const toast = swal.mixin({
      toast: true,
      position: 'top-start',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
    toast.fire({ icon, title })
  }

  alertMax(title: any, text: any, icon: any) {
    swal.fire({
      title,
      text,
      icon,
      timerProgressBar: true,
      timer: 3000
    });
  }

  alertSequelize(title: any, text: any, icon: any) {
    swal.fire({
      title,
      text,
      icon
    });
  }

}
