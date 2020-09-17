import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdapptSnackbarService } from '../../adappt-snackbar.service';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import {  MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {  MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '../../user.service';
import { AdapptAuthService } from '../../adappt-auth.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  AdminValue = false;
  userFormGroup: FormGroup;
  constructor(private formBuilder: FormBuilder,public snackBar: AdapptSnackbarService, private userService: UserService, public auth : AdapptAuthService,
    private _bottomSheetRef: MatBottomSheetRef<CreateUserComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { 
      this.userFormGroup = this.formBuilder.group(
        {
          "isLocked" : false,
          "isActive" : true,
          "isAdmin" : {value: false, disabled: this.auth.getAdminD() == 'false'? true: false},
          "islastLogin" : null,
          "Buildings" : '',
          "fullName" : ['', Validators.required],
          "email" : ['', Validators.required],
          "username" : ['', Validators.required],
          "password" : ['', Validators.required],
          "LastfailedattemptTime" : null
        }
      );
  }

  siteSelect: any = [];

  ngOnInit() {
    this.siteSelect = [...this.data.siteSelect];
  }

  public toggle(event: MatSlideToggleChange) {
    console.log('toggle', event.checked);
    let value = this.userFormGroup.value;
    event.checked == true ? value.Buildings = [] :  console.log('toggle', event.checked)
}

  

  get loginForm() {
    return this.userFormGroup.controls;
  }

  CreateUsers() {
    let value = this.userFormGroup.value;
    // if(value.Buildings.length > 0){
    //   let temp = [];
    //   value.Buildings.forEach(ele => {
    //     for( let site of this.siteSelect) {
    //       for( let bui of site.buildings) {
    //         if( bui.id === ele){
    //           bui.subdomain = site.name;
    //           temp.push(bui)
    //         }
    //       }
    //     }
    //   });
    //   value.Buildings = [...temp];
    // }
    this.userService.createUser(this.userFormGroup.value).subscribe( data => {
      this.snackBar.showMessage(
        'Added Successfully'
      );
      this._bottomSheetRef.dismiss(data)
      
    })
    
  }

}
