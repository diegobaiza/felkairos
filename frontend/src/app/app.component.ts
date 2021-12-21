import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private router: Router,
    private elementRef: ElementRef
  ) {
    localStorage.getItem('color') ?
      this.elementRef.nativeElement.style.setProperty('--color', localStorage.getItem('color')) :
      this.elementRef.nativeElement.style.setProperty('--color', '#3978af');
    if (localStorage.getItem('remember') == 'false') {
      localStorage.removeItem('token');
      localStorage.removeItem('remember');
      localStorage.removeItem('companyId');
      this.router.navigate(['login']);
    }
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'dark')
    }
    if (localStorage.getItem('theme') == 'dark') {
      document.body.classList.add('is-dark');
    } else {
      document.body.classList.remove('is-dark');
    }
  }

  static admin() {
    AppComponent.removeScript('assets/js/main.js');
    AppComponent.removeScript('assets/js/auth.js');
    AppComponent.removeScript('assets/js/components.js');
    AppComponent.removeScript('assets/js/popover.js');
    AppComponent.removeScript('assets/js/widgets.js');
    AppComponent.removeScript('assets/js/touch.js');
    AppComponent.removeScript('assets/js/syntax.js');
    AppComponent.removeScript('assets/js/android-print.js');

    AppComponent.loadScript('assets/js/main.js');
    AppComponent.loadScript('assets/js/auth.js');
    AppComponent.loadScript('assets/js/components.js');
    AppComponent.loadScript('assets/js/popover.js');
    AppComponent.loadScript('assets/js/widgets.js');
    AppComponent.loadScript('assets/js/touch.js');
    AppComponent.loadScript('assets/js/syntax.js');
    AppComponent.loadScript('assets/js/android-print.js');
  }

  static panels() {
    AppComponent.removeScript('assets/js/panels.js');
    AppComponent.loadScript('assets/js/panels.js');
  }

  static profile() {
    AppComponent.removeScript('assets/js/profile.js');
    AppComponent.loadScript('assets/js/profile.js');
  }

  static dash() {
    AppComponent.removeScript('assets/js/apex-data.js');
    AppComponent.removeScript('assets/js/apex.js');
    AppComponent.removeScript('assets/js/ecommerce-1.js');
    AppComponent.loadScript('assets/js/apex-data.js');
    AppComponent.loadScript('assets/js/apex.js');
    AppComponent.loadScript('assets/js/ecommerce-1.js');
  }

  static card() {
    AppComponent.removeScript('assets/js/card-grid.js');
    AppComponent.loadScript('assets/js/card-grid.js');
  }

  static list() {
    AppComponent.removeScript('assets/js/list-view.js');
    AppComponent.loadScript('assets/js/list-view.js');
  }

  static wizard() {
    AppComponent.removeScript('assets/js/wizard-dropzone.js');
    AppComponent.removeScript('assets/js/wizard-v1.js');
    AppComponent.loadScript('assets/js/wizard-dropzone.js');
    AppComponent.loadScript('assets/js/wizard-v1.js');
  }

  static loadScript(url: string) {
    const body = document.body as HTMLInputElement;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }

  static removeScript(filename: string, filetype: string = 'js') {
    var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none";
    var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none";
    var allsuspects: any = document.getElementsByTagName(targetelement);
    for (var i = allsuspects.length; i >= 0; i--) {
      if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(filename) != -1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]);
    }
  }

}
