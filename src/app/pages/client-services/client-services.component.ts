import { Component, OnInit,Inject, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { templateJitUrl, ThrowStmt } from '@angular/compiler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../customer.service';
import { WebSocketService } from '../../web-socket.service';
import { AdapptDataTableComponent } from '../../components/adappt-data-table/adappt-data-table.component'
import { AdapptSnackbarService } from '../../adappt-snackbar.service';
import {MatFormFieldModule} from '@angular/material/form-field';

import { FormBuilder,NgModel, FormGroup,FormArray ,FormsModule,Validators, FormControl} from "@angular/forms";
import { async } from '@angular/core/testing';
import {  MatSlideToggleChange } from '@angular/material/slide-toggle';
import {AdapptHttpService} from '../../adappt-http.service'
import { ValueTransformer } from '@angular/compiler/src/util';
import { Observable, Subject } from 'rxjs';

import { AnyARecord } from 'dns';
import { ConnectedPositionStrategy } from '@angular/cdk/overlay';
import { Console } from 'console';


@Component({
  selector: 'update-service-dialog',
  templateUrl: 'update-service-dialog.html',
})
export class UpdateServiceDialogComponent {


    //   hasLMS :boolean;
    // hasOccupancy :boolean;
    // hasOpenArea :boolean;
    // hasAllocation :boolean;
    // hasCrbs :boolean;
    // hasHotdesk :boolean;
    // hasParking :boolean;

  productType = [{ name: 'Occupancy Management', obj: 'hasOccupancy' }, { name: 'Lighting Management', obj: 'hasLMS' }, { name: 'Conference Room Booking System', obj: 'hasCrbs' }, { name: 'Seat Allocation', obj: 'hasAllocation' }, { name: 'Parking', obj: 'hasParking' }, { name: 'Hotdesk', obj: 'hasHotdesk' }, { name: 'Open Area', obj: 'hasOpenArea' }];
  selectedList: any = []; // store selected options here
  // selectedProduct: any[];
  selectedByDefault;
  // selectedServices: FormControl;
  cid:any;
  interval:any;
  datas:any;
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpdateServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private adapptSnackbar: AdapptSnackbarService,
    private customer: CustomerService,
    private adapptHttp: AdapptHttpService) {
      this.form = this.fb.group(
        {
          "hasLMS" : {value: true},
          "hasOccupancy" : {value: true},
          "hasOpenArea" : {value: true},
          "hasAllocation" : {value: true},
          "hasCrbs" : {value: true},
          "hasHotdesk" : {value: true},
          "hasParking" : {value: true},
        }
      );
      // this.form = this.fb.group({
      //   selectedServices: this.fb.array([], [Validators.required])
      // })
  }
  @Input() services;

  public toggle(event: MatSlideToggleChange) {
    // console.log('toggle', event.checked);
    // let value = this.form.value;
    // event.checked == true ? value.Buildings = [] :  console.log('toggle', event.checked)
}

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateService() {
    // console.log(this.cid)
    // console.log(this.form.value)
    this.customer.updateServices({_id:this.cid,services:this.form.value}).subscribe( data =>{
      // console.log(data)
      this.onNoClick();
      this.adapptSnackbar.showMessage(
        'Updated Successfully'
      );
      // this.dialogRef.emit(data)
  })
  
  }

  
  ngOnInit(){    
    this.refreshService();
    // this.interval = setInterval(() => { 
    //     this.refreshService(); 
    // }, 10000);
  }
  refreshService(){
    this.customer.selectedService(this.data.objectName.id).subscribe(async values => {
      this.form.patchValue({
        hasLMS:values[0].hasLMS,
        hasAllocation:values[0].hasAllocation,
        hasOccupancy:values[0].hasOccupancy,
        hasOpenArea:values[0].hasOpenArea,
        hasCrbs:values[0].hasCrbs ,
        hasHotdesk:values[0].hasHotdesk,
        hasParking:values[0].hasParking,
      })
    // console.log(values[0])  
    }
    );
    // this.hasLMS=this.data.objectName.hasLMS
    // this.hasAllocation=this.data.objectName.hasAllocation
    // this.hasOccupancy=this.data.objectName.hasOccupancy
    // this.hasOpenArea=this.data.objectName.hasOpenArea
    // this.hasCrbs=this.data.objectName.hasCrbs
    // this.hasHotdesk=this.data.objectName.hasHotdesk
    // this.hasParking=this.data.objectName.hasParking
    this.cid=this.data.objectName.id;
  
}
}




@Component({
  selector: "client-service-dashboard",
  templateUrl: "client-services.component.html", 
  //  changeDetection: ChangeDetectionStrategy.OnPush

})

export class ClientServicesComponent implements OnInit  {




  selected:any;
  selectedName:any;
  selectedId:any;
  selectedBuilding:any;
  selectedLocation:any;
  selectedsaleType:any;
  selectedStatus:any;
  filterData: string;




  selectedvalue:any;
  clients:Array<any> = [];
  active:any;
  totalBuildings:Array<any> = [];
  temp: Array<any> = [];
  value:any;
  interval:any;

  sitesName: string[] = [];
  tableData: any[];
  tableFilter = '';alive: boolean;
  tableFields = [{
      displayName: 'Unique Id',
      objectName: 'id',
      type: "ids"
    },
    {
      displayName: 'Customer Name',
      objectName: 'name'
    },
    {
      displayName: 'Building',
      objectName: 'buildingName'
    },
    {
      displayName: 'Location',
      objectName: 'location'
    },
    {
      displayName: 'SaleType',
      objectName: 'saleType'
    },
    // {
    //   displayName: 'Services',
    //   objectName: 'status',
    // },
    // {
    //   displayName: 'LMS',
    //   objectName: 'hasLMS',
    //   type: "services"

    // },
    {
      displayName: "Update Services",
      objectName: 'routePage',
      type: "routePage"
    }
  ];

  constructor(public dialog: MatDialog,private adapptSnackbar: AdapptSnackbarService,private customer: CustomerService, private webSocketService:WebSocketService ,private cdRef: ChangeDetectorRef) {

  }
  @Output() applyFilter = new EventEmitter<any>();
  @Output() getselected = new EventEmitter<any>();


  enable(client) : void {
    console.log("Enabled",client)
    this.selectedStatus = true
    client.status=this.selectedStatus
    this.customer.updateServices({_id:this.selectedId,status:this.selectedStatus}).subscribe( data =>{
      // console.log(data)

  })

  }
  disable(client) : void {
    console.log("Disabled",client)
    this.selectedStatus = false
    client.status=this.selectedStatus
    this.customer.updateServices({_id:this.selectedId,status:this.selectedStatus}).subscribe( data =>{
      // console.log(data)

  })
  }
  openDialog(blePort): void {
    const dialogRef = this.dialog.open(UpdateServiceDialogComponent, {
      data: { port: blePort }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  applyFilterFunction($event) {
    let event = $event;
    this.filterData = event.target.value;
  }

  ngOnInit() {

    // this.webSocketService.listen('test event').subscribe((data)=> {
    //     // console.log(data,"data")
    //   });
    this.refreshData();
    this.interval = setInterval(() => { 
        this.refreshData(); 
    }, 10000);
 

    this.customer.getCustomersStatus().subscribe(async data=> {
      // console.log(data)
      // if (data.length > 0) {
        this.active = data;
        // console.log(this.active)

      // }
    });

  }
  refreshData(){
  this.customer.getAllCustomers().subscribe(async data => {
    console.log(data)
    if (data.length > 0) {
      this.clients = [...data];
    }
    }, err => {
      console.log(err);
      this.adapptSnackbar.showMessage(
        'Connection Failed..!'
      );
  });
}

  selectedPost(client) {
    // console.log(client.value)
    this.selectedvalue=client.value;
    this.selectedId=client.value.id;
    this.selectedStatus=client.value.status;
    this.selectedBuilding=client.value.buildingName;;
    this.selectedLocation=client.value.location;
    this.selectedsaleType=client.value.saleType;

    // console.log(this.selectedStatus)
    // console.log(this.selected)
    // const element = event.currentTarget as HTMLInputElement
    // const values = element.value;
    // console.log(values)
    // this.selectedvalue=values;
    // console.log(this.selectedvalue,"event")
    // this.getselected.emit(event);
  // }



}

}
