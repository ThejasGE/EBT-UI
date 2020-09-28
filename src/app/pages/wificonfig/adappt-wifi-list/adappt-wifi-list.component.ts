import { AdapptWifiObservableService } from '../adappt-wifi-observable.service';
import { AdapptHttpService } from '../../../adappt-http.service';
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdapptSnackbarService } from '../../../adappt-snackbar.service';

const ipPattern =
  '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

@Component({
  selector: 'app-adappt-wifi-list',
  templateUrl: './adappt-wifi-list.component.html',
  styleUrls: ['./adappt-wifi-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdapptWifiListComponent implements OnInit {
  @Input() wifiList;
  wifiFormGroup: FormGroup;
  constructor(formBuilder: FormBuilder, public adapptSnackbar: AdapptSnackbarService, private adapptHttp: AdapptHttpService,
    private wifiListUpdater: AdapptWifiObservableService) {
    this.wifiFormGroup = formBuilder.group({
      ipAddress: [
        null,
        [Validators.required, Validators.pattern(ipPattern)]
      ]
    });
  }
  get wifiForm() {
    return this.wifiFormGroup.controls;
  }
  ngOnInit() {
  }
  wifiStatus(wifi) {
    return (wifi.connected ? ('wifi-connected') : (wifi.saved ? 'wifi-saved' : ''));
  }
  getWifiIcon(wifi) {
    return (wifi.connected ? ('signal_wifi_4_bar') : (wifi.saved ? 'signal_wifi_off' : 'wifi'));
  }
  connectWifi(wifi) {
    this.adapptHttp.post('/connectToWifi', wifi).then((response: any) => {
      this.adapptSnackbar.showMessage(response.msg, 'success');
      this.wifiListUpdater.notifyUpdate();
    }, (err) => {
      this.adapptSnackbar.showMessage(err.err, 'error');
    });
  }
  removeWifi(wifi) {
    this.adapptHttp.post('/removeWifi', wifi).then((response: any) => {
      this.adapptSnackbar.showMessage(response.msg, 'success');
      this.wifiListUpdater.notifyUpdate();
    }, (err) => {
      this.adapptSnackbar.showMessage(err.err, 'error');
    });
  }
  setStaticIp() {
    console.log(this.wifiFormGroup.value);
    if (this.wifiFormGroup.invalid) {
      this.adapptSnackbar.showMessage('Please enter valid IP address', 'error');
    } else {
      this.adapptHttp.post('/setStaticWifi', this.wifiFormGroup.value).then((response: any) => {
        this.adapptSnackbar.showMessage(response.msg, 'success');
        this.wifiListUpdater.notifyUpdate();
      }, (err) => {
        this.adapptSnackbar.showMessage(err.err, 'error');
      });
    }
  }
  disconnectWifi(wifi) {
    this.adapptHttp.post('/disconnectWifi', wifi).then((response: any) => {
      this.adapptSnackbar.showMessage(response.msg, 'success');
      this.wifiListUpdater.notifyUpdate();
    }, (err) => {
      this.adapptSnackbar.showMessage(err.err, 'error');
    });
  }
  saveAndConnect(wifi) {
    this.adapptHttp.post('/saveWifiConfig', wifi).then((response: any) => {
      this.adapptSnackbar.showMessage(response.msg, 'success');
      this.wifiListUpdater.notifyUpdate();
    }, (err) => {
      this.adapptSnackbar.showMessage(err.err, 'error');
    });
  }
}
