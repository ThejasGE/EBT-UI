import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service';
import {CustomerService} from'../../customer.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import { CreateUserComponent } from '../create-user/create-user.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import { AdapptAuthService} from '../../adappt-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile-setting',
  templateUrl: './user-profile-setting.component.html',
  styleUrls: ['./user-profile-setting.component.scss']
})
export class UserProfileSettingComponent implements OnInit {

  constructor( private userService: UserService,private customerservice: CustomerService,private router: Router,
     private auth: AdapptAuthService, private _bottomSheet: MatBottomSheet, private ngxLoader: NgxUiLoaderService) { }
  otherTheme: string;
  title:string="USER PROFILE"
  filterData: string;
  tableFields = [
    {
      displayName: "Serial No.",
      objectName: "id",
      type: "ids"
    },
    {
      displayName: "Full Name",
      objectName: "fullName"
    },
    {
      displayName: "Email Address",
      objectName: "email"
    },
    {
      displayName: "User Name",
      objectName: "username"
    },
    {
      displayName: "Password",
      objectName: "password",
      type: "editPassword"
    },
    {
      displayName: "Last Attempt Time",
      objectName: "LastfailedattemptTime"
    },
   
    {
      displayName: "isLocked",
      objectName: "isLocked",
      type: "lockType"
    },
    {
      displayName: "isActive",
      objectName: "isActive",
      type: "activeType"
    },
    {
      displayName: "isAdmin",
      objectName: "isAdmin",
      type: "adminType"
    },
    {
      displayName: "Last Login Time",
      objectName: "islastLogin"
    },
    {
      displayName: "Update Profile",
      objectName: "actions",
      type: "profileChange"
    }
  ];
  tableData = []
  tableFilter = [];
  sitesName: any [];
  siteSelect:any = [] ;
  AdminValue = false;
  interval: any;
  ngOnInit() {
    this.ngxLoader.start();    
    this.customerservice.getDomainList().subscribe(async data => {
      console.log(data)
      if (data.length > 0) {
        this.sitesName = [...data];
        // console.log(this.sitesName)
          if(this.sitesName.length){
              this.getUsers();
        }
      }
    })
    // this.getUsers();
    // this.interval = setInterval(() => { 
    //     this.getUsers(); 
    // }, 15000);
  }

  getUsers() {
    this.tableData = [];
    this.userService.getUsers().subscribe( data => {
      console.log(data)
      this.tableData = [...data]; });
      // console.log(this.tableData)
      this.ngxLoader.stop();
  }

  updatedRow($event) {
    if($event.password == this.auth.getToken()){
      this.ngxLoader.start();
        this.getUsers();
    } else {
      this.auth.deleteSession();
      this.router.navigate(['login']);
    }
  }

  filteredData(e) {

  }


  applyFilterFunction($event) {
    let event = $event;
    this.filterData = event.target.value;
  }
  
  AddUser() {
    let Result = this._bottomSheet.open(CreateUserComponent, {
      hasBackdrop: true,
      backdropClass: "bottom-sheet-class",
      data: { siteSelect:this.siteSelect } 
    });
    console.log(Result, "Result")
    if(Result) {
      this.getUsers();
    }
}
}
