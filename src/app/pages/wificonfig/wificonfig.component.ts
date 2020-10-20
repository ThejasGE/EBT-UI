import { Location } from '@angular/common';

import { Component, OnInit, Inject, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { templateJitUrl, ThrowStmt } from '@angular/compiler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CustomerService } from '../../customer.service';
import { WebSocketService } from '../../web-socket.service';
import { DomSanitizer } from '@angular/platform-browser';
// import { CommonModule } from '@angular/common';
// import { AdapptDataTableComponent } from '../../components/adappt-data-table/adappt-data-table.component'
import { AdapptSnackbarService } from '../../adappt-snackbar.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Api } from '../../env.service';
import { FormBuilder, NgModel, FormGroup, FormArray, FormsModule, Validators, FormControl } from "@angular/forms";
import { async } from '@angular/core/testing';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AdapptHttpService } from '../../adappt-http.service'
import { ValueTransformer } from '@angular/compiler/src/util';
import { Observable, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
// import { BrowserModule } from '@angular/platform-browser';
import { AnyARecord, AnyTxtRecord } from 'dns';
import { ConnectedPositionStrategy } from '@angular/cdk/overlay';
import { Console } from 'console';
import { Router } from '@angular/router';


export interface DialogData {
  ssid: string;
  username: any;
  psk: any;
  password: any;
  loginFormGroup: FormGroup;
  show: boolean;
  networks: any;
}
@Component({
  selector: 'wifi-dialog',
  templateUrl: '../wificonfig/wifiDialog.html'
})
export class WifiDialog {
  wifiFormGroup: FormGroup;
  show: boolean;
  networks: any;



  constructor(
    public dialogRef: MatDialogRef<WifiDialog>, formBuilder: FormBuilder, private snackBar: AdapptSnackbarService, private httpClient: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.wifiFormGroup = formBuilder.group({
      // email:  ["", Validators.required],
      username: ["", Validators.required],
      password: ["", Validators.required]
    });
    this.show = false;
    console.log(this.data.networks);
  }


  myFunction() {
    var x = <HTMLInputElement>document.getElementById("myInput");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }
  onclick() {
    this.dialogRef.close();
  }
  // searchNetwork() {
  //   this.httpClient.get(`${Api}/getScanNetwork`).subscribe((response: any) => {
  //     this.networks = response.Essid;

  //   }, (err: any) => {
  //     this.snackBar.showMessage('Wifi Networks Not Available', 'error')
  //   })

  get wifiForm() {
    return this.wifiFormGroup.controls;
  }

  // }
  wifiConnect() {

    if (this.wifiFormGroup.valid) {
      this.httpClient.post(`${Api}/putScanNetwork`, this.wifiFormGroup.value).subscribe(response => {
        this.snackBar.showMessage('Network Added to the Device', 'success')
      }, (err: any) => {
        this.snackBar.showMessage('Error: Please Check the Networks Availabe', 'error')
      })


      // console.log(this.wifiFormGroup.value);
    }
  }
}

@Component({
  selector: 'app-wificonfig',
  templateUrl: './wificonfig.component.html',
  styleUrls: ['./wificonfig.component.scss']
})
export class WificonfigComponent implements OnInit {
  networks: any;
  mode: any;
  ssid: any;
  password: string;
  psk: any;
  presentMode: any;
  current: any;
  username: any;
  bleAddress: any;
  hostAddress: any;
  hostform: FormGroup;


  constructor(formBuilder: FormBuilder, private snackBar: AdapptSnackbarService, private adapptHttp: AdapptHttpService, private httpClient: HttpClient, private router: Router, private sanitizer: DomSanitizer, public dialog: MatDialog) {
    this.hostform = formBuilder.group({
      // email:  ["", Validators.required],
      btaddress: ["", Validators.required],
      // password: ["", Validators.required]
    });
  }

  ngOnInit(): void {
    this.searchNetwork();
    this.currentMode();
    this.btAddress();
    this.bthostAddress();

  }
  searchNetwork() {
    this.httpClient.get(`${Api}/getScanNetwork`).subscribe((response: any) => {
      this.networks = response.Essid;

    }, (err: any) => {
      this.snackBar.showMessage('Wifi Networks Not Available ,Device is in Hotspot Mode', 'error')
    })

  }
  openDialog(): void {
    const dialogRef = this.dialog.open(WifiDialog, {
      width: '450px',
      data: { networks: this.networks, password: this.psk }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.username = result;
    });
  }
  switchMode() {
    this.httpClient.get(`${Api}/rpi_mode`).subscribe((response: any) => {
      this.current = response.currentmode;
    }, (err: any) => {
      this.snackBar.showMessage('Please Check the Connection ')
    })
  }
  currentMode() {
    this.httpClient.get(`${Api}/fetch1_mode`).subscribe((response: any) => {
      this.presentMode = response.currentMode;
    }, (err: any) => {
      this.snackBar.showMessage('Please Check the Connection')
    })
  }
  reLoad() {

    setTimeout(function () {
      if (window.location.hash != '#') {
        window.location.hash = 'wifisetting';
        window.location.reload();
      }
    }, 2000);
  }
  btAddress() {
    this.httpClient.get(`${Api}/bt_serialaddr`).subscribe((response: any) => {
      this.bleAddress = response.btAdress;
    }, (err: any) => {
      this.snackBar.showMessage('Please Connect to Bluetooth')
    })
  }
  bthostAddress() {
    this.httpClient.get(`${Api}/bt_hostaddr`).subscribe((response: any) => {
      this.hostAddress = response.hostAdress;
    }, (err: any) => {
      this.snackBar.showMessage('Please Connect to Bluetooth')
    })
  }
  updateHostAddress() {
    console.log(this.hostform.value)
    const formdata = new FormData();
    formdata.append('btaddress', this.hostform.get("btaddress").value.toUpperCase());
    this.httpClient.post(`${Api}/bt_changeaddr`, formdata).subscribe((response: any) => {
      this.snackBar.showMessage('Host Address Updated')

    }, (err: any) => {
      this.snackBar.showMessage('Please Check Bluetooth Connection')
    })
  }

}
