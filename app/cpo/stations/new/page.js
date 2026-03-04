"use client";

import { useState } from "react";

export default function NewStationPage() {
  const [form, setForm] = useState({
    name: "",
    powerKW: "",
    pricePerKWh: "",
  });

  return (
        <div className="py-6 md:pt-24 px-4 md:px-10 h-3/4 rounded-lg bg-white/70 shadow-sm overflow-scroll">
      <h1 className="text-3xl font-bold mb-6">Create New Station</h1>

      <form className="space-y-4 max-w-lg">
        <input
          type="text"
          placeholder="Station Name"
          className="input input-bordered w-full"
        />

        <input
          type="number"
          placeholder="Power (kW)"
          className="input input-bordered w-full"
        />

        <input
          type="number"
          placeholder="Price per kWh"
          className="input input-bordered w-full"
        />

        <button className="btn bg-cyan-600 text-white border-none">
          Create Station
        </button>
      </form>
    </div>
  );
}