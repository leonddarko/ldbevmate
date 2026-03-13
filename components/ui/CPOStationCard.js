"use client"

import { Delete, MapPin, Pencil, Trash } from "lucide-react";

export default function CPOStationCard({ Stations }) {
    return (<>
        {Stations.length === 0 ? (
            <div className="backdrop-blur-2xl bg-blue-100/40 border border-blue-100/50 rounded-3xl p-6">
                <p className="text-xs">No stations yet.</p>
            </div>
        ) : (
            <div className="grid gap-4">

                {Stations.map((station) => (
                    <div
                        key={station._id}
                        className="
                        backdrop-blur-2xl
                        bg-white/40
                        border border-white/40
                        rounded-2xl
                        p-5
                        shadow-sm
                        flex justify-between items-center gap-5
    "
                    >
                        {/* Station Info */}
                        <div>
                            <h2 className="text-lg font-bold text-blue-950">
                                {station.name}
                            </h2>

                            <p className="text-sm text-blue-950/80">
                                {station.address}
                            </p>

                            <p className="text-xs mt-1 text-gray-500">
                                <span className=" font-bold">{station.powerKW} kW </span>
                                •
                                <span> {station.connectors.join(", ")}</span>
                            </p>

                            {station.availabilityStatus === "available" && (
                                <div className="text-xs mt-1">
                                    <span className="text-gray-500">
                                        Status :
                                    </span>
                                    &nbsp;
                                    <span className="text-green-800 font-bold">
                                        {station.availabilityStatus}
                                    </span>
                                </div>
                            )}

                            {/* <div className="text-xs text-gray-500">
                                ⭐ {station.averageRating} ({station.reviewCount})
                            </div> */}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row gap-2">

                            {/* <a
                                href={`/?station=${station._id}`}
                                className="btn btn-xs backdrop-blur-xl bg-blue-500/10 border border-blue-100/20 shadow-sm text-blue-950 rounded-full
                                flex justify-between
                                "
                            >
                                <MapPin size={15} />
                                <span>
                                    View Map
                                </span>
                            </a> */}

                            <a
                                href={`/cpo/stations/${station._id}/edit`}
                                className="btn btn-xs bg-blue-900 text-white border-none rounded-full
                                shadow flex justify-between
                                "
                            >
                                <Pencil size={13} />
                                <span>
                                    Edit
                                </span>
                            </a>


                            <button
                                className="btn btn-xs bg-red-700 text-white border-none rounded-full shadow flex justify-between"
                                onClick={async () => {
                                    if (!confirm("Delete this station?")) return;

                                    await fetch(`/api/stations/${station._id}`, {
                                        method: "DELETE",
                                    });

                                    window.location.reload();
                                }}
                            >
                                <Trash size={13} />
                                <span>
                                    Del
                                </span>
                            </button>

                        </div>

                    </div>
                ))}

            </div>
        )}
    </>)
}