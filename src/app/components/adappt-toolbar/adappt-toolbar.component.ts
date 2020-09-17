// import { AdapptHttpService } from './../adappt-http.service';
// import { AdapptAuthService } from './../adappt-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-adappt-toolbar',
  templateUrl: './adappt-toolbar.component.html',
  styleUrls: ['./adappt-toolbar.component.scss']
})
export class AdapptToolbarComponent {
  @Input() title: String;
  @Input() sidenavOpened: Boolean;
  loginStatus: Boolean;
  currentRoute;
  hostVersion: string;
  // title:string='LOGIN';
  constructor() {
    // this.currentRoute = this.route.snapshot.url[0].path;
    // this.loginStatus = auth.isAuthenticated();
  }
  logout() {
    // this.auth.deleteSession();
    // this.router.navigate(['login']);
  }
  ngOnInit() {
    // this.adapptHttp.get('/hostSettings').then((response: any) => {
    //   this.hostVersion = response.hostSetting.version;
    // });
  }
}
