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


@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],

})
export class AuthLayoutComponent implements OnInit {
  title = 'Admin Dashboard';
  loginFormGroup: FormGroup;
  show: boolean;
  constructor(formBuilder: FormBuilder, private ngxLoader: NgxUiLoaderService, private snackBar: AdapptSnackbarService, private loginService: UserService, private adapptHttp: AdapptHttpService,
    private router: Router, private adapptAuth: AdapptAuthService) {

    this.loginFormGroup = formBuilder.group({
      email: ["", Validators.required],
      username: ["", Validators.required],
      password: ["", Validators.required]
    });
    this.show = false;
  }

  ngOnInit() {
  }

  get loginForm() {
    return this.loginFormGroup.controls;
  }


  login() {
    this.ngxLoader.start();
    if (this.loginFormGroup.invalid) {
      const config = new MatSnackBarConfig();
      config.duration = 3000;
      this.snackBar.showMessage(
        'Login is invalid'
      );
    } else {
      this.loginService.getauthUser(this.loginFormGroup.value).subscribe(data => {
        // console.log(data)
        if (data.myToken) {
          this.adapptAuth.saveSession(data);
          this.router.navigate(['display']);
          // this.snackBar.showMessage(
          //   'Login Successfull'     
          // );   
        } else {
          this.snackBar.showMessage(
            'Login is invalid'
          );
        }
      }, err => {
        console.log(err);
        this.snackBar.showMessage(
          'Connection Failed..!'
        );

      });
      this.ngxLoader.stop();

    }

  }
}
