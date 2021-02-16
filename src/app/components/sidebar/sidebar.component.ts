import { Component, OnInit } from "@angular/core";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  // {
  //   path: "/dashboard",
  //   title: "Dashboard",
  //   icon: "icon-chart-pie-36",
  //   class: ""
  // },
  // {
  //   path: "/client-services",
  //   title: "Services",
  //   icon: "icon-settings",
  //   class: ""
  // },
  // {
  //   path: "/display",
  //   title: "Display",
  //   icon: "icon-tv-2",
  //   class: ""
  // },
  // {
  //   path: "/analytics",
  //   title: "Analytics",
  //   icon: "icon-chart-bar-32",
  //   class: ""
  // },
  {
    path: "/commissioning",
    title: "Commissioning",
    icon: "icon-settings",
    class: ""

  },
  // {
  //   path: "/billing",
  //   title: "Billing",
  //   icon: "icon-credit-card",
  //   class: ""
  // },
  {
    path: "/wifisetting",
    title: "Network Configuration",
    icon: "icon-wifi",
    class: ""
  }
  // {
  //   path: "/settings",
  //   title: "Advance Settings",
  //   icon: "icon-settings-gear-63",
  //   class: ""
  // },
  // {
  //   path: "/onBoard",
  //   title: "onBoard",
  //   icon: "icon-spaceship",
  //   class: ""
  // },
  // {
  //   path: "/mobile",
  //   title: "Mobile",
  //   icon: "icon-mobile",
  //   class: ""
  // },

  // {
  //   path: "/login",
  //   title: "Logout",
  //   icon: "icon-bullet-list-67",
  //   class: ""
  // },
  // {
  //   path: "/icons",
  //   title: "Icons",
  //   icon: "icon-atom",
  //   class: ""
  // },
  // {
  //   path: "/maps",
  //   title: "Maps",
  //   icon: "icon-pin",
  //   class: "" },
  // {
  //   path: "/notifications",
  //   title: "Notifications",
  //   icon: "icon-bell-55",
  //   class: ""
  // },

  // {
  //   path: "/user",
  //   title: "User Profile",
  //   icon: "icon-single-02",
  //   class: ""
  // },
  // {
  //   path: "/tables",
  //   title: "Table List",
  //   icon: "icon-puzzle-10",
  //   class: ""
  // },
  // // {
  // //   path: "/typography",
  // //   title: "Typography",
  // //   icon: "icon-align-center",
  // //   class: ""
  // // }
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  }
}
