import { Routes } from "@angular/router";

// import {AuthLayoutComponent} from "../auth-layout/auth-layout.component";
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { ClientServicesComponent } from "../../pages/client-services/client-services.component";
import { BillingComponent } from "../../pages/billing/billing.component"
import { onBoardComponent } from "../../pages/onBoard/onboard.component"
import { mobileComponent } from '../../pages/mobile/mobile.component'
import { IconsComponent } from "../../pages/icons/icons.component";
import { MapComponent } from "../../pages/map/map.component";
import { NotificationsComponent } from "../../pages/notifications/notifications.component";
import { UserComponent } from "../../pages/user/user.component";
import { TablesComponent } from "../../pages/tables/tables.component";
import { TypographyComponent } from "../../pages/typography/typography.component";
import { CommissioningComponent } from '../../pages/commissioning/commissioning.component';
import { WificonfigComponent } from '../../pages/wificonfig/wificonfig.component';
import { HomepageComponent } from 'src/app/pages/homepage/homepage.component';
import { SettingsComponent } from '../../pages/settings/settings.component';
// import { HomedisplayComponent } from '../homedisplay/homedisplay.component';

export const AdminLayoutRoutes: Routes = [
  // { path: "dashboard", component: DashboardComponent },
  { path: "client-services", component: ClientServicesComponent },
  { path: "billing", component: BillingComponent },
  { path: "onBoard", component: onBoardComponent },
  { path: "mobile", component: mobileComponent },
  { path: "commissioning", component: CommissioningComponent },
  { path: "wifisetting", component: WificonfigComponent },
  { path: "homepage", component: HomepageComponent },
  { path: "settings", component: SettingsComponent }

  // { path: "display", component: HomedisplayComponent }
  // { path: "icons", component: IconsComponent },
  // { path: "maps", component: MapComponent },
  // { path: "notifications", component: NotificationsComponent },
  // { path: "user", component: UserComponent },
  // { path: "tables", component: TablesComponent },
  // { path: "typography", component: TypographyComponent },

];
