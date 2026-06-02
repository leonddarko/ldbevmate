"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash } from "lucide-react";
import Link from "next/link";


export default function AdminStationsPage() {
    const [stations, setStations] = useState([])
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        async function fetchStations() {
            const res = await fetch("/api/stations");
            const data = await res.json();

            if (res.ok) {
                setStations(data);
            }

            setLoading(false);
        }
        fetchStations();
    }, []);

    const deleteStation = async (id) => {
        const confirmDelete = confirm("Delete this station?");
        if (!confirmDelete) return;

        await fetch(`/api/stations/${id}`, {
            method: "DELETE",
        });

        setStations((prev) => prev.filter((s) => s._id !== id));
    };


    if (loading) return (
        <div className="h-screen flex justify-center items-center gap-1.5 bg-[url(/backgroundimages/ev-charging-station_tp.JPG)] bg-cover bg-center bg-no-repeat bg-fixed text-blue-900">
            <span className="loading loading-spinner loading-lg "></span>
            <p className="p-6">Loading...</p>
        </div>
    );

    return (
        <>
            <div className="h-screen flex flex-col justify-center items-center py-12 px-6 md:py-24 md:px-12 bg-[url(/backgroundimages/ev-charging-station_tp.JPG)] bg-cover bg-center bg-no-repeat bg-fixed">
                <h1 className="text-xl font-bold mb-4 text-blue-950">Manage Stations</h1>

                <Link href="/admin">
                    <button
                        className="btn btn-xs bg-blue-950 text-white border-none rounded-full shadow flex justify-between mt-4"
                    >
                        <span
                            type="submit"
                            className="flex justify-center items-center gap-2 font-semibold">
                            <ArrowLeft size={13} />
                            Back
                        </span>

                    </button>
                </Link>

                <div className=" h-3/3 rounded-3xl overflow-y-auto p-4 mt-4 shadow bg-white">
                    <div className="space-y-3 md:min-w-3xl">
                        {stations.reverse().map((station) => (
                            <div
                                key={station._id}
                                className="flex justify-between items-center bg-blue-100/20 backdrop-blur-md p-4 rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 text-blue-950"
                            >
                                <div>
                                    <h2 className="font-semibold">{station.name}</h2>
                                    <p className="text-sm opacity-70">
                                        {station.powerKW}kW • ₵{station.pricePerKWh}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-xs bg-blue-900 text-white border-none rounded-full
                                shadow flex justify-between
                                "
                                        onClick={() => router.push(`/cpo/stations/${station._id}/edit`)}>
                                        <Pencil size={13} />
                                        <span>
                                            Edit
                                        </span>
                                    </button>

                                    <button
                                        className="btn btn-xs bg-red-700 text-white border-none rounded-full shadow flex justify-between"
                                        onClick={() => deleteStation(station._id)}>
                                        <Trash size={13} />
                                        <span>
                                            Del
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}