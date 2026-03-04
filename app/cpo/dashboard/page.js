"use client"

import { useState, useEffect } from "react";

export default function DashboardPage() {

  const [cpo, setCpo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCPO() {
      const res = await fetch("/api/cpo/me");
      const data = await res.json();

      if (res.ok) {
        setCpo(data.cpo);
      }

      setLoading(false);
    }

    fetchCPO();
  }, []);


  return (
    <div className="py-6 md:pt-24 px-4 md:px-10 h-screen rounded-lg bg-white/70 shadow-sm overflow-scroll">

      <div className="flex flex-wrap justify-between items-center gap-2 mb-5">
        {loading && (
          <>
            <span className="loading loading-dots loading-lg text-blue-950"></span>
          </>
        )}
        {cpo && (
          <h1 className="text-3xl font-bold mb-6 text-blue-950">{cpo?.companyName}</h1>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-blue-100/30 shadow p-6">
          <h2 className="text-lg font-semibold">Total Stations</h2>
          <p className="text-3xl mt-2">12</p>
        </div>

        <div className="card bg-blue-100/30 shadow p-6">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          <p className="text-3xl mt-2">8</p>
        </div>

        <div className="card bg-blue-100/30 shadow p-6">
          <h2 className="text-lg font-semibold">Revenue Today</h2>
          <p className="text-3xl mt-2">₵1,240</p>
        </div>
      </div>
    </div>
  );
}