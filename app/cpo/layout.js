"use client";

import SideNav from "@/components/layout/Sidenav";

export default function CpoLayout({ children }) {
  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row md:overflow-scroll bg-gray-200/50">

        <div className="w-full flex-none md:w-72">
        {/* Sidebar */}
          <SideNav />
        </div>

        {/* Content */}
        <main className="grow overflow-y-auto p-1 md:p-2">
          {children}
        </main>
      </div>

      {/* <div className="h-screen flex flex-col md:flex-row md:overflow-scroll bg-[url(/backgroundimages/Abstract-White.png)] bg-cover bg-center bg-no-repeat bg-fixed">
        <div className="w-full flex-none md:w-72">
          <SideNavigation
            UserAccess={useraccess}
            UserCountry={usercountry}
          />
        </div>
        <div className="flex-grow p-1 overflow-y-auto md:p-2">
          {children}
          <DashboardFooter />
        </div>
      </div> */}
    </>

  );
}