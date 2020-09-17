import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ServiceWorkerModule } from '@angular/service-worker';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment.prod';

import { FooterComponent } from "./footer/footer.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { AdapptToolbarComponent } from "./adappt-toolbar/adappt-toolbar.component"
import {DevicesTableGenericComponent} from './devices-table-generic/devices-table-generic.component'
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDividerModule} from '@angular/material/divider';
import {MatBadgeModule} from '@angular/material/badge';
import {MatRippleModule} from '@angular/material/core';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {FlexLayoutModule} from '@angular/flex-layout';



@NgModule({
  imports: [CommonModule, RouterModule, NgbModule,FormsModule, MatCardModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
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
  ],
  declarations: [ NavbarComponent, SidebarComponent,FooterComponent,AdapptToolbarComponent,DevicesTableGenericComponent],
  exports: [ NavbarComponent, SidebarComponent,FooterComponent,AdapptToolbarComponent,DevicesTableGenericComponent]


})
export class ComponentsModule {}
