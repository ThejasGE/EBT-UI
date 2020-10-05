import { Component, OnInit, Inject, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { templateJitUrl, ThrowStmt } from '@angular/compiler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../customer.service';
import { WebSocketService } from '../../web-socket.service';
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

import { AnyARecord } from 'dns';
import { ConnectedPositionStrategy } from '@angular/cdk/overlay';
import { Console } from 'console';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  capacity = ""
  min_wait_time = ""
  max_wait_time = ""
  percent_cap = ""
  minutes_inactive = ""
  location = "meetingRoom"
  frequency = ""
  buffer_frames = ""
  max_days = ""
  max_distance = ""
  max_disappeared = ""
  currentModel: any;
  constructor(formBuilder: FormBuilder, private snackBar: AdapptSnackbarService, private adapptHttp: AdapptHttpService, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getCurrentModel();
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
  updatePercentageCap() {
    if (Number(this.percent_cap)) {
      this.httpClient.post(`${Api}/putIndividualData`, { percent_cap: parseFloat(this.percent_cap) }).subscribe((response: any) => {
        this.snackBar.showMessage("Percentage of Room Capacity Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  updateMinutesInactive() {
    if (Number(this.minutes_inactive)) {
      this.httpClient.post(`${Api}/putIndividualData`, { minutes_inactive: parseInt(this.minutes_inactive) }).subscribe((response: any) => {
        this.snackBar.showMessage("Minutes InActive Time Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  updateLocationName() {
    if (this.location) {
      this.httpClient.post(`${Api}/putIndividualData`, { location_name: this.location }).subscribe((response: any) => {
        this.snackBar.showMessage("Location Name Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Select Valid Location Name", 'error');
    }
  }
  updateFrequency() {
    if (Number(this.frequency)) {
      this.httpClient.post(`${Api}/putIndividualData`, { frequency: parseFloat(this.frequency) }).subscribe((response: any) => {
        this.snackBar.showMessage("Frequency Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  updateBufferFrames() {
    if (Number(this.buffer_frames)) {
      this.httpClient.post(`${Api}/putIndividualData`, { buffer_frames: parseFloat(this.buffer_frames) }).subscribe((response: any) => {
        this.snackBar.showMessage("Buffer Frames Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  updateMaxDays() {
    if (Number(this.max_days)) {
      this.httpClient.post(`${Api}/putIndividualData`, { max_days: parseInt(this.max_days) }).subscribe((response: any) => {
        this.snackBar.showMessage("Maximum days Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  updateMaxDistance() {
    if (Number(this.max_distance)) {
      this.httpClient.post(`${Api}/putIndividualData`, { max_distance: parseInt(this.max_distance) }).subscribe((response: any) => {
        this.snackBar.showMessage("Maximum Distance Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  updateMaxDisappeared() {
    if (Number(this.max_disappeared)) {
      this.httpClient.post(`${Api}/putIndividualData`, { max_disappeared: parseInt(this.max_disappeared) }).subscribe((response: any) => {
        this.snackBar.showMessage("Maximum Disappeared Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number", 'error');
    }
  }
  getCurrentModel() {
    this.httpClient.get(`${Api}/getCurrentModel`).subscribe((response: any) => {
      // this.snackBar.showMessage(response.msg, 'success');
      console.log(response.address);
      this.currentModel = response.address;
    }, (err: any) => {
      this.snackBar.showMessage("Please check your Ip Address", 'error');
    });
  }
}
