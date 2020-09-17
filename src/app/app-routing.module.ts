import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import { AdapptAuthGuard } from "./adappt-auth.guard"
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from '../app/layouts/auth-layout/auth-layout.component';
import { UserProfileSettingComponent } from './layouts/user-profile-setting/user-profile-setting.component';
import { HomedisplayComponent } from './layouts/homedisplay/homedisplay.component'
import { NoRightClickDirectiveDirective } from './no-right-click-directive.directive';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'display' },
  { path: 'login', component: AuthLayoutComponent },
  {
    path: '', component: AdminLayoutComponent, children: [
      {
        path: "",
        // canActivate: [AdapptAuthGuard],
        loadChildren:
          "./layouts/admin-layout/admin-layout.module#AdminLayoutModule"
      }
    ]
  },
  //         { path: '404', component: NotFoundComponent },
  { path: "userprofile", component: UserProfileSettingComponent },
  { path: "display", component: HomedisplayComponent },
  { path: '**', component: AuthLayoutComponent }
];



// const routes: Routes = [

//   {
//     path: "",
//     redirectTo: "dashboard",
//     pathMatch: "full"
//   },

//   {
//     path: "",
//     component: AdminLayoutComponent,
//     children: [
//       {
//         path: "",
//         loadChildren:
//           "./layouts/admin-layout/admin-layout.module#AdminLayoutModule"
//       }
//     ]
//   }, 
//   {
//     path: '',
//     component: AuthLayoutComponent,
//     children: [
//       {
//         path: '',
//         loadChildren: './layouts/auth-layout/auth-layout.module#AuthLayoutModule'
//       }
//     ]
//   },
//   {
//     path: "**",
//     redirectTo: "dashboard"
//   }

// ];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
