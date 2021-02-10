
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
  location = "";
  capacity = "";
  linePoints = "";
  entrance: any;
  bleAddress = "";
  liveCameraImage: any;
  liveCamera: any;
  liveStatus: any;
  liveImageInterval: any;
  min_wait_time: any;
  max_wait_time: any;
  entryDirection = "";
  lining: any;
  company: any;


  constructor(formBuilder: FormBuilder, private snackBar: AdapptSnackbarService, private adapptHttp: AdapptHttpService, private httpClient: HttpClient, private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getSensorName();
    this.getBleAddress();
    this.loadLiveImage();
    this.selectEntry();
    this.selectLocation();
    this.selectCapacity();
    this.selectMaxWaitTime();
    this.selectMinWaitTime();
    this.selectLinepoints();
    this.selectCompany();
    setInterval(() => {
      this.reLoad();
    }, 960000);
  }

  updateCapacity() {
    if (Number(this.capacity) > 0) {
      this.httpClient.post(`${Api}/putIndividualData`, { capacity: parseInt(this.capacity) }).subscribe((response: any) => {
        this.snackBar.showMessage("Capacity of Room Updated", 'success');

      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Number Greater than Zero", 'error');
    }
  }
  updateLocation() {
    if (this.location !== '' && this.location.length >= 3) {
      this.httpClient.post(`${Api}/putIndividualData`, { location_name: this.location }).subscribe((response: any) => {
        this.snackBar.showMessage("Location Updated", 'success');

      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Location Name with minimum of 3 characters", 'error');
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
      this.snackBar.showMessage("Sensor Ble Address not found", 'error');
    });
  }
  // updateLocationName() {
  //   if (this.locationName !== '' && this.locationName.length >= 3) {
  //     this.httpClient.post(`${Api}/putIndividualData`, { location_name: this.locationName }).subscribe((response: any) => {
  //       this.snackBar.showMessage("Location Name Updated", 'success');
  //     }, (err: any) => {
  //       this.snackBar.showMessage(err.data.err, 'error');
  //     })

  //   }
  //   else {
  //     this.snackBar.showMessage("Please Enter Valid Location Name with minimum of 3 characters", 'error');
  //   }
  // }
  updateCompanyName() {
    if (this.company !== '' && this.company.length >= 3) {
      this.httpClient.post(`${Api}/putIndividualData`, { company_name: this.company }).subscribe((response: any) => {
        this.snackBar.showMessage("Company Name Updated", 'success');
      }, (err: any) => {
        this.snackBar.showMessage(err.data.err, 'error');
      })

    }
    else {
      this.snackBar.showMessage("Please Enter Valid Company Name with minimum 3 characters", 'error');
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
  selectEntry() {
    this.httpClient.get(`${Api}/getJsonData`).subscribe((response: any) => {
      this.entryDirection = response.counter.entrance
      this.entrance = this.entryDirection
    })
  }
  selectMinWaitTime() {
    this.httpClient.get(`${Api}/getJsonData`).subscribe((response: any) => {
      this.min_wait_time = response.counter.min_wait_time

    })
  }
  selectMaxWaitTime() {
    this.httpClient.get(`${Api}/getJsonData`).subscribe((response: any) => {
      this.max_wait_time = response.counter.max_wait_time

    })
  }
  selectLocation() {
    this.httpClient.get(`${Api}/getJsonData`).subscribe((response: any) => {
      this.location = response.location.location_name
    })
  }
  selectCompany() {
    this.httpClient.get(`${Api}/getJsonData`).subscribe((response: any) => {
      this.company = response.location.company_name
    })
  }
  selectLinepoints() {
    this.httpClient.get(`${Api}/getJsonData`).subscribe((response: any) => {
      this.lining = response.counter.line_points
      this.linePoints = this.lining;
    })
  }
  selectCapacity() {
    this.httpClient.get(`${Api}/getJsonData`).subscribe((response: any) => {
      this.capacity = response.location.capacity

    })
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
    setInterval(() => { window.location.reload() }, 2000)
  };

  resetCount() {
    this.httpClient.get(`${Api}/resetCount`).subscribe((response: any) => {
      this.snackBar.showMessage('The Count has been Reset to Zero')
    }, (err) => {
      this.snackBar.showMessage('Something is Wrong, Please Wait', 'error')
    })
  }
  updateMinWaitTime() {
    if (Number(this.min_wait_time) > 0) {
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
    if (Number(this.max_wait_time) > 0) {
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
  updateAllvalue() {

    this.httpClient.post(`${Api}/putIndividualData`, {
      max_wait_time: 5, capacity: 12, entrance: "up", percent_cap: 1.5, min_wait_time: 10, max_distance: 55, max_disappeared: 3, buffer_frames: 6, frequency: 0, location_name: "Meeting Room", company_name: "XYZ", line_points: [
        [
          0.5,
          0
        ],
        [
          0.5,
          1
        ]
      ]
    }).subscribe((response: any) => {
      this.snackBar.showMessage("Restored to Default Value", 'success');
    }, (err: any) => {
      this.snackBar.showMessage(err.data.err, 'error');
    })



  }
}
