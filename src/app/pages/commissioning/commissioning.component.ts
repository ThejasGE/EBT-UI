
import { Component, OnInit, Inject, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { templateJitUrl, ThrowStmt } from '@angular/compiler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../customer.service';
import { WebSocketService } from '../../web-socket.service';
import { AdapptDataTableComponent } from '../../components/adappt-data-table/adappt-data-table.component'
import { AdapptSnackbarService } from '../../adappt-snackbar.service';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  selector: 'app-commissioning',
  templateUrl: './commissioning.component.html',
  styleUrls: ['./commissioning.component.scss']
})
export class CommissioningComponent implements OnInit {

  sensorName = "";
  constructor(formBuilder: FormBuilder, private snackBar: AdapptSnackbarService, private adapptHttp: AdapptHttpService, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getSensorName();
  }


  getSensorName() {

    this.httpClient.get('//192.168.0.110:8001/getSensorName').subscribe((response: any) => {
      // this.snackBar.showMessage(response.msg, 'success');
      console.log(response.data);
      this.sensorName = response.address;
    }, (err: any) => {
      this.snackBar.showMessage(err.err, 'error');
    });
  }
}
