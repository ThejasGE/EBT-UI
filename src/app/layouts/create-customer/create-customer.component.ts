import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdapptSnackbarService } from '../../adappt-snackbar.service';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import {  MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {  MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CustomerService } from '../../customer.service';
import { UserService } from '../../user.service';
import { AdapptAuthService } from '../../adappt-auth.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.scss']
})
export class CreateCustomerComponent implements OnInit {
    hasLMS = false;
    hasOccupancy = false;
    hasOpenArea = false;
    hasAllocation = false;
    hasCrbs = false;
    hasHotdesk = false;
    hasParking = false;

  customerFormGroup: FormGroup;
  saleType:any=[{type:"Production"},{type:"Demo"}]

  constructor(private formBuilder: FormBuilder,public snackBar: AdapptSnackbarService, private customer: CustomerService, private userService: UserService, public auth : AdapptAuthService,
    private _bottomSheetRef: MatBottomSheetRef<CreateCustomerComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { 
      this.customerFormGroup = this.formBuilder.group(
        {
          "hasLMS" : {value: true},
          "hasOccupancy" : {value: true},
          "hasOpenArea" : {value: true},
          "hasAllocation" : {value: true},
          "hasCrbs" : {value: true},
          "hasHotdesk" : {value: true},
          "hasParking" : {value: true},
          "name" : ['', Validators.required],
          "buildingName" : ['', Validators.required],
          "location" : ['', Validators.required],
          "saleType" : '',
        }
      );
  }

  siteSelect: any = [];

  ngOnInit() {
  }

  public toggle(event: MatSlideToggleChange) {
    // console.log('toggle', event.checked);
    let value = this.customerFormGroup.value;
    // event.checked == true ? value.Buildings = [] :  console.log('toggle', event.checked)
}

  

  get loginForm() {
    return this.customerFormGroup.controls;
  }

  onTypeChanged(selectType) {
    // let saleType = String;
    // saleType=selectType.value;
    // console.log(selectType.value)
}

  CreateCustomers() {
    let value = this.customerFormGroup.value;
    // console.log(value)
    this.customer.createCustomer(this.customerFormGroup.value).subscribe( data => {
        this.snackBar.showMessage(
            'Added Successfully'
          );
      this._bottomSheetRef.dismiss(data)
    })
  }

}
