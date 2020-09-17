import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from "@angular/core";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { AdapptSnackbarService } from '../../adappt-snackbar.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CustomerService } from '../../customer.service';
import { ClientServicesComponent } from "../client-services/client-services.component";
import { CreateCustomerComponent } from '../../layouts/create-customer/create-customer.component'
// import { HomedisplayComponent } from '../../layouts/homedisplay/homedisplay.component'
import { async } from '@angular/core/testing';


@Component({
  selector: "onboard-dashboard",
  templateUrl: "onboard.component.html",
  providers: [NgbTooltipConfig] // add NgbTooltipConfig to the component providers

})
export class onBoardComponent implements OnInit {
  customers: Array<any> = [];
  index = 0;
  // data: any;
  interval: any;
  siteSelect: any = [];



  constructor(private snackBar: AdapptSnackbarService, config: NgbTooltipConfig, private ngxLoader: NgxUiLoaderService, private clientData: ClientServicesComponent, private customer: CustomerService, private _bottomSheet: MatBottomSheet,) {
    // customize default values of tooltips used by this component tree
    config.placement = 'left';
    // config.triggers = 'click';
  }



  ngOnInit() {
    this.refreshData();
    this.interval = setInterval(() => {
      this.refreshData();
    }, 10000);
  }



  refreshData() {
    this.customer.getAllCustomers().subscribe(async data => {
      console.log(data)
      if (data.length > 0) {
        this.customers = [...data];
      }
    });
  }
  DeleteCustomers(id) {
    this.customer.deleteCustomer({ _id: id }).subscribe(async data => {
      this.snackBar.showMessage(
        'Deleted Successfully'
      );
      // console.log(data)
      // this.siteSelect.dismiss(data)

    });
  }

  AddCustomers() {
    // this.ngxLoader.start();    
    let Result = this._bottomSheet.open(CreateCustomerComponent, {
      hasBackdrop: true,
      backdropClass: "bottom-sheet-class",
      data: { siteSelect: this.siteSelect }
    });
    // this.ngxLoader.stop();    
    console.log(Result, "Result")
    if (Result) {
      this.refreshData();
    }
  }



}
