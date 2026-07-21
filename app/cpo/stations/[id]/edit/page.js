"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/toast";

const CONNECTOR_OPTIONS = ["Type2", "CCS", "CHAdeMO", "GB/T", "Tesla"];

export default function EditStationPage() {

  const { id } = useParams();

  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    connectors: [],
    powerKW: "",
    pricePerKWh: "",
    outlets: "",
    availabilityStatus: "available",
  });

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const router = useRouter();

  // Fetch station
  useEffect(() => {
    if (!id) return;

    const fetchStation = async () => {
      const res = await fetch(`/api/stations/${id}`);
      const data = await res.json();

      const station = data.station;

      setForm({
        id: id,
        name: station.name || "",
        description: station.description || "",
        address: station.address || "",
        latitude: station.location.coordinates[1],
        longitude: station.location.coordinates[0],
        connectors: station.connectors || [],
        powerKW: station.powerKW || "",
        pricePerKWh: station.pricePerKWh || "",
        outlets: station.outlets || "",
        availabilityStatus: station.availabilityStatus || "available",
      });
    };

    fetchStation();
  }, [id]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConnectorChange = (connector) => {
    setForm((prev) => ({
      ...prev,
      connectors: prev.connectors.includes(connector)
        ? prev.connectors.filter((c) => c !== connector)
        : [...prev.connectors, connector],
    }));
  };


  // Submit (UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setToast({
        open: true,
        type: "warning",
        title: "Latitude error",
        message: "Please enter a valid Latitude between -90 and 90. (e.g. 5.907320)",
      });
      setLoading(false);
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setToast({
        open: true,
        type: "warning",
        title: "Longitude error",
        message: "Please enter a valid Longitude between -180 and 180. (e.g. -0.299188)",
      });
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/stations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        // latitude: parseFloat(form.latitude),
        latitude: lat,
        // longitude: parseFloat(form.longitude),
        longitude: lng,
        powerKW: Number(form.powerKW),
        pricePerKWh: Number(form.pricePerKWh),
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/cpo/stations");
      alert("Station updated successfully");
    } else {
      router.push("/cpo/stations");
      // alert("Failed to update station");
      setToast({
        open: true,
        type: "error",
        title: "Failed Update",
        message: "Failed to update station",
      });
    }
  };

  return (
    <>
      <div className="py-6 md:pt-12 px-4 md:px-10 h-screen rounded-3xl bg-blue-50/50 backdrop-blur-sm border border-white/90 overflow-scroll">

        <div className="mb-8 ">
          {/* <span className="loading loading-spinner loading-lg text-blue-900"></span> */}

          <h1 className="text-3xl md:text-4xl font-bold text-blue-950 tracking-tight">
            Edit Station
          </h1>
          <span className=" text-xs text-slate-400">{id}</span>

        </div>

        <div className="backdrop-blur-2xl bg-white/50 border border-blue-100/40 rounded-3xl p-6 ">

          <form onSubmit={handleSubmit} className="space-y-4 text-blue-950">
            {/* Name */}
            <div>
              <label className="label text-xs">Name</label>
              <input
                type="text"
                name="name"
                required
                className="input input-sm bg-white/50 border border-none shadow w-full rounded-2xl focus:outline-0 focus:border-none"
                value={form.name}
                onChange={handleChange}
              // placeholder="Name of Station"
              />
            </div>

            {/* Description */}
            <div>
              <label className="label text-xs">Description</label>
              <textarea
                name="description"
                className="textarea textarea-sm textarea-bordered bg-white/50 border border-none shadow w-full rounded-2xl"
                value={form.description}
                onChange={handleChange}
              // placeholder="Description"
              />
            </div>

            {/* Address */}
            <div>
              <label className="label text-xs">Address</label>
              <input
                type="text"
                name="address"
                required
                className="input input-sm input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  required
                  className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-full"
                  value={form.latitude}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label text-xs">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  required
                  className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-full"
                  value={form.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Connectors */}
            <div>
              <label className="label text-xs">Connectors</label>
              <div className="flex flex-wrap gap-2">
                {CONNECTOR_OPTIONS.map((connector) => (
                  <label key={connector} className="cursor-pointer label gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-info border-0 bg-white/80"
                      checked={form.connectors.includes(connector)}
                      onChange={() => handleConnectorChange(connector)}
                    />
                    <span className="label-text text-sm text-blue-950">{connector}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Power */}
              <div>
                <label className="label text-xs">Power (kW)</label>
                <input
                  type="number"
                  name="powerKW"
                  required
                  className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
                  value={form.powerKW}
                  onChange={handleChange}
                />
              </div>

              {/* Price */}
              <div>
                <label className="label text-xs">Price per kWh</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerKWh"
                  className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
                  value={form.pricePerKWh}
                  onChange={handleChange}
                />
              </div>
              {/* Outlets */}
              <div>
                <label className="label text-xs">Outlets</label>
                <input
                  type="number"
                  name="outlets"
                  min={1}
                  className="input input-xs input-bordered bg-white/50 border border-none shadow w-full rounded-3xl"
                  value={form.outlets}
                  onChange={handleChange}
                />
              </div>
            </div>


            {/* Status */}
            <div>
              <label className="label text-xs">Availability</label>
              <select
                name="availabilityStatus"
                className="select select-sm select-bordered bg-white/50 border border-none shadow w-full rounded-3xl text-blue-950"
                value={form.availabilityStatus}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Update Button */}
            <button
              type="submit"
              className="btn btn-neutral border-none bg-blue-950 rounded-full text-white w-full"
              disabled={loading}
            >
              {loading ?
                <span className="flex justify-center items-center gap-2 font-semibold">
                  <Save size={20} className=" animate-ping" />
                  Updating...
                </span>
                : "Update"}
            </button>
          </form>

        </div>


      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>

  );
}