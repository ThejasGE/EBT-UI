import { CookieService } from 'ngx-cookie-service';
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
// import { CookieService } from 'ngx-cookie-service'


@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],

})
export class AuthLayoutComponent implements OnInit {
  title = 'Admin Login';
  loginFormGroup: FormGroup;
  show: boolean;
  constructor(formBuilder: FormBuilder, private ngxLoader: NgxUiLoaderService, private snackBar: AdapptSnackbarService, private loginService: UserService, private adapptHttp: AdapptHttpService,
    private router: Router, private adapptAuth: AdapptAuthService, private cookieService: CookieService) {

    this.loginFormGroup = formBuilder.group({
      userName: ["", Validators.required],
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
      console.log('error1')
      this.snackBar.showMessage(
        'Login is invalid'
      );
    } else {
      this.loginService.getauthUser(this.loginFormGroup.value).subscribe(data => {
        // console.log(data)
        if (data.auth_token) {
          this.adapptAuth.saveSession(data);
          this.router.navigate(['commissioning']);
          // this.snackBar.showMessage(
          //   'Login Successfull'     
          // );   
        } else {
          console.log('error2')
          this.snackBar.showMessage(
            'Login is invalid'
          );
        }
      }, err => {
        console.log(err);
        this.snackBar.showMessage(
          'Invalid Login Credentials..!'
        );

      });
      this.ngxLoader.stop();

    }

  }
  login1() {
    console.log(this.loginFormGroup.value)
  }
}
