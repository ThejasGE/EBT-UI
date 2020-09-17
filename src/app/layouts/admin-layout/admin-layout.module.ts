import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


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




// import {MatDatepickerModule} from '@angular/material/datepicker';

import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';


import { AdminLayoutRoutes } from "./admin-layout.routing";
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { ClientServicesComponent } from "../../pages/client-services/client-services.component"
import { UpdateServiceDialogComponent } from '../../pages/client-services/client-services.component';
import { BillingComponent } from "../../pages/billing/billing.component"
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { IconsComponent } from "../../pages/icons/icons.component";
import { MapComponent } from "../../pages/map/map.component";
import { NotificationsComponent } from "../../pages/notifications/notifications.component";
import { UserComponent } from "../../pages/user/user.component";
import { TablesComponent } from "../../pages/tables/tables.component";
import { TypographyComponent } from "../../pages/typography/typography.component";
import { onBoardComponent } from "../../pages/onBoard/onboard.component";
import { AdapptDataTableComponent } from "../../components/adappt-data-table/adappt-data-table.component";
import { HomepageComponent } from "../../pages/homepage/homepage.component";
// import { HomedisplayComponent } from "../homedisplay/homedisplay.component"

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
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
    SatDatepickerModule,
    SatNativeDateModule,
    FlexLayoutModule,


  ],
  declarations: [
    DashboardComponent,
    // CustomerService,
    // AuthLayoutComponent,
    UpdateServiceDialogComponent,
    ClientServicesComponent,
    onBoardComponent,
    BillingComponent,
    UserComponent,
    TablesComponent,
    IconsComponent,
    TypographyComponent,
    NotificationsComponent,
    // HomedisplayComponent,
    HomepageComponent,
    MapComponent,
    AdapptDataTableComponent,
  ],
  exports: [],
  providers: [ClientServicesComponent],
})
export class AdminLayoutModule { }
