import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AdapptAuthService } from '../../adappt-auth.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AdapptHttpService } from '../../adappt-http.service';
import { UserService } from '../../user.service';
import { AdapptSnackbarService } from '../../adappt-snackbar.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { error } from '@angular/compiler/src/util';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Api } from '../../env.service';
@Component({
  selector: 'app-homedisplay',
  templateUrl: './homedisplay.component.html',
  styleUrls: ['./homedisplay.component.scss']
})
export class HomedisplayComponent implements OnInit {

  // percent = [80]
  // this.options = {
  //   size: 50,
  //   rotate: 0
  // };
  liveImageInterval = null;
  liveCamera = false;
  timerText = 'Start Live view';
  appText = "Start Application";
  Entry = "";
  waitingtime = "";
  timestamp: any;
  timesplitted: any;
  finaltime: any;
  time1: any;
  time2: any;
  upCount: any;
  downCount: any;
  fill: any;
  minwaittime: any;
  roomname: any;
  timeInterval: any;
  fill2: 100;
  url;
  msg = "";


  constructor(formBuilder: FormBuilder, private ngxLoader: NgxUiLoaderService, private snackBar: AdapptSnackbarService, private loginService: UserService, private adapptHttp: AdapptHttpService,
    private router: Router, private adapptAuth: AdapptAuthService, private httpClient: HttpClient) { }

  ngOnInit() {
    this.loadLiveImage();
    setInterval(() => {
      this.loadLiveImage();
    }, 200);
    setInterval(() => {
      this.time2 = new Date();
    }, 1000);
  }

  loadLiveImage() {
    this.httpClient.get(`${Api}/getCount`).subscribe((response: any) => {
      if (response.data != '') {

        this.timestamp = response.timestamp;
        this.timesplitted = this.timestamp.split(" ")
        // console.log(this.timesplitted, "times")

        this.finaltime = this.timesplitted[1] + " " + this.timesplitted[2]
        // console.log(this.finaltime, 'date')
        this.time1 = this.finaltime.toUpperCase();
        this.upCount = 19;
        // this.downCount = response.data.exit;
        this.downCount = response.capacity;
        this.fill = 50;
        this.minwaittime = response.min_wait_time;
        console.log(this.minwaittime, "wait times")
        this.roomname = response.location_name.toUpperCase();

      }
    }, (err) => {
      console.log(err)
    })
  }
  isRoomOccupied() {
    if (this.fill > 89 && this.fill < 99) {

      this.Entry = "ENTER"
      this.waitingtime = "No Wait";
      return true

    } else if (this.fill <= 89) {
      this.Entry = "ENTER"
      this.waitingtime = "No Wait";
      return false

    } else {
      this.isRoomFullOccupied();

    }
  }
  isRoomFullOccupied() {
    if (this.fill >= 99) {

      this.Entry = "WAIT"
      this.waitingtime = this.minwaittime + " Minutes";
      return true
    }
  }
  selectFile(event) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      this.msg = 'You must select an image';
      return;
    }

    var mimeType = event.target.files[0].type;

    if (mimeType.match(/image\/*/) == null) {
      this.msg = "Only images are supported";
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (_event) => {
      this.msg = "";
      this.url = reader.result;
    }
  }
}
