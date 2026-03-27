"use client";

import { Plug } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

const CONNECTOR_OPTIONS = ["Type2", "CCS", "CHAdeMO", "GB/T", "Tesla"];

export default function AddStationForm({ onSuccess }) {
    const [cpo, setCpo] = useState(null);
    const [loadingCPO, setLoadingCPO] = useState(true);

    useEffect(() => {
        async function fetchCPO() {
            const res = await fetch("/api/cpo/me");
            const data = await res.json();

            if (res.ok) {
                setCpo(data.cpo);
            }

            setLoadingCPO(false);
        }

        fetchCPO();
    }, []);


    const [form, setForm] = useState({
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleConnectorChange = (connector) => {
        setForm((prev) => {
            const exists = prev.connectors.includes(connector);
            return {
                ...prev,
                connectors: exists
                    ? prev.connectors.filter((c) => c !== connector)
                    : [...prev.connectors, connector],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                cpo: cpo._id,
                name: form.name,
                description: form.description,
                address: form.address,
                location: {
                    type: "Point",
                    coordinates: [
                        parseFloat(form.longitude),
                        parseFloat(form.latitude),
                    ],
                },
                connectors: form.connectors,
                powerKW: Number(form.powerKW),
                pricePerKWh: form.pricePerKWh
                    ? Number(form.pricePerKWh)
                    : undefined,
                outlets: form.outlets,
                availabilityStatus: form.availabilityStatus,
            };

            const res = await fetch("/api/stations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to create station");

            onSuccess?.();
            document.getElementById("addstation_modal").close();
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

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
                                className="checkbox checkbox-xs bg-white/80"
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

            {/* Create Button */}
            <button
                type="submit"
                className="btn btn-neutral border-none bg-blue-950 w-full rounded-full text-white"
                disabled={loading}
            >
                {/* {loading ? "Creating..." : "Create Station"} */}
                {loading ?
                    <span className="flex justify-center items-center gap-2 font-semibold">
                        <Plug size={20} className=" animate-ping" />
                        Creating...
                    </span>
                    : "Create Station"}
            </button>
        </form>
    );
}