import {
  LayoutDashboardIcon,
  EvCharger,
  Map,
  Building2,
  House,
} from "lucide-react";

export const dashboardNav = {
  cpo: [
    {
      id: 0,
      path: "/",
      linkname: "Go To Map",
      icon: Map,
    },
    {
      id: 1,
      path: "/cpo/dashboard",
      linkname: "Dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      id: 2,
      path: "/cpo/stations",
      linkname: "Stations",
      icon: EvCharger,
    },
  ],

  realtor: [
    {
      id: 0,
      path: "/",
      linkname: "Explore Properties",
      icon: Map,
    },
    {
      id: 1,
      path: "/realtor/dashboard",
      linkname: "Dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      id: 2,
      path: "/realtor/properties",
      linkname: "Properties",
      icon: House,
    },
    {
      id: 3,
      path: "/realtor/profile",
      linkname: "Profile",
      icon: Building2,
    },
  ],
};