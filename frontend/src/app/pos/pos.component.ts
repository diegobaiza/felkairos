import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import * as $ from 'jquery';
import { environment } from 'src/environments/environment';
import { CompaniesService } from '../services/companies.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {

  menu: any = [];
  userId: number = 0;
  companyId: number = 0;

  apiUrl: string = environment.api;

  static u_name: string;
  static u_username: string;
  static u_logo: string;
  static u_color: string;
  static elementRef: ElementRef

  constructor(
    public router: Router,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private elementRef: ElementRef
  ) {
    if (localStorage.getItem('locked') == 'true') {
      router.navigateByUrl("/login", { skipLocationChange: true });
      return;
    }
    const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
    let exp = moment(token.exp * 1000).format('yyyy-MM-DD HH:mm');
    let today = moment().format('yyyy-MM-DD HH:mm');

    if (exp > today) {
      this.userId = token.data.id;
      this.companyId = token.companyId;
      localStorage.setItem('companyId', token.companyId);
      localStorage.setItem('database', token.database);
      this.getUser();;
      this.getCompany();
    }
  }

  getUser() {
    this.usersService.getUser(this.userId).then(user => {
      if (user) {
        PosComponent.u_name = user.data.name;
        PosComponent.u_username = user.data.username;
        PosComponent.u_color = user.data.color;
      };
    });
  }

  getCompany() {
    this.companiesService.getCompany(this.companyId).then(company => {
      if (company.result) {
        PosComponent.u_logo = company.data.image;
      };
    });
  }

  ngOnInit(): void {
    // if (!localStorage.getItem('companyId')) {
    //   this.router.navigate(['company']);
    // }
    this.menu = [
      { name: 'Dashboard', url: '/pos/dashboard', icon: 'fa-chart-line', view: true },
      { name: 'Usuarios', url: '/pos/users', icon: 'fa-user', view: true },
      { name: 'Roles', url: '/pos/roles', icon: 'fad fa-user-crown', view: true },
      { name: 'Clientes', url: '/pos/customers', icon: 'fa-user-tag', view: true },
      { name: 'Proveedores', url: '/pos/suppliers', icon: 'fa-truck-loading', view: true },
      { name: 'Sucursales', url: '/pos/branches', icon: 'fa-warehouse', view: true },
      { name: 'Bodegas', url: '/pos/warehouses', icon: 'fa-store', view: true },
      { name: 'Productos', url: '/pos/products', icon: 'fa-box-full', view: true },
      { name: 'Categorías', url: '/pos/products-categories', icon: 'fa-boxes', view: true },
      { name: 'Unidades de Medida', url: '/pos/units', icon: 'fa-balance-scale', view: true },
      { name: 'Atributos', url: '/pos/attributes', icon: 'fa-network-wired', view: true },
      { name: 'Cupones', url: '/pos/coupons', icon: 'fa-percent', view: true },
      { name: 'Documentos', url: '/pos/documents', icon: 'fa-id-card', view: true },
      { name: 'Operaciones', url: '/pos/operations', icon: 'fa-file-invoice-dollar', view: true },
      { name: 'Kardex', url: '/pos/kardex', icon: 'fa-cart-arrow-down', view: true },
      { name: 'Existencias', url: '/pos/stocks', icon: 'fa-cubes', view: true },
      { name: 'Mi Empresa', url: '/pos/company', icon: 'fa-cogs', view: false }
    ];
  }

  get name() {
    return PosComponent.u_name;
  }

  get username() {
    return PosComponent.u_username;
  }

  get color() {
    this.elementRef.nativeElement.style.setProperty('--color', PosComponent.u_color);
    return PosComponent.u_color;
  }

  get logo() {
    return PosComponent.u_logo;
  }

  getPage(url: string) {
    for (let i = 0; i < this.menu.length; i++) {
      if (this.menu[i].url == url && this.menu[i].view == true) {
        $('.naver').removeClass('from-bottom');
        $('.naver').css({ 'margin-top': 150 + (50 * i) });
        return this.menu[i];
      }
    }
  }

  openSidebarItem($event: any) {
    $('.has-children').removeClass('active');
    $('.displays').removeClass('displays');
    if ($event.currentTarget.className == "has-children") {
      $event.currentTarget.classList.add('active');
      $($event.currentTarget).children('ul').addClass('displays')
    } else {
      $event.currentTarget.classList.remove('active');
      $($event.currentTarget).children('ul').removeClass('displays')
    }
  }

  openMenu() {
    $('body').addClass('opened');
    $('.main-sidebar').addClass('is-bordered');
    $('.sidebar-brand').addClass('is-bordered');
    $('.sidebar-panel').addClass('is-active');
    $('.view-wrapper').addClass('is-pushed-full');
    $('.icon-box-toggle').addClass('active');
  }

  closeMenu() {
    if ($('body').hasClass('opened')) {
      $('body').removeClass('opened');
      $('.main-sidebar').removeClass('is-bordered');
      $('.sidebar-brand').removeClass('is-bordered');
      $('.sidebar-panel').removeClass('is-active');
      $('.view-wrapper').removeClass('is-pushed-full');
      $('.icon-box-toggle').removeClass('active');
    } else {
      this.openMenu();
    }
  }

  openMenuMobile() {
    if ($('.navbar-burger').hasClass('is-active')) {
      this.closeMenuMobile();
    } else {
      $('.navbar-burger').addClass('is-active');
      $('.mobile-subsidebar').addClass('is-active');
      $('.mobile-main-sidebar').addClass('is-active');
    }
  }

  closeMenuMobile() {
    $('.navbar-burger').removeClass('is-active');
    $('.mobile-subsidebar').removeClass('is-active');
    $('.mobile-main-sidebar').removeClass('is-active');
  }

  userMenu(id: string) {
    if ($('.dropdown').hasClass('is-active')) {
      $('.dropdown').removeClass('is-active');
    } else {
      $(`#${id}`).addClass('is-active');
    }
    $(document).on('click', function (e) {
      var target = e.target;

      if (!$(target).is('.dropdown img, .kill-drop') && !$(target).parents().is('.dropdown')) {
        $('.dropdown').removeClass('is-active');
      }

      if ($(target).is('.kill-drop')) {
        $('.dropdown').removeClass('is-active');
      }
    });
  }

  logout() {
    // localStorage.removeItem('token');
    localStorage.setItem('locked', 'true');
    localStorage.removeItem('remember');
    this.router.navigate(['login']);
  }

  tokenAdmin() {
    if (localStorage.getItem('tokenAdmin')) {
      return true;
    } else {
      return false;
    }
  }

  changeTheme() {
    if (localStorage.getItem('theme') == 'dark') {
      localStorage.removeItem('theme');
      document.body.classList.remove('is-dark');
      return;
    }
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'dark');
      document.body.classList.add('is-dark');
      return;
    }
  }

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

}
