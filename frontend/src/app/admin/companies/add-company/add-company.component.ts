import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { CompaniesService } from 'src/app/services/companies.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DigifactService } from 'src/app/services/digifact.service';
import { AlertService } from 'src/app/services/alert.service';
import { Router } from '@angular/router';

declare var notyf: any;

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.css']
})
export class AddCompanyComponent implements OnInit {

  companyForm: FormGroup;
  companyId: number = 0;
  companyIndex: number = 0;

  file: any;

  constructor(
    private companiesService: CompaniesService,
    private digifactService: DigifactService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.companyForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      nit: new FormControl('000044653948', [Validators.required]),
      address: new FormControl('12 calle 9-20 Zona 10', [Validators.required]),
      phone: new FormControl('0000-0000', [Validators.required]),
      email: new FormControl('felkairos@yopmail.com', [Validators.required, Validators.email]),
      tax: new FormControl(1, [Validators.required]),
      iva: new FormControl(12, [Validators.required]),
      exchange: new FormControl(7.5, [Validators.required]),
      documents: new FormControl(100, [Validators.required]),
      extra: new FormControl(100, [Validators.required]),
      access: new FormControl(true, [Validators.required]),
      printer: new FormControl(true, [Validators.required]),
      tabs: new FormControl(0, [Validators.required]),
      database: new FormControl('', [Validators.required]),
      username: new FormControl('GT.000044653948.Kairossoft_test', [Validators.required]),
      password: new FormControl('U%p7jH_&', [Validators.required]),
      exp: new FormControl('24h', [Validators.required]),
      token: new FormControl(null),
    });
    AppComponent.admin();
    AppComponent.wizard();
  }

  ngOnInit(): void {
  }

  postCompany(e: any) {
    if (this.validation(e)) {
      $('#bt-add-company').addClass('is-loading');
      this.digifactService.getToken({
        username: this.companyForm.controls['username'].value,
        password: this.companyForm.controls['password'].value
      }).subscribe((digifact: any) => {
        if (digifact.Token) {
          this.companyForm.controls['token'].setValue(digifact.Token);
          this.companiesService.postCompany(this.companyForm.value).then(res => {
            if (res.result) {
              if (this.file) {
                this.companiesService.postImage(this.file, this.companyForm.controls['database'].value);
              }
              this.alertService.alertMax('Correcto', res.message, 'success');
              this.router.navigate(['admin/companies']);
            } else {
              this.alertService.alertMax('Error', res.message, 'error');
            }
            $('#bt-add-company').removeClass('is-loading');
          });
        } else {
          this.alertService.alertMax('Error', digifact.description, 'error');
          $('#bt-add-company').removeClass('is-loading');
        }
      });
    }
  }

  postImage() {
    let file: any = document.querySelector('input[type=file]');
    if (file.files.length > 0) {
      this.file = file.files[0];
      // let img: any = document.getElementById('project-preview-logo');
      // img.src = URL.createObjectURL(this.file)
    }
  }

  deleteImage() {
    // this.productsService.putProduct(this.id, { image: null }).then(res => {
    //   if (res.result) {
    //     this.productForm.controls.image.setValue(null);
    //     this.products[this.index].image = null;
    //     $('#upload').addClass('is-hidden');
    //     $('#uploaded').removeClass('is-hidden');
    //     $('#uploaded-btn').removeClass('is-hidden');
    //     $('#upload-btn').addClass('is-hidden');
    //     AppComponent.list();
    //     notyf.open({ type: 'success', message: res.message });
    //   } else {
    //     notyf.open({ type: 'error', message: res.message });
    //   }
    // });
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.companyForm.controls).forEach(key => {
      if (this.companyForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.companyForm.controls).forEach(key => {
      let input = e.target.querySelector("input[formControlName^='" + [key] + "']");
      if (input) {
        input.blur();
      }
    });
    return true;
  }

}
