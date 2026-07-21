"use client"

import { MapPin, Pencil, Trash, Plug } from "lucide-react";
import Image from "next/image"; // Alternatively, use standard <img> if not using Next.js Image optimization

export default function CPOStationCard({ Stations }) {
    return (
        <>
            {Stations.length === 0 ? (
                <div className="backdrop-blur-2xl bg-blue-100/40 border border-blue-100/50 rounded-3xl p-6 text-center">
                    <p className="text-sm font-medium text-blue-950/60">No stations yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {Stations.map((station) => {
                        // Check if station has any images, pick the first one as the premium thumbnail
                        const hasImages = station.images && station.images.length > 0;
                        const mainImage = hasImages ? station.images[0] : null;

                        return (
                            <div
                                key={station._id}
                                className="
                                    backdrop-blur-2xl
                                    bg-white/90
                                    border border-white/50
                                    rounded-3xl
                                    p-4
                                    sm:p-5
                                    shadow-md hover:shadow-lg
                                    transition-all duration-300
                                    flex flex-col sm:flex-row items-stretch gap-6
                                "
                            >
                                {/* Left Side Image Container */}
                                <div className="relative w-full sm:w-44 h-40 sm:h-auto rounded-2xl overflow-hidden bg-blue-950/5 flex-shrink-0 border border-black/5 shadow-inner">
                                    {mainImage ? (
                                        <img
                                            src={mainImage}
                                            alt={station.name}
                                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-blue-950/30 gap-1">
                                            <Plug size={32} strokeWidth={1.5} />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold">No Preview</span>
                                        </div>
                                    )}

                                    {/* Premium Total Count Badge */}
                                    {station.images && station.images.length > 1 && (
                                        <div className="absolute bottom-2 right-2 backdrop-blur-md bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                            +{station.images.length - 1} More
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Info & Actions Group */}
                                <div className="flex flex-col justify-between flex-grow gap-4">
                                    {/* Station Header & Badges */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                        <div>
                                            <h2 className="text-xl font-black tracking-tight text-blue-950">
                                                {station.name}
                                            </h2>
                                            <p className="text-sm text-blue-950/70 flex items-center gap-1 mt-0.5">
                                                <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                                                <span>{station.address}</span>
                                            </p>
                                        </div>

                                        {/* Status Tag */}
                                        <div>
                                            {station.availabilityStatus === "available" ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm border border-green-200 capitalize">
                                                    ● {station.availabilityStatus}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 shadow-sm border border-amber-200 capitalize">
                                                    ● {station.availabilityStatus || 'Offline'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tech Details Section */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border-t border-blue-950/5 pt-3">
                                        <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-2">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Power Output</p>
                                            <p className="text-sm font-black text-blue-950">{station.powerKW} kW</p>
                                        </div>
                                        <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-2 col-span-1">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Outlets Available</p>
                                            <p className="text-sm font-black text-blue-950">{station.outlets || 0} Plugs</p>
                                        </div>
                                        <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-2 col-span-2 md:col-span-1">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Connectors</p>
                                            <p className="text-xs font-bold text-blue-950/80 truncate">
                                                {station.connectors?.join(", ") || "None"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions Buttons Container */}
                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-blue-950/5 sm:border-t-0 sm:pt-0">
                                        <a
                                            href={`/cpo/stations/${station._id}/edit`}
                                            className="btn btn-xs sm:btn-sm bg-blue-950 hover:bg-blue-900 text-white border-none rounded-xl shadow-sm px-4 flex items-center gap-1.5 normal-case font-bold tracking-wide transition-colors duration-200"
                                        >
                                            <Pencil size={13} />
                                            <span>Edit</span>
                                        </a>

                                        <button
                                            className="btn btn-xs sm:btn-sm bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl shadow-sm px-4 flex items-center gap-1.5 normal-case font-bold transition-colors duration-200"
                                            onClick={async () => {
                                                if (!confirm("Delete this station?")) return;

                                                await fetch(`/api/stations/${station._id}`, {
                                                    method: "DELETE",
                                                    // Make sure to clean up storage images here if desired on the backend
                                                });

                                                window.location.reload();
                                            }}
                                        >
                                            <Trash size={13} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}