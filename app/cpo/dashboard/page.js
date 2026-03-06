"use client"

import { useState, useEffect } from "react";

export default function DashboardPage() {

  const [cpo, setCpo] = useState(null);
  const [stations, setStations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCPO() {
      const res = await fetch("/api/cpo/me");
      const data = await res.json();

      if (res.ok) {
        setCpo(data.cpo);
        setStations(data.stations);
      }

      setLoading(false);
    }

    fetchCPO();
  }, []);

  return (
<div className="py-6 md:pt-24 px-4 md:px-10 h-screen rounded-2xl 
  bg-white/70 backdrop-blur-xl border border-white/30 
  shadow-md overflow-scroll">

  <div className="flex flex-wrap justify-between items-center gap-2 mb-8">

    {loading && (
      <span className="loading loading-spinner loading-lg text-blue-900"></span>
    )}

    {cpo && (
      <h1 className="text-3xl md:text-4xl font-bold text-blue-950 tracking-tight">
        {cpo?.companyName}
      </h1>
    )}

  </div>


  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {loading && (
      <span className="loading loading-spinner loading-lg text-blue-950"></span>
    )}

    {stations && (
      <div className="
        relative p-6 rounded-2xl
        bg-gradient-to-br from-white/60 to-blue-100/30
        backdrop-blur-xl
        border border-white/40
        shadow-[0_5px_15px_rgba(0,0,0,0.08)]
        hover:shadow-sm
        transition-all duration-300
      ">

        <h2 className="text-sm font-medium text-blue-900/70">
          Total Stations
        </h2>

        <p className="text-5xl mt-3 font-bold text-blue-950 tracking-tight">
          {stations?.length}
        </p>

      </div>
    )}

  </div>
</div>
  );
}