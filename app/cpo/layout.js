"use client";

import SideNav from "@/components/layout/Sidenav";

export default function CpoLayout({ children }) {
  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row md:overflow-scroll bg-white/50
       bg-[url(/backgroundimages/ev-charging-station_tp.JPG)] bg-cover bg-center bg-no-repeat bg-fixed">

        <div className="w-full flex-none md:w-80 z-10000">
          {/* Sidebar */}
          <SideNav />
        </div>

        {/* Content */}
        <main className="grow md:overflow-y-auto p-1 md:p-2">
          {children}
        </main>
      </div>
    </>

  );
}