
import { Location } from '@angular/common';

import { Component, OnInit, Inject, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { templateJitUrl, ThrowStmt } from '@angular/compiler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../customer.service';
import { WebSocketService } from '../../web-socket.service';
import { DomSanitizer } from '@angular/platform-browser';
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

import { AnyARecord, AnyTxtRecord } from 'dns';
import { ConnectedPositionStrategy } from '@angular/cdk/overlay';
import { Console } from 'console';
import { Router } from '@angular/router';

@Component({
  selector: 'app-commissioning',
  templateUrl: './commissioning.component.html',
  styleUrls: ['./commissioning.component.scss']
})
export class CommissioningComponent implements OnInit {

  sensorName = "";
  locationName = "";
  location = "Meeting Room";
  capacity = "";
  linePoints = "0.0,0.5,1.0,0.5";
  entrance = "up";
  bleAddress = "";
  liveCameraImage: any;
  liveCamera: any;
  liveStatus: any;
  liveImageInterval: any;
  min_wait_time: any;
  max_wait_time: any;


  constructor(formBuilder: FormBuilder, private snackBar: AdapptSnackbarService, private adapptHttp: AdapptHttpService, private httpClient: HttpClient, private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getSensorName();
    this.getBleAddress();
    this.loadLiveImage();

  }

  updateCapacity() {
    if (Number(this.capacity)) {
      this.httpClient.post(`${Api}/putIndividualData`, { capacity: parseInt(this.capacity) }).subscribe((response: any) => {
        this.snackBar.showMessage("Capacity of Room Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  updateLocation() {
    if (this.location) {
      this.httpClient.post(`${Api}/putIndividualData`, { location_name: this.location }).subscribe((response: any) => {
        this.snackBar.showMessage("Location Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Select Valid Location Name", 'error');
    }
  }
  getSensorName() {

    this.httpClient.get(`${Api}/getSensorName`).subscribe((response: any) => {
      // this.snackBar.showMessage(response.msg, 'success');
      console.log(response.address);
      this.sensorName = response.address;
    }, (err: any) => {
      this.snackBar.showMessage("Please check your Ip Address", 'error');
    });
  }
  getBleAddress() {

    this.httpClient.get(`${Api}/getBleAddress`).subscribe((response: any) => {
      // this.snackBar.showMessage(response.msg, 'success');
      console.log(response.address);
      this.bleAddress = response.address;
    }, (err: any) => {
      this.snackBar.showMessage("Please check your Ip Address", 'error');
    });
  }
  updateLocationName() {
    if (this.locationName) {
      this.httpClient.post(`${Api}/putIndividualData`, { location_name: this.locationName }).subscribe((response: any) => {
        this.snackBar.showMessage("Location Name Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Select Valid Location Name", 'error');
    }
  }
  updateLinePoints() {

    if (this.linePoints) {
      console.log(this.linePoints)
      var temp = this.linePoints.split(",").map(x => Number(x))
      var result = new Array();
      for (var i = 0; i < temp.length; i = i + 2) {
        result.push([temp[i], temp[i + 1]])
      }
      console.log(result)

      this.httpClient.post(`${Api}/putIndividualData`, {
        line_points: result

      }).subscribe((response: any) => {
        this.snackBar.showMessage("Line Points Updated", 'success')
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error')
      })
    }
    else {
      this.snackBar.showMessage('Please Enter Valid Line Points', 'error')
    }
  }

  updateEntranceData() {
    if (this.entrance) {
      this.httpClient.post(`${Api}/putIndividualData`, {
        entrance: this.entrance
      }).subscribe((response: any) => {
        this.snackBar.showMessage("Entrance Point Updated", 'success')
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error')
      })
    }
    else {
      this.snackBar.showMessage('Please Enter Valid Entrance', 'error')
    }
  }
  loadLiveImage() {
    console.log(this.httpClient);
    this.httpClient.get(`${Api}/getLiveCameraData`).subscribe((response: any) => {

      if (response.data != '') {

        this.liveCameraImage = this.sanitizer.bypassSecurityTrustUrl("data:image/jpg;base64," + response.imageData);
      }
    }, (err) => {
      this.snackBar.showMessage('Could not fetch Image', 'error');
      console.log(err)
    })
  }
  liveViewStatus() {
    this.httpClient.get(`${Api}/liveAppStatus`).subscribe((response: any) => {
      console.log(response)
      this.liveCamera = response.status;
      this.liveStatus = response.status;
      if (this.liveStatus) {
        this.httpClient.get("${Api}/stopLiveCamera").subscribe((response: any) => {
          this.liveStatus = !this.liveStatus;
          clearInterval(this.liveImageInterval);
        }, (err) => {
        });
      }
    })
  }

  startStopLiveView() {
    if (this.liveStatus) {
      this.httpClient.get(`${Api}/stopLiveCamera`).subscribe((response: any) => {
        this.snackBar.showMessage(response.msg, 'success')
        this.liveStatus = !this.liveStatus;
        clearInterval(this.liveImageInterval);
        this.snackBar.showMessage(response.msg, 'success')

      }, (err) => {
        this.snackBar.showMessage('error', 'error')
      })
    }
    else {
      this.liveStatus = !this.liveStatus;
      this.liveImageInterval = setInterval(() => {
        this.loadLiveImage();
      }, 200);
      this.httpClient.get(`${Api}/startLiveCamera`).subscribe((response: any) => {

        this.snackBar.showMessage(response.msg, 'success');

      }, (err) => {

        console.log(err)
        this.snackBar.showMessage(err.data.err, 'error');

      })
    }
  }
  stopLiveView() {
    if (this.liveImageInterval) {
      this.httpClient.get(`${Api}/stopLiveCamera`).subscribe((response: any) => {
        this.snackBar.showMessage('Live View Stopped', 'success')
        this.liveStatus = !this.liveStatus;
        clearInterval(this.liveImageInterval);
        this.snackBar.showMessage('Live view stopped', 'success')

      }, (err) => {
        this.snackBar.showMessage(err, 'error')
      })
    }
  }
  reLoad() {
    window.location.reload();
  }
  updateMinWaitTime() {
    if (Number(this.min_wait_time)) {
      this.httpClient.post(`${Api}/putIndividualData`, { min_wait_time: parseInt(this.min_wait_time) }).subscribe((response: any) => {
        this.snackBar.showMessage("Minimum Wait Time Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  updateMaxWaitTime() {
    if (Number(this.max_wait_time)) {
      this.httpClient.post(`${Api}/putIndividualData`, { max_wait_time: parseInt(this.max_wait_time) }).subscribe((response: any) => {
        this.snackBar.showMessage("Maximum Wait Time Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
}
