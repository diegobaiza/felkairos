import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { AlertService } from '../services/alert.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  menu: any = [];
  userId: number = 0;

  static nameUser: string;
  static username: string;

  constructor(
    public router: Router,
    private usersService: UsersService,
    private alertService: AlertService
  ) {
    const token: any = jwt_decode(this.isToken(localStorage.getItem('tokenAdmin')));

    if (token.type == 'admin') {
      let exp = moment(token.exp * 1000).format('yyyy-MM-DD HH:mm:ss');
      let today = moment().format('yyyy-MM-DD HH:mm:ss');

      if (exp > today) {
        this.userId = token.data.id;
        this.getUser();;
      } else {
        this.alertService.alertMax('Sesión Cerrada', 'Token Expirado', 'info');
        this.logout();
      }
    } else {
      this.redirect();
    }
  }

  getUser() {
    this.usersService.getUser(this.userId).then(user => {
      if (user.result) {
        AdminComponent.nameUser = user.data.name;
        AdminComponent.username = user.data.username;
      };
    });
  }

  ngOnInit(): void {
    this.menu = [
      { name: 'Empresas', url: '/admin/companies', icon: 'fa-warehouse' },
      { name: 'Usuarios', url: '/admin/users', icon: 'fa-users' }
    ];
  }

  get name() {
    return AdminComponent.nameUser;
  }

  get username() {
    return AdminComponent.username;
  }

  getPage(url: string) {
    for (let i = 0; i < this.menu.length; i++) {
      if (this.menu[i].url == url) {
        $('.naver').removeClass('from-bottom');
        $('.naver').css({ 'margin-top': 150 + (64 * i) });
        return this.menu[i].name;
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
    localStorage.removeItem('tokenAdmin');
    localStorage.removeItem('token');
    localStorage.removeItem('remember');
    localStorage.removeItem('companyId');
    this.router.navigate(['login-admin']);
  }

  redirect() {
    this.router.navigate(['pos']);
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
