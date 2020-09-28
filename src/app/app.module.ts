import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import "core-js";
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from '../app/layouts/auth-layout/auth-layout.component';
// import { UserProfileSettingComponent } from "./layouts/user-profile-setting/user-profile-setting.component"
// import { CreateUserComponent } from './layouts/create-user/create-user.component';
// import { CreateCustomerComponent } from './layouts/create-customer/create-customer.component';
import { HomedisplayComponent } from './layouts/homedisplay/homedisplay.component';
import { WebSocketService } from './web-socket.service';
import { NgxEasypiechartModule } from 'ngx-easypiechart';
import { httpInterceptorProviders } from './adappt-http-interceptor';


import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CustomerService } from '../app/customer.service';
import { UserService } from '../app/user.service';



import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NgxUiLoaderModule } from 'ngx-ui-loader';


import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NoRightClickDirectiveDirective } from './no-right-click-directive.directive';
import { AppRoutingModule } from "./app-routing.module";
import { ComponentsModule } from "./components/components.module";
import { from } from 'rxjs';









@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    ReactiveFormsModule,
    AppRoutingModule,
    // CustomerService,
    // SampleModule,
    ToastrModule.forRoot(),
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatTooltipModule,
    MatDividerModule,
    MatListModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatListModule,
    MatTooltipModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatRadioModule,
    MatDialogModule,
    MatChipsModule,
    MatBadgeModule,
    MatRippleModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatBottomSheetModule,
    MatDatepickerModule,
    MatMenuModule,
    FlexLayoutModule,

    NgxUiLoaderModule,
    NgxEasypiechartModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),


  ],

  declarations: [AppComponent, AdminLayoutComponent, AuthLayoutComponent, NoRightClickDirectiveDirective, HomedisplayComponent],
  providers: [CustomerService, UserService, httpInterceptorProviders, WebSocketService],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AppModule { } 
