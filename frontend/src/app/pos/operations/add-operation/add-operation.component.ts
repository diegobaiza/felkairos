import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { DocumentsService } from 'src/app/services/documents.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { DigifactService } from 'src/app/services/digifact.service';
import { CustomersService } from 'src/app/services/customers.service';
import { SuppliersService } from 'src/app/services/suppliers.service';
import { BranchesService } from 'src/app/services/branches.service';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { OperationsService } from 'src/app/services/operations.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products.service';
import { CompaniesService } from 'src/app/services/companies.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportsService } from 'src/app/services/reports.service';
import * as accounting from 'accounting';
import Swal from 'sweetalert2';
import { AlertService } from 'src/app/services/alert.service';
import { WarehousesService } from 'src/app/services/warehouse.service';
import { KardexsService } from 'src/app/services/kardex.service';
import { RecipesService } from 'src/app/services/recipes.service';
import { CouponsService } from 'src/app/services/coupons.service';

declare var notyf: any;
declare function quickPrint(data: any): any;

@Component({
  selector: 'app-add-operation',
  templateUrl: './add-operation.component.html',
  styleUrls: ['./add-operation.component.css']
})
export class AddOperationComponent implements OnInit {

  companyId: number = 0;
  operationForm: FormGroup;
  customerForm: FormGroup;
  supplierForm: FormGroup;
  id: number = 0;
  idFel: string = '';
  index: number = 0;
  documentId: number = 0;

  company: any;

  customers: any = [];
  suppliers: any = [];
  branches: any = [];
  warehouses: any = [];
  warehouses_end: any = [];
  products: any = [];

  operation: any;
  document: any;
  branch: any = { name: '' };
  branch_end: any = { name: '' };
  warehouse: any = { name: '' };
  warehouse_end: any = { name: '' };
  customer: any = { email: '' };
  supplier: any;
  felDetails: any;

  details: any = [];
  methods: any = [];
  abonos: any = [];
  coupons: any = [];

  details2: any = [];
  methods2: any = [];
  notes: any = [];

  variations: any = [];
  variationId: any = null;
  description: string = '';
  product: any;

  cambios: any = [];

  sku: string = '';
  code: string = '';
  typedocument: any;

  abonoDate: any;
  abonoTotal: number = 0;

  methodType: string = 'EFECTIVO';
  methodTotal: any;
  methodAuth: string = '';
  amount: number = 0;

  auto_date: boolean = true;

  apiUrl: string = environment.api;

  constructor(
    private operationsService: OperationsService,
    private digifactService: DigifactService,
    private customersService: CustomersService,
    private suppliersService: SuppliersService,
    private documentsService: DocumentsService,
    private branchesService: BranchesService,
    private warehouseService: WarehousesService,
    private productsService: ProductsService,
    private companiesService: CompaniesService,
    private activatedRoute: ActivatedRoute,
    private reportsService: ReportsService,
    private alertService: AlertService,
    private kardexService: KardexsService,
    private recipesService: RecipesService,
    private couponsService: CouponsService,
    private router: Router
  ) {
    AppComponent.admin();
    this.operationForm = new FormGroup({
      date: new FormControl(moment().format('YYYY-MM-DDTHH:mm:ss'), [Validators.required]),
      total: new FormControl(0, [Validators.required]),
      subtotal: new FormControl(0, [Validators.required]),
      iva: new FormControl(0, [Validators.required]),
      discount: new FormControl(0, [Validators.required]),
      exchange: new FormControl(7.80, [Validators.required]),
      turned: new FormControl(0, [Validators.required]),
      currency: new FormControl('GTQ', [Validators.required]),
      payment: new FormControl('CONTADO', [Validators.required]),
      observations: new FormControl(null),
      customerId: new FormControl(null),
      supplierId: new FormControl(null),
      documentId: new FormControl(null, [Validators.required]),
      userId: new FormControl(null, [Validators.required]),
      branchId: new FormControl(null, [Validators.required]),
      warehouseId: new FormControl(null),
      operationId: new FormControl(null),
    });
    this.customerForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      nit: new FormControl(null, [Validators.required]),
      email: new FormControl(''),
      doc: new FormControl(null, [Validators.required])
    });
    this.supplierForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      nit: new FormControl(null, [Validators.required]),
      email: new FormControl(''),
      doc: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    // $('#layouts-sidebar').removeClass('is-active');
    // $('.view-wrapper').removeClass('is-pushed-full');
    // $('.icon-box-toggle').removeClass('active');
    this.activatedRoute.params.subscribe(async (route: any) => {
      if (route.documentId) {
        const token: any = jwt_decode(this.isToken(localStorage.getItem('token')));
        this.companyId = token.companyId;
        this.operationForm.controls['userId'].setValue(token.data.id);
        this.documentId = route.documentId;
        await this.getCompany();
        await this.setDocument(this.documentId);
        await this.getBranches();
        await this.getProducts();
        await this.getCoupons();
        if (route.operationId) {
          this.id = route.operationId;
          this.getOperation();
        }
        await this.getCustomers();
        await this.getSuppliers();
      } else {
        this.router.navigate(['pos/operations']);
      }
    });

    let myThis = this;
    setInterval(function () {
      if (myThis.auto_date) {
        myThis.operationForm.controls['date'].setValue(moment().format('YYYY-MM-DDTHH:mm:ss'));
      }
    }.bind(this), 1000);
  }

  get subtotal() {
    return this.getCurrency() + this.operationForm.controls['subtotal'].value;
  }

  get iva() {
    return this.getCurrency() + this.operationForm.controls['iva'].value;
  }

  get discount() {
    return '- ' + this.getCurrency() + this.operationForm.controls['discount'].value;
  }

  get total() {
    return this.getCurrency() + this.operationForm.controls['total'].value;
  }

  get turned() {
    if (this.amount < this.operationForm.controls['total'].value) {
      this.operationForm.controls['turned'].setValue(this.operationForm.controls['total'].value - this.amount);
    }
    if (this.amount >= this.operationForm.controls['total'].value) {
      this.operationForm.controls['turned'].setValue(this.amount - this.operationForm.controls['total'].value);
    }
    return this.getCurrency() + (this.decimal(this.operationForm.controls['turned'].value));
  }

  nextOperation() {
    if (this.operationForm.valid) {
      if (this.typedocument.products) {
        if (this.details.length == 0) {
          notyf.open({ type: 'error', message: 'Lista de productos vacia' });
          return;
        }
      }
      if (this.operationForm.controls['total'].value > 0) {
        $('#add-operation-panel').addClass('is-active');
      } else {
        notyf.open({ type: 'error', message: 'El total debe ser mayor a 0' });
      }
    }
  }

  async postOperation(e: any) {
    // Ultimo chequeo de stocks
    this.cambios = []
    if (this.typedocument.inventory == 'SALIDA') {
      if (this.company.stock) {
        for (let u = 0; u < this.details.length; u++) {
          let product = await this.productsService.getProductStock(this.operationForm.controls['branchId'].value, this.operationForm.controls['warehouseId'].value, this.details[u].productId, this.details[u].variationId);
          product.data ? this.details[u].stock = parseFloat(product.data.stock) : 0;

          if (parseFloat(this.details[u].quantity) > parseFloat(this.details[u].stock)) {
            this.cambios.push({
              name: this.details[u].name,
              sku: this.details[u].sku,
              price: this.details[u].price,
              cost: this.details[u].cost,
              quantity: parseFloat(this.details[u].quantity),
              stock: parseFloat(this.details[u].stock)
            });
            this.details[u].quantity = this.details[u].stock;
            this.calculation();
          }
        }
        if (this.cambios.length > 0) {
          $('#add-operation-panel').removeClass('is-active');
          $('#select-cambios-panel').addClass('is-active');
          notyf.open({ type: 'warning', message: `Se ha detectado un cambio de existencias` });
          return;
        }
      }
    }

    $('#bt-add-operation').addClass('is-loading');
    if (this.validation(e)) {

      if (this.operationForm.controls['payment'].value == 'CONTADO') {
        if (this.typedocument.payment) {
          if (this.amount < this.operationForm.controls['total'].value) {
            notyf.open({ type: 'error', message: `${this.getCurrency()}${this.operationForm.controls['turned'].value} pendientes de pago` });
            $('#bt-add-operation').removeClass('is-loading');
            return;
          }
        }
      }

      if (this.typedocument.note) {
        if (this.operation.total < this.operationForm.controls['total'].value) {
          notyf.open({ type: 'error', message: `El total no puede ser mayor al de la factura` });
          $('#bt-add-operation').removeClass('is-loading');
          return;
        }
      }

      if (this.typedocument.name == 'COMPRA') {

        if (this.supplierForm.valid) {

          if (this.operationForm.controls['supplierId'].value == 0) {

            let supplier: any = await this.suppliersService.postSupplier(this.supplierForm.value);
            if (supplier.result) {
              this.operationForm.controls['supplierId'].setValue(supplier.data.id);
              this.setSupplier(supplier.data);
            } else {
              notyf.open({ type: 'error', message: 'Error al Agregar Proveedor' });
              return;
            }
          }

          this.supplier.email = this.supplierForm.controls['email'].value;

          const op = {
            date: this.operationForm.controls['date'].value,
            nit: this.supplier.nit,
            total: this.operationForm.controls['total'].value,
            subtotal: this.operationForm.controls['subtotal'].value,
            iva: this.operationForm.controls['iva'].value,
            discount: this.operationForm.controls['discount'].value,
            exchange: this.operationForm.controls['exchange'].value,
            turned: this.operationForm.controls['turned'].value,
            currency: this.operationForm.controls['currency'].value,
            payment: this.operationForm.controls['payment'].value,
            observations: this.operationForm.controls['observations'].value,
            status: 'CERTIFICADA',
            customerId: this.operationForm.controls['customerId'].value,
            supplierId: this.operationForm.controls['supplierId'].value,
            documentId: this.operationForm.controls['documentId'].value,
            userId: this.operationForm.controls['userId'].value,
            branchId: this.operationForm.controls['branchId'].value,
            warehouseId: this.operationForm.controls['warehouseId'].value,
            operationId: this.operationForm.controls['operationId'].value,
            details: this.details,
            methods: this.methods,
            customer: this.customer,
            supplier: this.supplier,
            auto_date: this.auto_date
          };

          this.operationsService.postOperation(op).then(operation => {
            if (operation.result) {
              this.invoice(operation.data);
              notyf.open({ type: 'success', message: operation.message });
            } else {
              notyf.open({ type: 'error', message: operation.message });
              $('#bt-add-operation').removeClass('is-loading');
            }
          });

        }

      }

      if (this.typedocument.name == 'FACTURA') {

        if (this.customerForm.valid) {

          if (this.operationForm.controls['customerId'].value == 0) {

            let customer: any = await this.customersService.postCustomer(this.customerForm.value);
            if (customer.result) {
              this.operationForm.controls['customerId'].setValue(customer.data.id);
              this.setCustomer(customer.data);
            } else {
              notyf.open({ type: 'error', message: 'Error al Agregar Cliente' });
              return;
            }
          }

          this.customer.email = this.customerForm.controls['email'].value;

          let xmlItems = '';

          this.details.forEach((i: any, u: number) => {
            const subtotal = this.decimal(((i.price * i.quantity) - i.discount) / parseFloat(`${1}.${this.company.iva}`));
            const iva = this.decimal((subtotal) * parseFloat(`${0}.${this.company.iva}`));
            let type = 'B';
            if (i.type == 'SERVICIO') {
              type = 'S';
            }

            xmlItems += `<dte:Item NumeroLinea="${u + 1}" BienOServicio="${type}">
            <dte:Cantidad>${i.quantity}</dte:Cantidad>
            <dte:UnidadMedida>UNI</dte:UnidadMedida>
            <dte:Descripcion>${i.description}</dte:Descripcion>
            <dte:PrecioUnitario>${i.price}</dte:PrecioUnitario>
            <dte:Precio>${i.price * i.quantity}</dte:Precio>
            <dte:Descuento>${i.discount}</dte:Descuento>
            <dte:Impuestos>
              <dte:Impuesto>
                <dte:NombreCorto>IVA</dte:NombreCorto>
                <dte:CodigoUnidadGravable>1</dte:CodigoUnidadGravable>
                <dte:MontoGravable>${subtotal}</dte:MontoGravable>
                <dte:MontoImpuesto>${iva}</dte:MontoImpuesto>
              </dte:Impuesto>
            </dte:Impuestos>
            <dte:Total>${this.decimal((i.price * i.quantity) - i.discount)}</dte:Total>
          </dte:Item>`;
          });

          let xml = `<?xml version="1.0" encoding="UTF-8"?>
          <dte:GTDocumento xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"
            Version="0.1">
            <dte:SAT ClaseDocumento="dte">
              <dte:DTE ID="DatosCertificados">
                <dte:DatosEmision ID="DatosEmision">
                  <dte:DatosGenerales Tipo="FACT" FechaHoraEmision="${this.operationForm.controls['date'].value}" CodigoMoneda="${this.operationForm.controls['currency'].value}" />
                  <dte:Emisor NITEmisor="${parseInt(this.company.nit)}" NombreEmisor="${this.company.name}" CodigoEstablecimiento="${this.branch.number}"
                    NombreComercial="${this.branch.name}" AfiliacionIVA="GEN">
                    <dte:DireccionEmisor>
                      <dte:Direccion>${this.company.address}</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionEmisor>
                  </dte:Emisor>
                  <dte:Receptor NombreReceptor="${this.customer.name}" IDReceptor="${this.customer.nit}" CorreoReceptor="${this.customer.email}">
                    <dte:DireccionReceptor>
                      <dte:Direccion>CIUDAD</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionReceptor>
                  </dte:Receptor>
                  <dte:Frases>
                    <dte:Frase TipoFrase="1" CodigoEscenario="1" />
                  </dte:Frases>
                  <dte:Items>
                    ${xmlItems}
                  </dte:Items>
                  <dte:Totales>
                    <dte:TotalImpuestos>
                      <dte:TotalImpuesto NombreCorto="IVA" TotalMontoImpuesto="${this.operationForm.controls['iva'].value}" />
                    </dte:TotalImpuestos>
                    <dte:GranTotal>${this.operationForm.controls['total'].value}</dte:GranTotal>
                  </dte:Totales>
                </dte:DatosEmision>
              </dte:DTE>
              <dte:Adenda>
                <dtecomm:Informacion_COMERCIAL xsi:schemaLocation="https://www.digifact.com.gt/dtecomm"
                  xmlns:dtecomm="https://www.digifact.com.gt/dtecomm">
                  <dtecomm:InformacionAdicional Version="7.1234654163">
                    <dtecomm:REFERENCIA_INTERNA>${this.document.serie}-${this.document.correlative}</dtecomm:REFERENCIA_INTERNA>
                    <dtecomm:FECHA_REFERENCIA>${this.operationForm.controls['date'].value}</dtecomm:FECHA_REFERENCIA>
                    <dtecomm:VALIDAR_REFERENCIA_INTERNA>NO_VALIDAR</dtecomm:VALIDAR_REFERENCIA_INTERNA>
                  </dtecomm:InformacionAdicional>
                </dtecomm:Informacion_COMERCIAL>
              </dte:Adenda>
            </dte:SAT>
          </dte:GTDocumento>`;

          this.digifactService.certificacion(this.formatNit(this.company.nit), xml).then((certficacion: any) => {

            if (certficacion.Codigo == 1) {
              const op = {
                date: this.operationForm.controls['date'].value,
                nit: certficacion.NIT_COMPRADOR,
                total: this.operationForm.controls['total'].value,
                subtotal: this.operationForm.controls['subtotal'].value,
                iva: this.operationForm.controls['iva'].value,
                discount: this.operationForm.controls['discount'].value,
                exchange: this.operationForm.controls['exchange'].value,
                turned: this.operationForm.controls['turned'].value,
                currency: this.operationForm.controls['currency'].value,
                payment: this.operationForm.controls['payment'].value,
                observations: this.operationForm.controls['observations'].value,
                autorizacionFel: certficacion.Autorizacion,
                serieFel: certficacion.Serie,
                numberFel: certficacion.NUMERO,
                status: 'CERTIFICADA',
                customerId: this.operationForm.controls['customerId'].value,
                supplierId: this.operationForm.controls['supplierId'].value,
                documentId: this.operationForm.controls['documentId'].value,
                userId: this.operationForm.controls['userId'].value,
                branchId: this.operationForm.controls['branchId'].value,
                warehouseId: this.operationForm.controls['warehouseId'].value,
                operationId: this.operationForm.controls['operationId'].value,
                details: this.details,
                methods: this.methods,
                customer: this.customer,
                supplier: this.supplier,
                auto_date: this.auto_date
              };
              this.operationsService.postOperation(op).then(operation => {
                if (operation.result) {
                  this.invoice(operation.data);
                  notyf.open({ type: 'success', message: operation.message });
                } else {
                  $('#bt-add-operation').removeClass('is-loading');
                  notyf.open({ type: 'error', message: operation.message });
                }
              });
            } else {
              $('#bt-add-operation').removeClass('is-loading');
              $('#err-fel-panel').addClass('is-active');
              this.felDetails = certficacion;
              notyf.open({ type: 'error', message: certficacion.Mensaje });
            }
          }).catch((res: HttpErrorResponse) => {
            $('#bt-add-operation').removeClass('is-loading');
            $('#err-fel-panel').addClass('is-active');
            this.felDetails = res.error;
            notyf.open({ type: 'error', message: res.error.Mensaje });
          });

        } else {
          $('#bt-add-operation').removeClass('is-loading');
          notyf.open({ type: 'error', message: 'Informacion de Cliente Incompleta' });
        }

      }

      if (this.typedocument.name == 'FACTURA CAMBIARIA') {

        if (this.customerForm.valid) {

          if (this.operationForm.controls['customerId'].value == 0) {

            let customer: any = await this.customersService.postCustomer(this.customerForm.value);
            if (customer.result) {
              this.operationForm.controls['customerId'].setValue(customer.data.id);
              this.setCustomer(customer.data);
            } else {
              notyf.open({ type: 'error', message: 'Error al Agregar Cliente' });
              return;
            }
          }

          if (this.abonos.length == 0) {
            notyf.open({ type: 'error', message: 'Lista de abonos vacia' });
            $('#bt-add-operation').removeClass('is-loading');
            return;
          }

          this.customer.email = this.customerForm.controls['email'].value;

          let xmlItems = '';

          this.details.forEach((i: any, u: number) => {
            const subtotal = this.decimal(((i.price * i.quantity) - i.discount) / parseFloat(`${1}.${this.company.iva}`));
            const iva = this.decimal((subtotal) * parseFloat(`${0}.${this.company.iva}`));

            let type = 'B';
            if (i.type == 'SERVICIO') {
              type = 'S';
            }

            xmlItems += `<dte:Item NumeroLinea="${u + 1}" BienOServicio="${type}">
            <dte:Cantidad>${i.quantity}</dte:Cantidad>
            <dte:UnidadMedida>UNI</dte:UnidadMedida>
            <dte:Descripcion>${i.description}</dte:Descripcion>
            <dte:PrecioUnitario>${i.price}</dte:PrecioUnitario>
            <dte:Precio>${i.price * i.quantity}</dte:Precio>
            <dte:Descuento>${i.discount}</dte:Descuento>
            <dte:Impuestos>
              <dte:Impuesto>
                <dte:NombreCorto>IVA</dte:NombreCorto>
                <dte:CodigoUnidadGravable>1</dte:CodigoUnidadGravable>
                <dte:MontoGravable>${subtotal}</dte:MontoGravable>
                <dte:MontoImpuesto>${iva}</dte:MontoImpuesto>
              </dte:Impuesto>
            </dte:Impuestos>
            <dte:Total>${this.decimal((i.price * i.quantity) - i.discount)}</dte:Total>
          </dte:Item>`;
          });

          let xmlAbonos = '';

          this.abonos.forEach((i: any, u: number) => {

            xmlAbonos += `<cfc:Abono>
              <cfc:NumeroAbono>${u + 1}</cfc:NumeroAbono>
              <cfc:FechaVencimiento>${i.date}</cfc:FechaVencimiento>
              <cfc:MontoAbono>${i.total}</cfc:MontoAbono>
            </cfc:Abono>`;
          });

          let xml = `<?xml version="1.0" encoding="UTF-8"?>
          <dte:GTDocumento xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"
            Version="0.1">
            <dte:SAT ClaseDocumento="dte">
              <dte:DTE ID="DatosCertificados">
                <dte:DatosEmision ID="DatosEmision">
                  <dte:DatosGenerales Tipo="FCAM" FechaHoraEmision="${this.operationForm.controls['date'].value}" CodigoMoneda="${this.operationForm.controls['currency'].value}" />
                  <dte:Emisor NITEmisor="${parseInt(this.company.nit)}" NombreEmisor="${this.company.name}" CodigoEstablecimiento="${this.branch.number}"
                    NombreComercial="${this.branch.name}" AfiliacionIVA="GEN">
                    <dte:DireccionEmisor>
                      <dte:Direccion>${this.company.address}</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionEmisor>
                  </dte:Emisor>
                  <dte:Receptor NombreReceptor="${this.customer.name}" IDReceptor="${this.customer.nit}" CorreoReceptor="${this.customer.email}">
                    <dte:DireccionReceptor>
                      <dte:Direccion>CIUDAD</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionReceptor>
                  </dte:Receptor>
                  <dte:Frases>
                    <dte:Frase TipoFrase="1" CodigoEscenario="1" />
                  </dte:Frases>
                  <dte:Items>
                    ${xmlItems}
                  </dte:Items>
                  <dte:Totales>
                    <dte:TotalImpuestos>
                      <dte:TotalImpuesto NombreCorto="IVA" TotalMontoImpuesto="${this.operationForm.controls['iva'].value}" />
                    </dte:TotalImpuestos>
                    <dte:GranTotal>${this.operationForm.controls['total'].value}</dte:GranTotal>
                  </dte:Totales>
                  <dte:Complementos>
                    <dte:Complemento xmlns:cfc="http://www.sat.gob.gt/dte/fel/CompCambiaria/0.1.0"
                        URIComplemento="dtecamb" NombreComplemento="FCAMB" IDComplemento="ID"
                        xsi:schemaLocation="http://www.sat.gob.gt/dte/fel/CompCambiaria/0.1.0 GT_Complemento_Cambiaria-0.1.0.xsd">
                        <cfc:AbonosFacturaCambiaria Version="1">
                          ${xmlAbonos}
                        </cfc:AbonosFacturaCambiaria>
                    </dte:Complemento>
                </dte:Complementos>
                </dte:DatosEmision>
              </dte:DTE>
              <dte:Adenda>
                <dtecomm:Informacion_COMERCIAL xsi:schemaLocation="https://www.digifact.com.gt/dtecomm"
                  xmlns:dtecomm="https://www.digifact.com.gt/dtecomm">
                  <dtecomm:InformacionAdicional Version="7.1234654163">
                    <dtecomm:REFERENCIA_INTERNA>${this.document.serie}-${this.document.correlative}</dtecomm:REFERENCIA_INTERNA>
                    <dtecomm:FECHA_REFERENCIA>${this.operationForm.controls['date'].value}</dtecomm:FECHA_REFERENCIA>
                    <dtecomm:VALIDAR_REFERENCIA_INTERNA>NO_VALIDAR</dtecomm:VALIDAR_REFERENCIA_INTERNA>
                  </dtecomm:InformacionAdicional>
                </dtecomm:Informacion_COMERCIAL>
              </dte:Adenda>
            </dte:SAT>
          </dte:GTDocumento>`;

          this.digifactService.certificacion(this.formatNit(this.company.nit), xml).then((certficacion: any) => {
            if (certficacion.Codigo == 1) {
              const op = {
                date: this.operationForm.controls['date'].value,
                nit: certficacion.NIT_COMPRADOR,
                total: this.operationForm.controls['total'].value,
                subtotal: this.operationForm.controls['subtotal'].value,
                iva: this.operationForm.controls['iva'].value,
                discount: this.operationForm.controls['discount'].value,
                exchange: this.operationForm.controls['exchange'].value,
                turned: this.operationForm.controls['turned'].value,
                currency: this.operationForm.controls['currency'].value,
                payment: this.operationForm.controls['payment'].value,
                observations: this.operationForm.controls['observations'].value,
                autorizacionFel: certficacion.Autorizacion,
                serieFel: certficacion.Serie,
                numberFel: certficacion.NUMERO,
                status: 'CERTIFICADA',
                customerId: this.operationForm.controls['customerId'].value,
                supplierId: this.operationForm.controls['supplierId'].value,
                documentId: this.operationForm.controls['documentId'].value,
                userId: this.operationForm.controls['userId'].value,
                branchId: this.operationForm.controls['branchId'].value,
                warehouseId: this.operationForm.controls['warehouseId'].value,
                operationId: this.operationForm.controls['operationId'].value,
                details: this.details,
                methods: this.methods,
                customer: this.customer,
                supplier: this.supplier,
                auto_date: this.auto_date
              };
              this.operationsService.postOperation(op).then(operation => {
                if (operation.result) {
                  this.invoice(operation.data);
                  notyf.open({ type: 'success', message: operation.message });
                } else {
                  notyf.open({ type: 'error', message: operation.message });
                  $('#bt-add-operation').removeClass('is-loading');
                }
              });
            } else {
              $('#bt-add-operation').removeClass('is-loading');
              $('#err-fel-panel').addClass('is-active');
              this.felDetails = certficacion;
              notyf.open({ type: 'error', message: certficacion.Mensaje });
            }
          }).catch((res: HttpErrorResponse) => {
            $('#bt-add-operation').removeClass('is-loading');
            $('#err-fel-panel').addClass('is-active');
            this.felDetails = res.error;
            notyf.open({ type: 'error', message: res.error.Mensaje });
          });

        } else {
          $('#bt-add-operation').removeClass('is-loading');
          notyf.open({ type: 'error', message: 'Informacion de Cliente Incompleta' });
        }

      }

      if (this.typedocument.name == 'NOTA DE CREDITO') {

        this.customer.email = this.customerForm.controls['email'].value;

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <dte:GTDocumento xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"
          Version="0.1">
          <dte:SAT ClaseDocumento="dte">
            <dte:DTE ID="DatosCertificados">
              <dte:DatosEmision ID="DatosEmision">
                <dte:DatosGenerales Tipo="NCRE" FechaHoraEmision="${this.operationForm.controls['date'].value}"
                  CodigoMoneda="${this.operationForm.controls['currency'].value}" />
                <dte:Emisor NITEmisor="${parseInt(this.company.nit)}" NombreEmisor="${this.company.name}"
                  CodigoEstablecimiento="${this.operation.branch.number}" NombreComercial="${this.operation.branch.name}" AfiliacionIVA="GEN">
                  <dte:DireccionEmisor>
                    <dte:Direccion>${this.company.address}</dte:Direccion>
                    <dte:CodigoPostal>01001</dte:CodigoPostal>
                    <dte:Municipio>GUATEMALA</dte:Municipio>
                    <dte:Departamento>GUATEMALA</dte:Departamento>
                    <dte:Pais>GT</dte:Pais>
                  </dte:DireccionEmisor>
                </dte:Emisor>
                <dte:Receptor NombreReceptor="${this.customer.name}" IDReceptor="${this.customer.nit}" CorreoReceptor="${this.customer.email}">
                  <dte:DireccionReceptor>
                    <dte:Direccion>CIUDAD</dte:Direccion>
                    <dte:CodigoPostal>01001</dte:CodigoPostal>
                    <dte:Municipio>GUATEMALA</dte:Municipio>
                    <dte:Departamento>GUATEMALA</dte:Departamento>
                    <dte:Pais>GT</dte:Pais>
                  </dte:DireccionReceptor>
                </dte:Receptor>
                <dte:Items>
                  <dte:Item NumeroLinea="1" BienOServicio="B">
                    <dte:Cantidad>1</dte:Cantidad>
                    <dte:UnidadMedida>UNI</dte:UnidadMedida>
                    <dte:Descripcion>Ingreso</dte:Descripcion>
                    <dte:PrecioUnitario>${this.operationForm.controls['total'].value}</dte:PrecioUnitario>
                    <dte:Precio>${this.operationForm.controls['total'].value}</dte:Precio>
                    <dte:Descuento>0</dte:Descuento>
                    <dte:Impuestos>
                      <dte:Impuesto>
                        <dte:NombreCorto>IVA</dte:NombreCorto>
                        <dte:CodigoUnidadGravable>1</dte:CodigoUnidadGravable>
                        <dte:MontoGravable>${this.operationForm.controls['subtotal'].value}</dte:MontoGravable>
                        <dte:MontoImpuesto>${this.operationForm.controls['iva'].value}</dte:MontoImpuesto>
                      </dte:Impuesto>
                    </dte:Impuestos>
                    <dte:Total>${this.operationForm.controls['total'].value}</dte:Total>
                  </dte:Item>
                </dte:Items>
                <dte:Totales>
                  <dte:TotalImpuestos>
                    <dte:TotalImpuesto NombreCorto="IVA" TotalMontoImpuesto="${this.operationForm.controls['iva'].value}" />
                  </dte:TotalImpuestos>
                  <dte:GranTotal>${this.operationForm.controls['total'].value}</dte:GranTotal>
                </dte:Totales>
                <dte:Complementos>
                  <dte:Complemento URIComplemento="dteref" NombreComplemento="NCRE"
                    xmlns:cno="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:schemaLocation="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0 GT_Complemento_Referencia_Nota-0.1.0.xsd">
                    <cno:ReferenciasNota Version="0.1" NumeroAutorizacionDocumentoOrigen="${this.operation.autorizacionFel}"
                      FechaEmisionDocumentoOrigen="${moment(this.operation.date).format('YYYY-MM-DD')}" MotivoAjuste="Errores"
                      NumeroDocumentoOrigen="${this.operation.numberFel}" SerieDocumentoOrigen="${this.operation.serieFel}" />
                  </dte:Complemento>
                </dte:Complementos>
              </dte:DatosEmision>
            </dte:DTE>
          </dte:SAT>
        </dte:GTDocumento>`;

        this.digifactService.certificacion(this.formatNit(this.company.nit), xml).then((certficacion: any) => {
          if (certficacion.Codigo == 1) {
            const op = {
              date: this.operationForm.controls['date'].value,
              nit: certficacion.NIT_COMPRADOR,
              total: this.operationForm.controls['total'].value,
              subtotal: this.operationForm.controls['subtotal'].value,
              iva: this.operationForm.controls['iva'].value,
              discount: this.operationForm.controls['discount'].value,
              exchange: this.operationForm.controls['exchange'].value,
              turned: this.operationForm.controls['turned'].value,
              currency: this.operationForm.controls['currency'].value,
              payment: this.operationForm.controls['payment'].value,
              observations: this.operationForm.controls['observations'].value,
              autorizacionFel: certficacion.Autorizacion,
              serieFel: certficacion.Serie,
              numberFel: certficacion.NUMERO,
              status: 'CERTIFICADA',
              customerId: this.operationForm.controls['customerId'].value,
              supplierId: this.operationForm.controls['supplierId'].value,
              documentId: this.operationForm.controls['documentId'].value,
              userId: this.operationForm.controls['userId'].value,
              branchId: this.operationForm.controls['branchId'].value,
              warehouseId: this.operationForm.controls['warehouseId'].value,
              operationId: this.operationForm.controls['operationId'].value,
              details: this.details,
              methods: this.methods,
              customer: this.customer,
              supplier: this.supplier,
              auto_date: this.auto_date
            };
            this.operationsService.postOperation(op).then(operation => {
              if (operation.result) {
                notyf.open({ type: 'success', message: operation.message });
                this.invoice(operation.data);
              } else {
                notyf.open({ type: 'error', message: operation.message });
                $('#bt-add-operation').removeClass('is-loading');
              }
            });
          } else {
            $('#bt-add-operation').removeClass('is-loading');
            $('#err-fel-panel').addClass('is-active');
            this.felDetails = certficacion;
            notyf.open({ type: 'error', message: certficacion.Mensaje });
          }
        }).catch((res: HttpErrorResponse) => {
          $('#bt-add-operation').removeClass('is-loading');
          $('#err-fel-panel').addClass('is-active');
          this.felDetails = res.error;
          notyf.open({ type: 'error', message: res.error.Mensaje });
        });
      }

      if (this.typedocument.name == 'NOTA DE DEBITO') {

        this.customer.email = this.customerForm.controls['email'].value;

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <dte:GTDocumento xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"
          Version="0.1">
          <dte:SAT ClaseDocumento="dte">
            <dte:DTE ID="DatosCertificados">
              <dte:DatosEmision ID="DatosEmision">
                <dte:DatosGenerales Tipo="NDEB" FechaHoraEmision="${this.operationForm.controls['date'].value}"
                  CodigoMoneda="${this.operationForm.controls['currency'].value}" />
                <dte:Emisor NITEmisor="${parseInt(this.company.nit)}" NombreEmisor="${this.company.name}"
                  CodigoEstablecimiento="${this.operation.branch.number}" NombreComercial="${this.operation.branch.name}" AfiliacionIVA="GEN">
                  <dte:DireccionEmisor>
                    <dte:Direccion>${this.company.address}</dte:Direccion>
                    <dte:CodigoPostal>01001</dte:CodigoPostal>
                    <dte:Municipio>GUATEMALA</dte:Municipio>
                    <dte:Departamento>GUATEMALA</dte:Departamento>
                    <dte:Pais>GT</dte:Pais>
                  </dte:DireccionEmisor>
                </dte:Emisor>
                <dte:Receptor NombreReceptor="${this.customer.name}" IDReceptor="${this.customer.nit}" CorreoReceptor="${this.customer.email}">
                  <dte:DireccionReceptor>
                    <dte:Direccion>CIUDAD</dte:Direccion>
                    <dte:CodigoPostal>01001</dte:CodigoPostal>
                    <dte:Municipio>GUATEMALA</dte:Municipio>
                    <dte:Departamento>GUATEMALA</dte:Departamento>
                    <dte:Pais>GT</dte:Pais>
                  </dte:DireccionReceptor>
                </dte:Receptor>
                <dte:Items>
                  <dte:Item NumeroLinea="1" BienOServicio="B">
                    <dte:Cantidad>1</dte:Cantidad>
                    <dte:UnidadMedida>UNI</dte:UnidadMedida>
                    <dte:Descripcion>Ingreso</dte:Descripcion>
                    <dte:PrecioUnitario>${this.operationForm.controls['total'].value}</dte:PrecioUnitario>
                    <dte:Precio>${this.operationForm.controls['total'].value}</dte:Precio>
                    <dte:Descuento>0</dte:Descuento>
                    <dte:Impuestos>
                      <dte:Impuesto>
                        <dte:NombreCorto>IVA</dte:NombreCorto>
                        <dte:CodigoUnidadGravable>1</dte:CodigoUnidadGravable>
                        <dte:MontoGravable>${this.operationForm.controls['subtotal'].value}</dte:MontoGravable>
                        <dte:MontoImpuesto>${this.operationForm.controls['iva'].value}</dte:MontoImpuesto>
                      </dte:Impuesto>
                    </dte:Impuestos>
                    <dte:Total>${this.operationForm.controls['total'].value}</dte:Total>
                  </dte:Item>
                </dte:Items>
                <dte:Totales>
                  <dte:TotalImpuestos>
                    <dte:TotalImpuesto NombreCorto="IVA" TotalMontoImpuesto="${this.operationForm.controls['iva'].value}" />
                  </dte:TotalImpuestos>
                  <dte:GranTotal>${this.operationForm.controls['total'].value}</dte:GranTotal>
                </dte:Totales>
                <dte:Complementos>
                  <dte:Complemento URIComplemento="dteref" NombreComplemento="NDEB"
                    xmlns:cno="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:schemaLocation="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0 GT_Complemento_Referencia_Nota-0.1.0.xsd">
                    <cno:ReferenciasNota Version="0.1" NumeroAutorizacionDocumentoOrigen="${this.operation.autorizacionFel}"
                      FechaEmisionDocumentoOrigen="${moment(this.operation.date).format('YYYY-MM-DD')}" MotivoAjuste="Errores"
                      NumeroDocumentoOrigen="${this.operation.numberFel}" SerieDocumentoOrigen="${this.operation.serieFel}" />
                  </dte:Complemento>
                </dte:Complementos>
              </dte:DatosEmision>
            </dte:DTE>
          </dte:SAT>
        </dte:GTDocumento>`;

        this.digifactService.certificacion(this.formatNit(this.company.nit), xml).then((certficacion: any) => {
          if (certficacion.Codigo == 1) {
            const op = {
              date: this.operationForm.controls['date'].value,
              nit: certficacion.NIT_COMPRADOR,
              total: this.operationForm.controls['total'].value,
              subtotal: this.operationForm.controls['subtotal'].value,
              iva: this.operationForm.controls['iva'].value,
              discount: this.operationForm.controls['discount'].value,
              exchange: this.operationForm.controls['exchange'].value,
              turned: this.operationForm.controls['turned'].value,
              currency: this.operationForm.controls['currency'].value,
              payment: this.operationForm.controls['payment'].value,
              observations: this.operationForm.controls['observations'].value,
              autorizacionFel: certficacion.Autorizacion,
              serieFel: certficacion.Serie,
              numberFel: certficacion.NUMERO,
              status: 'CERTIFICADA',
              customerId: this.operationForm.controls['customerId'].value,
              supplierId: this.operationForm.controls['supplierId'].value,
              documentId: this.operationForm.controls['documentId'].value,
              userId: this.operationForm.controls['userId'].value,
              branchId: this.operationForm.controls['branchId'].value,
              warehouseId: this.operationForm.controls['warehouseId'].value,
              operationId: this.operationForm.controls['operationId'].value,
              details: this.details,
              methods: this.methods,
              customer: this.customer,
              supplier: this.supplier,
              auto_date: this.auto_date
            };
            this.operationsService.postOperation(op).then(operation => {
              if (operation.result) {
                this.invoice(operation.data);
                notyf.open({ type: 'success', message: operation.message });
              } else {
                notyf.open({ type: 'error', message: operation.message });
                $('#bt-add-operation').removeClass('is-loading');
              }
            });
          } else {
            $('#bt-add-operation').removeClass('is-loading');
            $('#err-fel-panel').addClass('is-active');
            this.felDetails = certficacion;
            notyf.open({ type: 'error', message: certficacion.Mensaje });
          }
        }).catch((res: HttpErrorResponse) => {
          $('#bt-add-operation').removeClass('is-loading');
          $('#err-fel-panel').addClass('is-active');
          this.felDetails = res.error;
          notyf.open({ type: 'error', message: res.error.Mensaje });
        });
      }

      if (this.typedocument.name == 'NOTA DE ABONO') {

        this.customer.email = this.customerForm.controls['email'].value;

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <dte:GTDocumento xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"
          Version="0.1">
          <dte:SAT ClaseDocumento="dte">
            <dte:DTE ID="DatosCertificados">
              <dte:DatosEmision ID="DatosEmision">
                <dte:DatosGenerales Tipo="NABN" FechaHoraEmision="${this.operationForm.controls['date'].value}"
                  CodigoMoneda="${this.operationForm.controls['currency'].value}" />
                <dte:Emisor NITEmisor="${parseInt(this.company.nit)}" NombreEmisor="${this.company.name}"
                  CodigoEstablecimiento="${this.operation.branch.number}" NombreComercial="${this.operation.branch.name}" AfiliacionIVA="GEN">
                  <dte:DireccionEmisor>
                    <dte:Direccion>${this.company.address}</dte:Direccion>
                    <dte:CodigoPostal>01001</dte:CodigoPostal>
                    <dte:Municipio>GUATEMALA</dte:Municipio>
                    <dte:Departamento>GUATEMALA</dte:Departamento>
                    <dte:Pais>GT</dte:Pais>
                  </dte:DireccionEmisor>
                </dte:Emisor>
                <dte:Receptor NombreReceptor="${this.customer.name}" IDReceptor="${this.customer.nit}" CorreoReceptor="${this.customer.email}">
                  <dte:DireccionReceptor>
                    <dte:Direccion>CIUDAD</dte:Direccion>
                    <dte:CodigoPostal>01001</dte:CodigoPostal>
                    <dte:Municipio>GUATEMALA</dte:Municipio>
                    <dte:Departamento>GUATEMALA</dte:Departamento>
                    <dte:Pais>GT</dte:Pais>
                  </dte:DireccionReceptor>
                </dte:Receptor>
                <dte:Items>
                  <dte:Item NumeroLinea="1" BienOServicio="B">
                    <dte:Cantidad>1</dte:Cantidad>
                    <dte:UnidadMedida>UNI</dte:UnidadMedida>
                    <dte:Descripcion>Ingreso</dte:Descripcion>
                    <dte:PrecioUnitario>${this.operationForm.controls['total'].value}</dte:PrecioUnitario>
                    <dte:Precio>${this.operationForm.controls['total'].value}</dte:Precio>
                    <dte:Descuento>0</dte:Descuento>
                    <dte:Total>${this.operationForm.controls['total'].value}</dte:Total>
                  </dte:Item>
                </dte:Items>
                <dte:Totales>
                  <dte:GranTotal>${this.operationForm.controls['total'].value}</dte:GranTotal>
                </dte:Totales>
              </dte:DatosEmision>
            </dte:DTE>
          </dte:SAT>
        </dte:GTDocumento>`;

        this.digifactService.certificacion(this.formatNit(this.company.nit), xml).then((certficacion: any) => {
          if (certficacion.Codigo == 1) {
            const op = {
              date: this.operationForm.controls['date'].value,
              nit: certficacion.NIT_COMPRADOR,
              total: this.operationForm.controls['total'].value,
              subtotal: this.operationForm.controls['subtotal'].value,
              iva: this.operationForm.controls['iva'].value,
              discount: this.operationForm.controls['discount'].value,
              exchange: this.operationForm.controls['exchange'].value,
              turned: this.operationForm.controls['turned'].value,
              currency: this.operationForm.controls['currency'].value,
              payment: this.operationForm.controls['payment'].value,
              observations: this.operationForm.controls['observations'].value,
              autorizacionFel: certficacion.Autorizacion,
              serieFel: certficacion.Serie,
              numberFel: certficacion.NUMERO,
              status: 'CERTIFICADA',
              customerId: this.operationForm.controls['customerId'].value,
              supplierId: this.operationForm.controls['supplierId'].value,
              documentId: this.operationForm.controls['documentId'].value,
              userId: this.operationForm.controls['userId'].value,
              branchId: this.operationForm.controls['branchId'].value,
              warehouseId: this.operationForm.controls['warehouseId'].value,
              operationId: this.operationForm.controls['operationId'].value,
              details: this.details,
              methods: this.methods,
              customer: this.customer,
              supplier: this.supplier,
              auto_date: this.auto_date
            };
            this.operationsService.postOperation(op).then(operation => {
              if (operation.result) {
                this.invoice(operation.data);
                notyf.open({ type: 'success', message: operation.message });
              } else {
                notyf.open({ type: 'error', message: operation.message });
                $('#bt-add-operation').removeClass('is-loading');
              }
            });
          } else {
            $('#bt-add-operation').removeClass('is-loading');
            $('#err-fel-panel').addClass('is-active');
            this.felDetails = certficacion;
            notyf.open({ type: 'error', message: certficacion.Mensaje });
          }
        }).catch((res: HttpErrorResponse) => {
          $('#bt-add-operation').removeClass('is-loading');
          $('#err-fel-panel').addClass('is-active');
          this.felDetails = res.error;
          notyf.open({ type: 'error', message: res.error.Mensaje });
        });
      }

      if (this.typedocument.name == 'FACTURA ESPECIAL') {

        if (this.supplierForm.valid) {

          if (this.operationForm.controls['supplierId'].value == 0) {

            let supplier: any = await this.suppliersService.postSupplier(this.supplierForm.value);
            if (supplier.result) {
              this.operationForm.controls['supplierId'].setValue(supplier.data.id);
              this.setSupplier(supplier.data);
            } else {
              notyf.open({ type: 'error', message: 'Error al Agregar Proveedor' });
              return;
            }
          }

          this.customer.email = this.customerForm.controls['email'].value;

          let xmlItems = '';

          this.details.forEach((i: any, u: number) => {
            const subtotal = this.decimal(((i.price * i.quantity) - i.discount) / parseFloat(`${1}.${this.company.iva}`));
            const iva = this.decimal((subtotal) * parseFloat(`${0}.${this.company.iva}`));

            let type = 'B';
            if (i.type == 'SERVICIO') {
              type = 'S';
            }

            xmlItems += `<dte:Item NumeroLinea="${u + 1}" BienOServicio="${type}">
            <dte:Cantidad>${i.quantity}</dte:Cantidad>
            <dte:UnidadMedida>UNI</dte:UnidadMedida>
            <dte:Descripcion>${i.description}</dte:Descripcion>
            <dte:PrecioUnitario>${i.price}</dte:PrecioUnitario>
            <dte:Precio>${i.price * i.quantity}</dte:Precio>
            <dte:Descuento>${i.discount}</dte:Descuento>
            <dte:Impuestos>
              <dte:Impuesto>
                <dte:NombreCorto>IVA</dte:NombreCorto>
                <dte:CodigoUnidadGravable>1</dte:CodigoUnidadGravable>
                <dte:MontoGravable>${subtotal}</dte:MontoGravable>
                <dte:MontoImpuesto>${iva}</dte:MontoImpuesto>
              </dte:Impuesto>
            </dte:Impuestos>
            <dte:Total>${this.decimal((i.price * i.quantity) - i.discount)}</dte:Total>
          </dte:Item>`;
          });

          let isr = this.decimal(this.operationForm.controls['subtotal'].value * 0.05);

          let xml = `<?xml version="1.0" encoding="UTF-8"?>
          <dte:GTDocumento xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"
            Version="0.1">
            <dte:SAT ClaseDocumento="dte">
              <dte:DTE ID="DatosCertificados">
                <dte:DatosEmision ID="DatosEmision">
                  <dte:DatosGenerales Tipo="FESP" FechaHoraEmision="${this.operationForm.controls['date'].value}" CodigoMoneda="${this.operationForm.controls['currency'].value}" />
                  <dte:Emisor NITEmisor="${parseInt(this.company.nit)}" NombreEmisor="${this.company.name}" CodigoEstablecimiento="${this.branch.number}"
                    NombreComercial="${this.branch.name}" AfiliacionIVA="GEN">
                    <dte:DireccionEmisor>
                      <dte:Direccion>${this.company.address}</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionEmisor>
                  </dte:Emisor>
                  <dte:Receptor NombreReceptor="${this.supplier.name}" IDReceptor="${this.supplier.nit}" TipoEspecial="CUI" CorreoReceptor="${this.customer.email}">
                    <dte:DireccionReceptor>
                      <dte:Direccion>CIUDAD</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionReceptor>
                  </dte:Receptor>
                  <dte:Items>
                    ${xmlItems}
                  </dte:Items>
                  <dte:Totales>
                    <dte:TotalImpuestos>
                      <dte:TotalImpuesto NombreCorto="IVA" TotalMontoImpuesto="${this.operationForm.controls['iva'].value}" />
                    </dte:TotalImpuestos>
                    <dte:GranTotal>${this.operationForm.controls['total'].value}</dte:GranTotal>
                  </dte:Totales>
                  <dte:Complementos>
                    <dte:Complemento URIComplemento="cfe" NombreComplemento="FESP" IDComplemento="ID">
                      <cfe:RetencionesFacturaEspecial xmlns:cfe="http://www.sat.gob.gt/face2/ComplementoFacturaEspecial/0.1.0"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xsi:schemaLocation="http://www.sat.gob.gt/face2/ComplementoFacturaEspecial/0.1.0 GT_Complemento_Fac_Especial-0.1.0.xsd" Version="1">
                          <cfe:RetencionISR>${isr}</cfe:RetencionISR>
                          <cfe:RetencionIVA>${this.operationForm.controls['iva'].value}</cfe:RetencionIVA>
                          <cfe:TotalMenosRetenciones>${this.operationForm.controls['total'].value - (isr) - this.operationForm.controls['iva'].value}</cfe:TotalMenosRetenciones>
                      </cfe:RetencionesFacturaEspecial>
                    </dte:Complemento>
                  </dte:Complementos>
                </dte:DatosEmision>
              </dte:DTE>
              <dte:Adenda>
                <dtecomm:Informacion_COMERCIAL xsi:schemaLocation="https://www.digifact.com.gt/dtecomm"
                  xmlns:dtecomm="https://www.digifact.com.gt/dtecomm">
                  <dtecomm:InformacionAdicional Version="7.1234654163">
                    <dtecomm:REFERENCIA_INTERNA>${this.document.serie}-${this.document.correlative}</dtecomm:REFERENCIA_INTERNA>
                    <dtecomm:FECHA_REFERENCIA>${this.operationForm.controls['date'].value}</dtecomm:FECHA_REFERENCIA>
                    <dtecomm:VALIDAR_REFERENCIA_INTERNA>NO_VALIDAR</dtecomm:VALIDAR_REFERENCIA_INTERNA>
                  </dtecomm:InformacionAdicional>
                </dtecomm:Informacion_COMERCIAL>
              </dte:Adenda>
            </dte:SAT>
          </dte:GTDocumento>`;

          this.digifactService.certificacion(this.formatNit(this.company.nit), xml).then((certficacion: any) => {
            if (certficacion.Codigo == 1) {
              const op = {
                date: this.operationForm.controls['date'].value,
                nit: certficacion.NIT_COMPRADOR,
                total: this.operationForm.controls['total'].value,
                subtotal: this.operationForm.controls['subtotal'].value,
                iva: this.operationForm.controls['iva'].value,
                isr: isr,
                discount: this.operationForm.controls['discount'].value,
                exchange: this.operationForm.controls['exchange'].value,
                turned: this.operationForm.controls['turned'].value,
                currency: this.operationForm.controls['currency'].value,
                payment: this.operationForm.controls['payment'].value,
                observations: this.operationForm.controls['observations'].value,
                autorizacionFel: certficacion.Autorizacion,
                serieFel: certficacion.Serie,
                numberFel: certficacion.NUMERO,
                status: 'CERTIFICADA',
                customerId: this.operationForm.controls['customerId'].value,
                supplierId: this.operationForm.controls['supplierId'].value,
                documentId: this.operationForm.controls['documentId'].value,
                userId: this.operationForm.controls['userId'].value,
                branchId: this.operationForm.controls['branchId'].value,
                warehouseId: this.operationForm.controls['warehouseId'].value,
                operationId: this.operationForm.controls['operationId'].value,
                details: this.details,
                methods: this.methods,
                customer: this.customer,
                supplier: this.supplier,
                auto_date: this.auto_date
              };
              this.operationsService.postOperation(op).then(operation => {
                if (operation.result) {
                  this.invoice(operation.data);
                  notyf.open({ type: 'success', message: operation.message });
                } else {
                  notyf.open({ type: 'error', message: operation.message });
                  $('#bt-add-operation').removeClass('is-loading');
                }
              });
            } else {
              $('#bt-add-operation').removeClass('is-loading');
              $('#err-fel-panel').addClass('is-active');
              this.felDetails = certficacion;
              notyf.open({ type: 'error', message: certficacion.Mensaje });
            }
          }).catch((res: HttpErrorResponse) => {
            $('#bt-add-operation').removeClass('is-loading');
            $('#err-fel-panel').addClass('is-active');
            this.felDetails = res.error;
            notyf.open({ type: 'error', message: res.error.Mensaje });
          });

        }

      }

      if (this.typedocument.name == 'RECIBO') {

        if (this.customerForm.valid) {

          if (this.operationForm.controls['customerId'].value == 0) {

            let customer: any = await this.customersService.postCustomer(this.customerForm.value);
            if (customer.result) {
              this.operationForm.controls['customerId'].setValue(customer.data.id);
              this.setCustomer(customer.data);
            } else {
              notyf.open({ type: 'error', message: 'Error al Agregar Cliente' });
              return;
            }
          }

          this.customer.email = this.customerForm.controls['email'].value;

          let xmlItems = '';

          this.details.forEach((i: any, u: number) => {
            const subtotal = this.decimal(((i.price * i.quantity) - i.discount) / parseFloat(`${1}.${this.company.iva}`));
            const iva = this.decimal((subtotal) * parseFloat(`${0}.${this.company.iva}`));

            let type = 'B';
            if (i.type == 'SERVICIO') {
              type = 'S';
            }

            xmlItems += `<dte:Item NumeroLinea="${u + 1}" BienOServicio="${type}">
            <dte:Cantidad>${i.quantity}</dte:Cantidad>
            <dte:UnidadMedida>UNI</dte:UnidadMedida>
            <dte:Descripcion>${i.description}</dte:Descripcion>
            <dte:PrecioUnitario>${i.price}</dte:PrecioUnitario>
            <dte:Precio>${i.price * i.quantity}</dte:Precio>
            <dte:Descuento>${i.discount}</dte:Descuento>
            <dte:Total>${this.decimal((i.price * i.quantity) - i.discount)}</dte:Total>
          </dte:Item>`;
          });

          let xml = `<?xml version="1.0" encoding="UTF-8"?>
          <dte:GTDocumento xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"
            Version="0.1">
            <dte:SAT ClaseDocumento="dte">
              <dte:DTE ID="DatosCertificados">
                <dte:DatosEmision ID="DatosEmision">
                  <dte:DatosGenerales Tipo="RECI" FechaHoraEmision="${this.operationForm.controls['date'].value}" CodigoMoneda="${this.operationForm.controls['currency'].value}" />
                  <dte:Emisor NITEmisor="${parseInt(this.company.nit)}" NombreEmisor="${this.company.name}" CodigoEstablecimiento="${this.branch.number}"
                    NombreComercial="${this.branch.name}" AfiliacionIVA="GEN">
                    <dte:DireccionEmisor>
                      <dte:Direccion>${this.company.address}</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionEmisor>
                  </dte:Emisor>
                  <dte:Receptor NombreReceptor="${this.customer.name}" IDReceptor="${this.customer.nit}" CorreoReceptor="${this.customer.email}">
                    <dte:DireccionReceptor>
                      <dte:Direccion>CIUDAD</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionReceptor>
                  </dte:Receptor>
                  <dte:Frases>
                    <dte:Frase TipoFrase="4" CodigoEscenario="6"/>
                  </dte:Frases>
                  <dte:Items>
                    ${xmlItems}
                  </dte:Items>
                  <dte:Totales>
                    <dte:GranTotal>${this.operationForm.controls['total'].value}</dte:GranTotal>
                  </dte:Totales>
                </dte:DatosEmision>
              </dte:DTE>
              <dte:Adenda>
                <dtecomm:Informacion_COMERCIAL xsi:schemaLocation="https://www.digifact.com.gt/dtecomm"
                  xmlns:dtecomm="https://www.digifact.com.gt/dtecomm">
                  <dtecomm:InformacionAdicional Version="7.1234654163">
                    <dtecomm:REFERENCIA_INTERNA>${this.document.serie}-${this.document.correlative}</dtecomm:REFERENCIA_INTERNA>
                    <dtecomm:FECHA_REFERENCIA>${this.operationForm.controls['date'].value}</dtecomm:FECHA_REFERENCIA>
                    <dtecomm:VALIDAR_REFERENCIA_INTERNA>NO_VALIDAR</dtecomm:VALIDAR_REFERENCIA_INTERNA>
                  </dtecomm:InformacionAdicional>
                </dtecomm:Informacion_COMERCIAL>
              </dte:Adenda>
            </dte:SAT>
          </dte:GTDocumento>`;

          this.digifactService.certificacion(this.formatNit(this.company.nit), xml).then((certficacion: any) => {
            if (certficacion.Codigo == 1) {
              const op = {
                date: this.operationForm.controls['date'].value,
                nit: certficacion.NIT_COMPRADOR,
                total: this.operationForm.controls['total'].value,
                subtotal: this.operationForm.controls['subtotal'].value,
                iva: this.operationForm.controls['iva'].value,
                discount: this.operationForm.controls['discount'].value,
                exchange: this.operationForm.controls['exchange'].value,
                turned: this.operationForm.controls['turned'].value,
                currency: this.operationForm.controls['currency'].value,
                payment: this.operationForm.controls['payment'].value,
                observations: this.operationForm.controls['observations'].value,
                autorizacionFel: certficacion.Autorizacion,
                serieFel: certficacion.Serie,
                numberFel: certficacion.NUMERO,
                status: 'CERTIFICADA',
                customerId: this.operationForm.controls['customerId'].value,
                supplierId: this.operationForm.controls['supplierId'].value,
                documentId: this.operationForm.controls['documentId'].value,
                userId: this.operationForm.controls['userId'].value,
                branchId: this.operationForm.controls['branchId'].value,
                warehouseId: this.operationForm.controls['warehouseId'].value,
                operationId: this.operationForm.controls['operationId'].value,
                details: this.details,
                methods: this.methods,
                customer: this.customer,
                supplier: this.supplier,
                auto_date: this.auto_date
              };
              this.operationsService.postOperation(op).then(operation => {
                if (operation.result) {
                  this.invoice(operation.data);
                  notyf.open({ type: 'success', message: operation.message });
                } else {
                  notyf.open({ type: 'error', message: operation.message });
                  $('#bt-add-operation').removeClass('is-loading');
                }
              });
            } else {
              $('#bt-add-operation').removeClass('is-loading');
              $('#err-fel-panel').addClass('is-active');
              this.felDetails = certficacion;
              notyf.open({ type: 'error', message: certficacion.Mensaje });
            }
          }).catch((res: HttpErrorResponse) => {
            $('#bt-add-operation').removeClass('is-loading');
            $('#err-fel-panel').addClass('is-active');
            this.felDetails = res.error;
            notyf.open({ type: 'error', message: res.error.Mensaje });
          });

        } else {
          $('#bt-add-operation').removeClass('is-loading');
          notyf.open({ type: 'error', message: 'Informacion de Cliente Incompleta' });
        }

      }

      if (this.typedocument.name == 'RECIBO POR DONACION') {

        if (this.customerForm.valid) {

          if (this.operationForm.controls['customerId'].value == 0) {

            let customer: any = await this.customersService.postCustomer(this.customerForm.value);
            if (customer.result) {
              this.operationForm.controls['customerId'].setValue(customer.data.id);
              this.setCustomer(customer.data);
            } else {
              notyf.open({ type: 'error', message: 'Error al Agregar Cliente' });
              return;
            }
          }

          this.customer.email = this.customerForm.controls['email'].value;

          let xmlItems = '';

          this.details.forEach((i: any, u: number) => {
            const subtotal = this.decimal(((i.price * i.quantity) - i.discount) / parseFloat(`${1}.${this.company.iva}`));
            const iva = this.decimal((subtotal) * parseFloat(`${0}.${this.company.iva}`));

            let type = 'B';
            if (i.type == 'SERVICIO') {
              type = 'S';
            }

            xmlItems += `<dte:Item NumeroLinea="${u + 1}" BienOServicio="${type}">
            <dte:Cantidad>${i.quantity}</dte:Cantidad>
            <dte:UnidadMedida>UNI</dte:UnidadMedida>
            <dte:Descripcion>${i.description}</dte:Descripcion>
            <dte:PrecioUnitario>${i.price}</dte:PrecioUnitario>
            <dte:Precio>${i.price * i.quantity}</dte:Precio>
            <dte:Descuento>${i.discount}</dte:Descuento>
            <dte:Total>${this.decimal((i.price * i.quantity) - i.discount)}</dte:Total>
          </dte:Item>`;
          });

          let xml = `<?xml version="1.0" encoding="UTF-8"?>
          <dte:GTDocumento xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"
            Version="0.1">
            <dte:SAT ClaseDocumento="dte">
              <dte:DTE ID="DatosCertificados">
                <dte:DatosEmision ID="DatosEmision">
                  <dte:DatosGenerales Tipo="RDON" FechaHoraEmision="${this.operationForm.controls['date'].value}" CodigoMoneda="${this.operationForm.controls['currency'].value}" />
                  <dte:Emisor NITEmisor="${parseInt(this.company.nit)}" NombreEmisor="${this.company.name}" CodigoEstablecimiento="${this.branch.number}"
                    NombreComercial="${this.branch.name}" AfiliacionIVA="GEN">
                    <dte:DireccionEmisor>
                      <dte:Direccion>${this.company.address}</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionEmisor>
                  </dte:Emisor>
                  <dte:Receptor NombreReceptor="${this.customer.name}" IDReceptor="${this.customer.nit}" CorreoReceptor="${this.customer.email}">
                    <dte:DireccionReceptor>
                      <dte:Direccion>CIUDAD</dte:Direccion>
                      <dte:CodigoPostal>01001</dte:CodigoPostal>
                      <dte:Municipio>GUATEMALA</dte:Municipio>
                      <dte:Departamento>GUATEMALA</dte:Departamento>
                      <dte:Pais>GT</dte:Pais>
                    </dte:DireccionReceptor>
                  </dte:Receptor>
                  <dte:Frases>
                    <dte:Frase TipoFrase="4" CodigoEscenario="4"/>
                  </dte:Frases>
                  <dte:Items>
                    ${xmlItems}
                  </dte:Items>
                  <dte:Totales>
                    <dte:GranTotal>${this.operationForm.controls['total'].value}</dte:GranTotal>
                  </dte:Totales>
                </dte:DatosEmision>
              </dte:DTE>
              <dte:Adenda>
                <dtecomm:Informacion_COMERCIAL xsi:schemaLocation="https://www.digifact.com.gt/dtecomm"
                  xmlns:dtecomm="https://www.digifact.com.gt/dtecomm">
                  <dtecomm:InformacionAdicional Version="7.1234654163">
                    <dtecomm:REFERENCIA_INTERNA>${this.document.serie}-${this.document.correlative}</dtecomm:REFERENCIA_INTERNA>
                    <dtecomm:FECHA_REFERENCIA>${this.operationForm.controls['date'].value}</dtecomm:FECHA_REFERENCIA>
                    <dtecomm:VALIDAR_REFERENCIA_INTERNA>NO_VALIDAR</dtecomm:VALIDAR_REFERENCIA_INTERNA>
                  </dtecomm:InformacionAdicional>
                </dtecomm:Informacion_COMERCIAL>
              </dte:Adenda>
            </dte:SAT>
          </dte:GTDocumento>`;

          this.digifactService.certificacion(this.formatNit(this.company.nit), xml).then((certficacion: any) => {
            if (certficacion.Codigo == 1) {
              const op = {
                date: this.operationForm.controls['date'].value,
                nit: certficacion.NIT_COMPRADOR,
                total: this.operationForm.controls['total'].value,
                subtotal: this.operationForm.controls['subtotal'].value,
                iva: this.operationForm.controls['iva'].value,
                discount: this.operationForm.controls['discount'].value,
                exchange: this.operationForm.controls['exchange'].value,
                turned: this.operationForm.controls['turned'].value,
                currency: this.operationForm.controls['currency'].value,
                payment: this.operationForm.controls['payment'].value,
                observations: this.operationForm.controls['observations'].value,
                autorizacionFel: certficacion.Autorizacion,
                serieFel: certficacion.Serie,
                numberFel: certficacion.NUMERO,
                status: 'CERTIFICADA',
                customerId: this.operationForm.controls['customerId'].value,
                supplierId: this.operationForm.controls['supplierId'].value,
                documentId: this.operationForm.controls['documentId'].value,
                userId: this.operationForm.controls['userId'].value,
                branchId: this.operationForm.controls['branchId'].value,
                warehouseId: this.operationForm.controls['warehouseId'].value,
                operationId: this.operationForm.controls['operationId'].value,
                details: this.details,
                methods: this.methods,
                customer: this.customer,
                supplier: this.supplier,
                auto_date: this.auto_date
              };
              this.operationsService.postOperation(op).then(operation => {
                if (operation.result) {
                  this.invoice(operation.data);
                  notyf.open({ type: 'success', message: operation.message });
                } else {
                  notyf.open({ type: 'error', message: operation.message });
                  $('#bt-add-operation').removeClass('is-loading');
                }
              });
            } else {
              $('#bt-add-operation').removeClass('is-loading');
              $('#err-fel-panel').addClass('is-active');
              this.felDetails = certficacion;
              notyf.open({ type: 'error', message: certficacion.Mensaje });
            }
          }).catch((res: HttpErrorResponse) => {
            $('#bt-add-operation').removeClass('is-loading');
            $('#err-fel-panel').addClass('is-active');
            this.felDetails = res.error;
            notyf.open({ type: 'error', message: res.error.Mensaje });
          });

        } else {
          $('#bt-add-operation').removeClass('is-loading');
          notyf.open({ type: 'error', message: 'Informacion de Cliente Incompleta' });
        }
      }

      if (this.typedocument.name == 'CARGA INVENTARIO') {
        const op = {
          date: this.operationForm.controls['date'].value,
          total: this.operationForm.controls['total'].value,
          subtotal: this.operationForm.controls['subtotal'].value,
          iva: this.operationForm.controls['iva'].value,
          discount: this.operationForm.controls['discount'].value,
          exchange: this.operationForm.controls['exchange'].value,
          turned: this.operationForm.controls['turned'].value,
          currency: this.operationForm.controls['currency'].value,
          payment: this.operationForm.controls['payment'].value,
          observations: this.operationForm.controls['observations'].value,
          status: 'CERTIFICADA',
          documentId: this.operationForm.controls['documentId'].value,
          userId: this.operationForm.controls['userId'].value,
          branchId: this.operationForm.controls['branchId'].value,
          warehouseId: this.operationForm.controls['warehouseId'].value,
          details: this.details,
          auto_date: this.auto_date
        };

        this.operationsService.postOperation(op).then(operation => {
          if (operation.result) {
            this.invoice(operation.data);
            notyf.open({ type: 'success', message: operation.message });
          } else {
            notyf.open({ type: 'error', message: operation.message });
            $('#bt-add-operation').removeClass('is-loading');
          }
        });
      }

      if (this.typedocument.name == 'DESCARGA INVENTARIO') {
        const op = {
          date: this.operationForm.controls['date'].value,
          total: this.operationForm.controls['total'].value,
          subtotal: this.operationForm.controls['subtotal'].value,
          iva: this.operationForm.controls['iva'].value,
          discount: this.operationForm.controls['discount'].value,
          exchange: this.operationForm.controls['exchange'].value,
          turned: this.operationForm.controls['turned'].value,
          currency: this.operationForm.controls['currency'].value,
          payment: this.operationForm.controls['payment'].value,
          observations: this.operationForm.controls['observations'].value,
          status: 'CERTIFICADA',
          documentId: this.operationForm.controls['documentId'].value,
          userId: this.operationForm.controls['userId'].value,
          branchId: this.operationForm.controls['branchId'].value,
          warehouseId: this.operationForm.controls['warehouseId'].value,
          details: this.details,
          auto_date: this.auto_date
        };

        this.operationsService.postOperation(op).then(operation => {
          if (operation.result) {
            this.invoice(operation.data);
            notyf.open({ type: 'success', message: operation.message });
          } else {
            notyf.open({ type: 'error', message: operation.message });
            $('#bt-add-operation').removeClass('is-loading');
          }
        });
      }

      if (this.typedocument.name == 'TRASLADO') {
        const op = {
          date: this.operationForm.controls['date'].value,
          total: this.operationForm.controls['total'].value,
          subtotal: this.operationForm.controls['subtotal'].value,
          iva: this.operationForm.controls['iva'].value,
          discount: this.operationForm.controls['discount'].value,
          exchange: this.operationForm.controls['exchange'].value,
          turned: this.operationForm.controls['turned'].value,
          currency: this.operationForm.controls['currency'].value,
          payment: this.operationForm.controls['payment'].value,
          observations: this.operationForm.controls['observations'].value,
          status: 'CERTIFICADA',
          documentId: this.operationForm.controls['documentId'].value,
          userId: this.operationForm.controls['userId'].value,
          branchId: this.operationForm.controls['branchId'].value,
          warehouseId: this.operationForm.controls['warehouseId'].value,
          details: this.details,
          branch_end: this.branch_end,
          warehouse_end: this.warehouse_end,
          auto_date: this.auto_date
        };

        this.operationsService.postOperation(op).then(operation => {
          if (operation.result) {
            this.invoice(operation.data);
            notyf.open({ type: 'success', message: operation.message });
          } else {
            notyf.open({ type: 'error', message: operation.message });
            $('#bt-add-operation').removeClass('is-loading');
          }
        });
      }

      if (this.typedocument.name == 'ABONO') {

        const op = {
          date: this.operationForm.controls['date'].value,
          nit: this.operation.nit,
          total: this.operationForm.controls['total'].value,
          subtotal: this.operationForm.controls['subtotal'].value,
          iva: this.operationForm.controls['iva'].value,
          discount: this.operationForm.controls['discount'].value,
          exchange: this.operationForm.controls['exchange'].value,
          turned: this.operationForm.controls['turned'].value,
          currency: this.operationForm.controls['currency'].value,
          payment: this.operationForm.controls['payment'].value,
          observations: this.operationForm.controls['observations'].value,
          status: 'CERTIFICADA',
          customerId: this.operationForm.controls['customerId'].value,
          supplierId: this.operationForm.controls['supplierId'].value,
          documentId: this.operationForm.controls['documentId'].value,
          userId: this.operationForm.controls['userId'].value,
          branchId: this.operationForm.controls['branchId'].value,
          warehouseId: this.operationForm.controls['warehouseId'].value,
          operationId: this.operationForm.controls['operationId'].value,
          details: this.details,
          methods: this.methods,
          customer: this.customer,
          supplier: this.supplier,
          auto_date: this.auto_date
        };
        this.operationsService.postOperation(op).then(operation => {
          if (operation.result) {
            this.invoice(operation.data);
            notyf.open({ type: 'success', message: operation.message });
          } else {
            notyf.open({ type: 'error', message: operation.message });
            $('#bt-add-operation').removeClass('is-loading');
          }
        });
      }

    }
  }

  async invoice(operation: any) {
    this.id = operation.id;
    this.router.navigate(['pos/operations/invoice', this.id]);
    localStorage.removeItem(`details${this.documentId}`);

    // Print Invoice
    await this.printInvoice(operation);

    // Send Invoice
    await this.emailInvoice();

    $('#bt-add-operation').removeClass('is-loading');

  }

  async printInvoice(operation: any) {
    if (this.company.printer) {
      let details = 'PRODUCTO';
      for (let t = 0; t < this.company.tabs - 14; t++) {
        details += ' ';
      }
      details += 'PRECIO';
      details += this.lines(this.company.tabs);
      for (let i = 0; i < this.details.length; i++) {
        let subtotal = 0;
        if (this.typedocument.inventory == 'ENTRADA') {
          subtotal = this.details[i].cost * this.details[i].quantity;
        }
        if (this.typedocument.inventory == 'SALIDA') {
          subtotal = this.details[i].price * this.details[i].quantity;
        }
        subtotal = parseFloat(accounting.toFixed(subtotal, 2));
        details += this.items(Math.round(this.details[i].quantity), this.details[i].description, subtotal.toString(), this.company.tabs);
      }
      details += this.lines(this.company.tabs);

      details += this.totals(operation.total, this.company.tabs);

      if (this.typedocument.certification) {
        details += `<CENTER>CERTIFICACION:<CENTER>${operation.autorizacionFel}<CENTER>SERIE FEL: ${operation.serieFel}<CENTER>NUMERO FEL: ${operation.numberFel}`;
      }
      quickPrint(`<PRINTER repeat='1' alias='felkairos'>
        <BOLD><CENTER>${this.company.name}<BR><CENTER>NIT: ${parseInt(this.company.nit)}
        <BR>${details}
        <CENTER>${moment().format('DD-MM-yyyy hh:mm:ss')}`);
    }
    return
  }

  async emailInvoice() {
    $('#emailInvoice').addClass('is-loading');
    let email = await this.operationsService.postOperationEmail(this.id);
    if (email.error) {
      notyf.open({ type: 'error', message: email.error });
      $('#emailInvoice').removeClass('is-loading');
      this.to(`${this.apiUrl}/${this.company.database}/invoice/${this.id}`);
    }
    if (email && email.message && email.message.code) {
      notyf.open({ type: 'error', message: `Factura no enviada exitosamente` });
      $('#emailInvoice').removeClass('is-loading');
      this.to(`${this.apiUrl}/${this.company.database}/invoice/${this.id}`);
    }
    if (email.code) {
      notyf.open({ type: 'error', message: `${email.code} ${email.response} ${email.path}` });
      $('#emailInvoice').removeClass('is-loading');
      this.to(`${this.apiUrl}/${this.company.database}/invoice/${this.id}`);
    }    
    if (email.response == '250 Ok') {
      notyf.open({ type: 'success', message: 'Factura enviada exitosamente' });
      $('#emailInvoice').removeClass('is-loading');
      this.to(`${this.apiUrl}/${this.company.database}/invoice/${this.id}`);
    }
  }

  items(quantity: number, description: string, subtotal: string, tabs: number) {
    let item = `${quantity} `;
    if (description.length > (tabs - 4 - subtotal.length)) {
      description = description.substr(0, tabs - 4 - subtotal.length);
      item += `${description}  ${subtotal}`;
    } else {
      item += description;
      let spaces = (tabs - item.length) - subtotal.length;
      for (let i = 1; i < spaces; i++) {
        item += ' ';
      }
      item += ` ${subtotal}`
    }
    return `${item}\n`;
  }

  lines(tabs: any) {
    let line = ''
    for (let t = 0; t < tabs; t++) {
      line += '-';
    }
    return line;
  }

  totals(total: string, tabs: number) {
    let spaces = 0;
    let item = `TOTAL:`;
    spaces = tabs - (item.length + 1) - total.length;
    for (let i = 1; i < spaces; i++) {
      item += ' ';
    }
    item += `Q.${total}\n`;
    return `${item}\n`;
  }

  formatNit(nit: string) {
    let nitF = '';
    for (let i = 0; i < (12 - nit.length); i++) {
      nitF += '0';
    }
    return nitF + nit;
  }

  async getCompany() {
    let company = await this.companiesService.getCompany(this.companyId);
    if (company.result) {
      this.company = company.data;
      if (localStorage.getItem(`details${this.documentId}`)) {
        this.details = JSON.parse(this.isToken(localStorage.getItem(`details${this.documentId}`)));
        // if (this.details.length > 0) {
        //     this.calculation();
        // }
      }
      this.operationForm.controls['exchange'].setValue(this.company.exchange);
    }
  }

  async getCustomers() {
    let customers = await this.customersService.getCustomers();
    if (customers.result) {
      this.customers = customers.data;
      if (this.typedocument.customer) {
        this.setCustomer(this.customers[0]);
      }
    }
  }

  async getSuppliers() {
    let suppliers = await this.suppliersService.getSuppliers();
    if (suppliers.result) {
      this.suppliers = suppliers.data;
      if (this.typedocument.supplier) {
        this.setSupplier(this.suppliers[0]);
      }
    }
  }

  async getBranches() {
    let branches = await this.branchesService.getBranches();
    if (branches.result) {
      this.branches = branches.data;
      // this.setBranch(this.branches[0]);
    }
  }

  getWarehouses(branchId: number) {
    this.warehouseService.getWarehousesBranch(branchId).then(warehouses => {
      if (warehouses.result) {
        this.warehouses = warehouses.data;

        if (this.warehouses.length > 0) {
          this.operationForm.controls['warehouseId'].setValidators([Validators.required]);
        } else {
          this.operationForm.controls['warehouseId'].clearValidators();
        }
        this.operationForm.controls['warehouseId'].updateValueAndValidity();
      }
    });
  }

  getWarehousesEnd(branchId: number) {
    this.warehouseService.getWarehousesBranch(branchId).then(warehouses_end => {
      if (warehouses_end.result) {
        this.warehouses_end = warehouses_end.data;
      }
    });
  }

  async getProducts() {
    let products = await this.productsService.getProducts();
    if (products.result) {
      this.products = products.data;
      this.products.forEach(function (e: any) {
        if (typeof e === "object") {
          e['selected'] = false;
        }
      });
    }
  }

  async getCoupons() {
    let coupons = await this.couponsService.getCoupons();
    if (coupons.result) {
      this.coupons = coupons.data;
    }
  }

  setCustomer(i: any) {
    this.customerForm.controls['name'].setValue(i.name);
    this.customerForm.controls['nit'].setValue(i.nit);
    if (i.email) {
      this.customerForm.controls['email'].setValue(i.email);
    } else {
      this.customerForm.controls['email'].setValue('');
    }
    this.customerForm.controls['doc'].setValue(i.doc);

    this.customer = i;
    this.operationForm.controls['customerId'].setValue(i.id);
    $('#select-customer-panel').removeClass('is-active');
  }

  setSupplier(i: any) {
    this.supplier = i;
    this.operationForm.controls['supplierId'].setValue(i.id);

    this.supplierForm.controls['name'].setValue(i.name);
    this.supplierForm.controls['nit'].setValue(i.nit);
    if (i.email) {
      this.supplierForm.controls['email'].setValue(i.email);
    } else {
      this.supplierForm.controls['email'].setValue('');
    }
    this.supplierForm.controls['doc'].setValue(i.doc);
    $('#select-supplier-panel').removeClass('is-active');
  }

  async setDocument(id: number) {
    this.documentsService.getDocument(id).then(document => {
      this.document = document.data;
      if (document.result) {
        this.operationForm.controls['documentId'].setValue(this.document.id);
        this.setBranch(this.document.branch);
        if (this.document.warehouseId) {
          this.setWarehouse(this.document.warehouse);
        }

        this.typedocument = this.document.typedocument;
        if (this.details.length > 0) {
          this.calculation();
        }

        if (this.typedocument.client) {
          this.operationForm.controls['customerId'].setValidators([Validators.required]);
          this.operationForm.controls['customerId'].updateValueAndValidity();

          this.operationForm.controls['supplierId'].setValidators([]);
          this.operationForm.controls['supplierId'].updateValueAndValidity();

          this.operationForm.controls['operationId'].setValidators([]);
          this.operationForm.controls['operationId'].updateValueAndValidity();
        }
        if (this.typedocument.supplier) {
          this.operationForm.controls['supplierId'].setValidators([Validators.required]);
          this.operationForm.controls['supplierId'].updateValueAndValidity();

          this.operationForm.controls['customerId'].setValidators([]);
          this.operationForm.controls['customerId'].updateValueAndValidity();

          this.operationForm.controls['operationId'].setValidators([]);
          this.operationForm.controls['operationId'].updateValueAndValidity();
        }
        if (this.typedocument.note) {
          this.operationForm.controls['supplierId'].setValidators([]);
          this.operationForm.controls['supplierId'].updateValueAndValidity();

          this.operationForm.controls['customerId'].setValidators([]);
          this.operationForm.controls['customerId'].updateValueAndValidity();

          this.operationForm.controls['operationId'].setValidators([Validators.required]);
          this.operationForm.controls['operationId'].updateValueAndValidity();
        }
      }
    });
    // $('#select-document-panel').removeClass('is-active');
  }

  setBranch(i: any) {
    this.operationForm.controls['branchId'].setValue(i.id);
    this.branch = i;
    this.getWarehouses(i.id);
    this.warehouse = { name: '' };
    this.operationForm.controls['warehouseId'].setValue(null);

    $('#select-branch-panel').removeClass('is-active');
  }

  setBranchEnd(i: any) {
    this.branch_end = i;
    this.getWarehousesEnd(i.id);
    this.warehouse_end = { name: '' };
    $('#select-branch-end-panel').removeClass('is-active');
  }

  setWarehouse(i: any) {
    this.operationForm.controls['warehouseId'].setValue(i.id);
    this.warehouse = i;
    if (this.warehouse.id == this.warehouse_end.id) {
      this.warehouse_end = { name: '' };
    }
    $('#select-warehouse-panel').removeClass('is-active');
  }

  setWarehouseEnd(i: any = null) {
    if (i == null) {
      this.warehouse_end = { id: null, name: '' };
    } else {
      this.warehouse_end = i;
    }
    $('#select-warehouse-end-panel').removeClass('is-active');
  }

  searchSKU() {
    if (this.warehouses.length > 0) {
      if (this.operationForm.controls['warehouseId'].value == null) {
        notyf.open({ type: 'error', message: `Selecciona una Bodega` });
        return;
      }
    }
    for (let i = 0; i < this.products.length; i++) {
      if (this.sku == this.products[i].sku) {
        this.setProduct(this.products[i]);
        this.sku = '';
        const input: any = document.querySelector("input[id^='sku']");
        input.blur();
        input.focus();
        return;
      }
    }
    notyf.open({ type: 'error', message: 'Producto no encontrado' });
    const input: any = document.querySelector("input[id^='sku']");
    input.blur();
    input.focus();
  }


  searchCoupon() {
    if (this.details.length > 0) {
      for (let i = 0; i < this.coupons.length; i++) {
        if (this.code == this.coupons[i].code) {
          for (let d = 0; d < this.details.length; d++) {
            this.details[d].percentage = this.coupons[i].amount;
          }
          notyf.open({ type: 'success', message: 'Cupón aplicado' });
          // this.calculation();
          this.dis();
          return;
        }
      }
    } else {
      notyf.open({ type: 'error', message: 'Lista de productos vacia' });
      return;
    }
    notyf.open({ type: 'error', message: 'Cupón no encontrado' });
  }

  searchNIT() {
    this.customerForm.controls['nit'].setValue(this.customerForm.controls['nit'].value.toUpperCase());
    for (let i = 0; i < this.customers.length; i++) {
      if (this.customerForm.controls['nit'].value == this.customers[i].nit) {
        this.setCustomer(this.customers[i]);
        this.customer = this.customers[i];
        notyf.open({ type: 'success', message: 'Cliente Seleccionado' });
        const input: any = document.querySelector("input[id^='nit']");
        input.blur();
        return;
      }
    }
    this.digifactService.getInfoNit(this.company.nit, this.customerForm.controls['nit'].value).then((digifact: any) => {
      if (digifact.RESPONSE[0]) {
        let felName = digifact.RESPONSE[0].NOMBRE;
        let name: any = felName;
        if (felName.split(',').length == 5) {
          name = felName.split(',,')[1] + ' ' + felName.split(',,')[0];
        }
        if (felName.split(',').length == 3) {
          name = felName.split(',,')[1] + ' ' + felName.split(',,')[0];
        }
        name = name.replaceAll(',', ' ');
        this.customerForm.controls['name'].setValue(name);
        this.customerForm.controls['email'].setValue('');
        this.customerForm.controls['doc'].setValue('NIT');
        this.operationForm.controls['customerId'].setValue(0);
        notyf.open({ type: 'success', message: 'Cliente Seleccionado' });
        const input: any = document.querySelector("input[id^='nit']");
        input.blur();
      } else {
        this.operationForm.controls['customerId'].setValue(null);
        notyf.open({ type: 'error', message: 'NIT no encontrado' });
        const input: any = document.querySelector("input[id^='nit']");
        input.blur();
      }
    });
  }

  searchNITS() {
    this.supplierForm.controls['nit'].setValue(this.supplierForm.controls['nit'].value.toUpperCase());
    for (let i = 0; i < this.suppliers.length; i++) {
      if (this.supplierForm.controls['nit'].value == this.suppliers[i].nit) {
        this.setSupplier(this.suppliers[i]);
        this.supplier = this.suppliers[i];
        notyf.open({ type: 'success', message: 'Cliente Seleccionado' });
        const input: any = document.querySelector("input[id^='nit']");
        input.blur();
        return;
      }
    }
    this.digifactService.getInfoNit(this.company.nit, this.supplierForm.controls['nit'].value).then((digifact: any) => {
      if (digifact.RESPONSE[0]) {
        let felName = digifact.RESPONSE[0].NOMBRE;
        let name: any = felName;
        if (felName.split(',').length == 5) {
          name = felName.split(',,')[1] + ' ' + felName.split(',,')[0];
        }
        if (felName.split(',').length == 3) {
          name = felName.split(',,')[1] + ' ' + felName.split(',,')[0];
        }
        name = name.replaceAll(',', ' ');
        this.supplierForm.controls['name'].setValue(name);
        this.supplierForm.controls['email'].setValue('');
        this.supplierForm.controls['doc'].setValue('NIT');
        this.operationForm.controls['supplierId'].setValue(0);
        notyf.open({ type: 'success', message: 'Cliente Seleccionado' });
        const input: any = document.querySelector("input[id^='nit']");
        input.blur();
      } else {
        this.operationForm.controls['supplierId'].setValue(null);
        notyf.open({ type: 'error', message: 'NIT no encontrado' });
        const input: any = document.querySelector("input[id^='nit']");
        input.blur();
      }
    });
  }

  getOperation() {
    this.operationsService.getOperation(this.id).then(operation => {
      if (operation.data) {
        if (operation.data.status == 'CERTIFICADA') {
          let typedocument = operation.data.document.typedocument;
          if (typedocument.certification && !typedocument.note || typedocument.name == 'COMPRA') {
            this.operation = operation.data;
            this.customer = operation.data.customer;
            this.details2 = operation.data.detailoperations;
            this.methods2 = operation.data.paymentOperations;
            this.notes = operation.data.notes;
            this.operationForm.controls['turned'].setValue(0);
            this.operationForm.controls['currency'].setValue(this.operation.currency);
            this.operationForm.controls['payment'].setValue(this.operation.payment);
            this.operationForm.controls['customerId'].setValue(this.operation.customerId);
            this.operationForm.controls['customerId'].setValue(this.operation.customerId);
            this.operationForm.controls['supplierId'].setValue(this.operation.supplierId);
            this.operationForm.controls['branchId'].setValue(this.operation.branchId);
            this.operationForm.controls['warehouseId'].setValue(this.operation.warehouseId);
            this.operationForm.controls['operationId'].setValue(this.id);
            this.idFel = operation.data.serieFel.toString();
            notyf.open({ type: 'success', message: 'Operacion encontrada' });
          } else {
            this.operation = null;
            this.customer = null;
            this.details2 = [];
            notyf.open({ type: 'error', message: 'No aplicable a operaciones de tipo ' + typedocument.name });
          }
        } else {
          this.router.navigate(['pos/operations']);
        }
        return;
      }
    });
  }

  async searchOperation() {
    let numerFel = await this.operationsService.getOperationsNumberFel(this.idFel);
    let serieFel = await this.operationsService.getOperationsSerieFel(this.idFel);
    let operation: any;
    if (numerFel.data.length == 1) {
      operation = numerFel.data[0];
    }
    if (serieFel.data.length == 1) {
      operation = serieFel.data[0];
    }
    if (operation) {
      if (operation.status == 'CERTIFICADA') {
        let typedocument = operation.document.typedocument;
        if (typedocument.certification && !typedocument.note) {
          this.operation = operation;
          this.id = operation.id;
          this.customer = operation.customer;
          this.details2 = operation.detailoperations;
          this.methods2 = operation.paymentOperations;
          this.notes = operation.notes;
          this.operationForm.controls['turned'].setValue(0);
          this.operationForm.controls['currency'].setValue(this.operation.currency);
          this.operationForm.controls['payment'].setValue(this.operation.payment);
          this.operationForm.controls['customerId'].setValue(this.operation.customerId);
          this.operationForm.controls['customerId'].setValue(this.operation.customerId);
          this.operationForm.controls['supplierId'].setValue(this.operation.supplierId);
          this.operationForm.controls['branchId'].setValue(this.operation.branchId);
          this.operationForm.controls['warehouseId'].setValue(this.operation.warehouseId);
          this.operationForm.controls['operationId'].setValue(this.id);
          notyf.open({ type: 'success', message: 'Operacion encontrada' });
        } else {
          this.operation = null;
          this.customer = null;
          this.details2 = [];
          notyf.open({ type: 'error', message: 'No aplicable a operaciones de tipo ' + typedocument.name });
        }
      } else {
        this.router.navigate(['pos/operations']);
      }
      return;
    }
    this.operation = null;
    this.customer = null;
    this.details2 = [];
    notyf.open({ type: 'error', message: 'Operacion no encontrada' });
  }

  async dis(u: any = null, i: any = null) {

    if (u && this.details[u].quantity < 0) {
      this.details[u].quantity = 1;
      this.calculation();
      return;
    }

    if (this.typedocument.inventory == 'SALIDA') {
      if (this.company.stock) {
        if (u != null) {

          // let product = await this.productsService.getProductKardex(this.details[u].productId, this.details[u].variationId, this.operationForm.controls.branchId.value, this.operationForm.controls.warehouseId.value);
          // product.data ? this.details[u].stock = parseFloat(product.data.stock) : 0;

          if (parseFloat(this.details[u].quantity) >= parseFloat(this.details[u].stock)) {
            this.details[u].quantity = this.details[u].stock;
            this.calculation();
          }
        }

        if (i && i.product.type == 'COMBO') {

          for (let r = 0; r < i.product.recipes.length; r++) {
            for (let g = 0; g < this.details.length; g++) {
              if (i.product.recipes[r].productRecipeId == this.details[g].product.id) {

                if (this.details[u].quantity >= this.details[u].stock) {
                  this.details.splice(g, 1);
                } else {
                  let kardex = await this.productsService.getProductStock(this.branch.id, this.warehouse.id, this.details[g].product.id, this.details[g].variationId);                
                  this.details[g].stock = parseFloat(kardex.data.stock) - (parseFloat(i.product.recipes[r].quantity) * parseFloat(this.details[u].quantity));
                  if (this.details[g].quantity >= this.details[g].stock) {
                    this.details[g].quantity = this.details[g].stock;
                    this.dis(this.details[g]);
                  }

                  // Final
                  for (let i = 0; i < this.details.length; i++) {
                    if (this.details[i].percentage > 0) {
                      this.setDiscount(this.details[i], i);
                    }
                  }
                  this.calculation();
                  return;
                }
              }
            }
          }
        }
      }
    }
    for (let i = 0; i < this.details.length; i++) {
      this.setDiscount(this.details[i], i);
    }
    this.calculation();
  }

  async setProduct(i: any, description: any = false, variationChoose = false) {

    let stock = 0;
    let quantity = 0;
    let cost = 0;

    if (this.typedocument.inventory == 'SALIDA') {
      for (let d = 0; d < this.details.length; d++) {
        if (this.details[d].product.type == 'COMBO' && i.type == 'BIEN') {
          for (let r = 0; r < this.details[d].product.recipes.length; r++) {
            if (this.details[d].product.recipes[r].productRecipeId == i.id) {
              let kardex = await this.productsService.getProductStock(this.branch.id, this.warehouse.id, this.details[d].product.recipes[r].productRecipeId, this.details[d].product.recipes[r].variationId);
              stock = parseFloat(kardex.data.stock) - (parseFloat(this.details[d].product.recipes[r].quantity) * parseFloat(this.details[d].quantity));
            }
          }
        }
        if (this.details[d].product.type == 'BIEN' && i.type == 'COMBO') {
          for (let r = 0; r < i.recipes.length; r++) {

            for (let g = 0; g < this.details.length; g++) {
              if (i.recipes[r].productRecipeId == this.details[g].product.id) {
                this.details[g].stock = parseFloat(this.details[g].stock) - (parseFloat(i.recipes[r].quantity) * parseFloat(this.details[d].quantity));
                if (this.details[g].quantity >= this.details[g].stock) {
                  this.details[g].quantity = this.details[g].stock;
                }
              }
            }
          }
        }
      }
    }

    if (description) {
      const { value: text } = await Swal.fire({
        input: 'textarea',
        inputLabel: 'Descripcion',
        inputPlaceholder: 'Ingresa la descripcion aqui...',
        inputValue: i.name,
        showCancelButton: true
      })

      if (text) {
        description = text;
      } else {
        description = i.name;
      }
    } else {
      variationChoose ? description = this.description : description = i.name;
      this.description = i.name;
    }

    if (variationChoose == false) {
      if (i.variations.length > 0) {
        this.description = description;
        // i.variations.forEach(async variation => {

        //   this.variations.push({
        //     id: variation.id,
        //     name: variation.attribute.name,
        //     symbol: variation.attribute.symbol,
        //     attributeId: variation.attributeId,
        //     attribute: variation.attribute
        //   });
        // });
        this.variations = i.variations;
        this.variations.sort(function (a: any, b: any) {
          return a.id - b.id;
        });

        this.product = i;
        $('#select-variation-panel').addClass('is-active');
        AppComponent.list();
        return;
      }
    }

    if (i.type == 'COMBO') {

      let recipes = await this.recipesService.getRecipe(i.id);
      if (this.typedocument.inventory == 'ENTRADA') {
        for (let r = 0; r < recipes.data.length; r++) {
          let product = await this.productsService.getProduct(recipes.data[r].productRecipeId);
          await this.setProduct(product.data);
        }
        return;
      }

      let diffs: any = [];

      for (let r = 0; r < recipes.data.length; r++) {
        let kardex = await this.productsService.getProductStock(this.branch.id, this.warehouse.id, recipes.data[r].productRecipeId, recipes.data[r].variationId);
        if (!kardex.data) {
          let product = await this.productsService.getProduct(recipes.data[r].productRecipeId);
          notyf.open({ type: 'error', message: `No hay existencias de ${product.data.name}` });
          return;
        } else {
          diffs.push({
            stock: stock != 0 ? stock : parseFloat(kardex.data.stock),
            quantity: recipes.data[r].quantity
          });
        }
      }

      let stockOff = false;
      do {
        for (let d = 0; d < diffs.length; d++) {
          diffs[d].stock = parseFloat(diffs[d].stock) - parseFloat(diffs[d].quantity);
          if (diffs[d].stock <= 0) {
            stockOff = true;
            break;
          }
        }
        stock++;
      } while (stockOff == false);

      quantity = stock;

    }
    if (i.type == 'BIEN') {
      let product = await this.productsService.getProductStock(this.operationForm.controls['branchId'].value, this.operationForm.controls['warehouseId'].value, i.id, this.variationId,);

      if (product.data) {
        stock = stock != 0 ? stock : parseFloat(product.data.stock);
        quantity = parseFloat(product.data.quantity);
      }

      if (this.typedocument.inventory == 'SALIDA') {
        if (this.company.stock) {
          if (stock == null || stock <= 0) {
            notyf.open({ type: 'error', message: `No hay existencias` });
            return;
          }
        }
      }
    }

    for (let u = 0; u < this.details.length; u++) {
      if (this.details[u].productId == i.id) {
        if (this.details[u].description == description) {
          this.details[u].quantity++;
          this.dis(u, this.details[u]);
          if (this.details[u].quantity < stock) {
            notyf.open({ type: 'success', message: 'Producto adicionado' });
          } else {
            notyf.open({ type: 'warning', message: `${stock} ${this.details[u].product.unit.symbol} es el maximo para este producto` });
          }
          // $('#select-product-panel').removeClass('is-active');
          this.calculation();
          return;
        }
      }
    }

    cost = i.cost;
    if (this.typedocument.inventory == 'ENTRADA') {
      cost = cost * i.equivalence;
      cost = this.decimal(cost);
    }

    const detail = {
      productId: i.id,
      name: i.name,
      image: i.image,
      sku: i.sku,
      type: i.type,
      price: i.price,
      cost: cost,
      quantity: 1,
      discount: 0,
      percentage: 0,
      description: description,
      stock: stock,
      product: i,
      variationId: this.variationId
    }
    this.details.push(detail);
    this.variationId = null;
    localStorage.setItem(`details${this.documentId}`, JSON.stringify(this.details));
    this.disabledProduct(detail);
    notyf.open({ type: 'success', message: 'Producto agregado' });
    // $('#select-product-panel').removeClass('is-active');
    // $('#select-variation-panel').removeClass('is-active');
    this.calculation();
  }

  setVariation(i: any) {
    this.description += ` ${i.attribute.symbol}`
    this.variationId = i.id;
    this.setProduct(this.product, false, true);
  }

  setCoupon(i: any = null) {
    if (this.details.length > 0) {
      if (i != null) {
        for (let d = 0; d < this.details.length; d++) {
          this.details[d].percentage = i.amount;
        }
        notyf.open({ type: 'success', message: 'Cupón aplicado' });
      } else {
        for (let d = 0; d < this.details.length; d++) {
          this.details[d].percentage = 0;
        }
        notyf.open({ type: 'success', message: 'Cupón Removido' });
      }
      this.dis();
      // this.calculation();
      $('#select-coupon-panel').removeClass('is-active');
      return;
    } else {
      notyf.open({ type: 'error', message: 'Lista de productos vacia' });
      return;
    }
  }

  async setDescription(i: any, u: number) {
    let description = '';
    if (i.description) {
      description = i.description;
    }
    const { value: text } = await Swal.fire({
      input: 'textarea',
      inputLabel: 'Descripcion',
      inputPlaceholder: 'Ingresa la descripcion aqui...',
      inputValue: description.toString(),
      showCancelButton: true
    })

    if (text) {
      description = text;
    }
    this.details[u].description = description;
    this.alertService.alertMin('Descripcion Actualizada', 'success');
    localStorage.setItem(`details${this.documentId}`, JSON.stringify(this.details));
  }

  disabledProduct(i: any) {
    for (let u = 0; u < this.products.length; u++) {
      if (this.products[u].id == i.productId) {
        this.products[u].selected = true;
      }
    }
  }

  enabledProduct(i: any) {
    for (let u = 0; u < this.products.length; u++) {
      if (this.products[u].id == i.productId) {
        this.products[u].selected = false;
      }
    }
  }

  setMethod() {
    if (this.methodTotal <= 0) {
      return;
    }
    if (this.methodType != 'EFECTIVO') {
      if (!this.methodAuth) {
        return;
      }
      if (this.methodTotal > (this.operationForm.controls['total'].value - this.amount)) {
        notyf.open({ type: 'error', message: `El método ${this.methodType} supera el total` });
        this.closeMethod();
        return;
      }
    }
    if (this.methodType == 'EFECTIVO') {
      let totalTarjeta = 0;
      for (let i = 0; i < this.methods.length; i++) {
        if (this.methods[i].type == 'TARJETA') {
          totalTarjeta += this.methods[i].total;
        }
      }
      if (totalTarjeta == this.operationForm.controls['total'].value) {
        notyf.open({ type: 'error', message: 'No es posible agregar mas efectivo' });
        this.closeMethod();
        return;
      }
      for (let i = 0; i < this.methods.length; i++) {
        if (this.methods[i].type == this.methodType) {
          this.methods[i].total += this.methodTotal;
          this.calculationPay();
          this.closeMethod();
          return;
        }
      }
    }
    const method = {
      type: this.methodType,
      total: this.methodTotal,
      auth: this.methodAuth
    }
    this.methods.push(method);
    this.calculationPay();
    this.closeMethod();
  }

  closeMethod() {
    if (this.methodType == 'EFECTIVO') {
      this.methodType = 'TARJETA';
    }
    if (this.methodType == 'TARJETA') {
      this.methodType = 'EFECTIVO';
    }
    this.methodTotal = 0;
    this.methodAuth = '';
    // $('#add-payment-method-panel').removeClass('is-active');
    const input: any = document.querySelector("input[id^='methodTotal']");
    input.blur();
  }

  setAbono() {
    if (this.abonoTotal <= 0 && !this.abonoDate) {
      return;
    }
    this.abonos.push({ date: this.abonoDate, total: this.abonoTotal });
    this.abonoTotal = 0;
    const input: any = document.querySelector("input[id^='abonoTotal']");
    input.blur();
  }

  removeProduct(i: any, u: number) {
    this.details.splice(u, 1);
    localStorage.setItem(`details${this.documentId}`, JSON.stringify(this.details));
    this.enabledProduct(i);
    this.calculation();
  }

  removeMethod(u: number) {
    this.methods.splice(u, 1);
    this.calculationPay();
  }

  removeAbono(u: number) {
    this.abonos.splice(u, 1);
  }

  methodTotalFocus() {
    const input: any = document.querySelector("input[id^='methodTotal']");
    input.focus();
  }

  abonoTotalFocus() {
    const input: any = document.querySelector("input[id^='abonoTotal']");
    input.focus();
  }

  calculation() {
    let subtotal = 0;
    let iva = 0
    let total = 0;
    let discount = 0;
    let granTotal = 0;
    for (let i = 0; i < this.details.length; i++) {

      if (this.typedocument.inventory == 'ENTRADA') {
        granTotal = granTotal + (this.details[i].cost * this.details[i].quantity);
        total = total + ((this.details[i].cost * this.details[i].quantity) - parseFloat(this.details[i].discount));
      }
      if (this.typedocument.inventory == 'SALIDA') {
        granTotal = granTotal + (this.details[i].price * this.details[i].quantity);
        total = total + ((this.details[i].price * this.details[i].quantity) - parseFloat(this.details[i].discount));
      }
      discount = discount + parseFloat(this.details[i].discount);
    }

    subtotal = this.decimal(total / parseFloat(`${1}.${this.company.iva}`));
    iva = this.decimal(subtotal * parseFloat(`${0}.${this.company.iva}`));
    granTotal = this.decimal(granTotal - discount);

    this.operationForm.controls['total'].setValue(granTotal);
    this.operationForm.controls['subtotal'].setValue(subtotal);
    this.operationForm.controls['iva'].setValue(iva);
    this.operationForm.controls['discount'].setValue(discount);
    localStorage.setItem(`details${this.documentId}`, JSON.stringify(this.details));
  }

  calculationNote() {
    let subtotal = 0;
    let iva = 0
    let total = this.operationForm.controls['total'].value;
    let discount = 0;

    subtotal = this.decimal(total / parseFloat(`${1}.${this.company.iva}`));
    iva = this.decimal(subtotal * parseFloat(`${0}.${this.company.iva}`));
    total = this.decimal(total - discount);

    this.operationForm.controls['subtotal'].setValue(subtotal);
    this.operationForm.controls['iva'].setValue(iva);
    this.operationForm.controls['discount'].setValue(discount);
  }

  calculationPay() {
    this.amount = 0;
    for (let i = 0; i < this.methods.length; i++) {
      this.amount += this.methods[i].total;
    }
  }

  setDiscount(i: any, u: number) {
    if (this.typedocument.inventory == 'ENTRADA') {
      this.details[u].discount = this.decimal(i.percentage * (i.cost * i.quantity) / 100);
    }
    if (this.typedocument.inventory == 'SALIDA') {
      this.details[u].discount = this.decimal(i.percentage * (i.price * i.quantity) / 100);
    }
  }

  setPercentage(i: any, u: number) {
    if (this.typedocument.inventory == 'ENTRADA') {
      this.details[u].percentage = this.decimal(i.discount / (i.cost * i.quantity) * 100);
    }
    if (this.typedocument.inventory == 'SALIDA') {
      this.details[u].percentage = this.decimal(i.discount / (i.price * i.quantity) * 100);
    }
  }

  getCurrency() {
    if (this.operationForm.controls['currency'].value == 'GTQ') {
      return 'Q';
    }
    if (this.operationForm.controls['currency'].value == 'USD') {
      return '$';
    }
    return '';
  }

  selectedVariation(id: number) {
    for (let i = 0; i < this.details.length; i++) {
      if (id == this.details[i].variationId) {
        return true;
      }
    }
    return false;
  }

  totalNotes(u: number) {
    let total = parseFloat(this.operation.total);
    for (let i = 0; i < u + 1; i++) {
      if (this.notes[i].document.typedocument.name == 'NOTA DE CREDITO') {
        total = total - parseFloat(this.notes[i].total);
      }
      if (this.notes[i].document.typedocument.name == 'NOTA DE DEBITO') {
        total = total + parseFloat(this.notes[i].total);
      }
      if (this.notes[i].document.typedocument.name == 'NOTA DE ABONO') {
        total = total - parseFloat(this.notes[i].total);
      }
      if (this.notes[i].document.typedocument.name == 'ABONO') {
        total = total - parseFloat(this.notes[i].total);
      }
    }
    return total;
  }

  validation(e: any) {
    var BreakException = {};
    Object.keys(this.operationForm.controls).forEach(key => {
      if (this.operationForm.controls[key].invalid) {
        notyf.open({ type: 'error', message: 'El Campo ' + [key] + ' es requerido' });
        this.keyboard(e);
        throw BreakException;
      }
    });
    return true;
  }

  keyboard(e: any) {
    Object.keys(this.operationForm.controls).forEach(key => {
      let input = e.target.querySelector("input[formControlName^='" + [key] + "']");
      if (input) {
        input.blur();
      }
    });
    return true;
  }

  panelDate() {
    $('#select-date-panel').addClass('is-active');
  }

  panelCustomer() {
    $('#select-customer-panel').addClass('is-active');
  }

  panelSupplier() {
    $('#select-supplier-panel').addClass('is-active');
  }

  panelBranch() {
    $('#select-branch-panel').addClass('is-active');
  }

  panelBranchEnd() {
    $('#select-branch-end-panel').addClass('is-active');
  }

  panelWarehouse() {
    $('#select-warehouse-panel').addClass('is-active');
  }

  panelWarehouseEnd() {
    $('#select-warehouse-end-panel').addClass('is-active');
  }

  panelProduct() {
    if (this.warehouses.length > 0) {
      if (this.operationForm.controls['warehouseId'].value == null) {
        notyf.open({ type: 'error', message: `Selecciona una Bodega` });
        return;
      }
    }
    // this.getProducts();
    $('#select-product-panel').addClass('is-active');
    $('#prod').blur();
    $('#prod').focus();
  }

  panelCoupon() {
    $('#select-coupon-panel').addClass('is-active');
    $('#coup').blur();
    $('#coup').focus();
  }

  panelPaymentMethod() {
    $('#add-payment-method-panel').addClass('is-active');
  }

  panelAbono() {
    this.abonoDate = moment().format('YYYY-MM-DD');
    $('#add-abono-panel').addClass('is-active');
  }

  panelOperation() {
    $('#add-operation-panel').addClass('is-active');
  }

  cancelOperation() {
    localStorage.removeItem(`details${this.documentId}`);
    this.router.navigate(['/pos/operations'])
  }

  decimal(number: number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  toFix(val: number) {
    return Math.round(val * 100) / 100;
  }

  getFakeAvatar(name: string) {
    if (name) {
      return name[0];
    } else {
      return '';
    }
  }

  isToken(token: any) {
    if (token) {
      return token;
    } else {
      return '';
    }
  }

  getOS() {
    var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }

    return os;
  }

  to(url: string) {
    if (this.getOS() == 'iOS') {
      location.href = url;
    } else {
      window.open(url, '_blank');
    }
  }

}
