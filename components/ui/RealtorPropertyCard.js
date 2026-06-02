"use client";

import { Pencil, Trash, MapPin, Home } from "lucide-react";

export default function RealtorPropertyCard({ Properties }) {

    return (
        <>
            {Properties.length === 0 ? (
                <div
                    className="
                        backdrop-blur-2xl
                        bg-blue-100/40
                        border border-blue-100/50
                        rounded-3xl
                        p-6
                    "
                >
                    <p className="text-xs">
                        No properties yet.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">

                    {Properties.map((property) => (
                        <div
                            key={property._id}
                            className="
                                backdrop-blur-2xl
                                bg-white/80
                                border border-white/40
                                rounded-2xl
                                p-5
                                shadow-sm
                                flex justify-between
                                items-center gap-5
                            "
                        >

                            {/* Property Info */}
                            <div>

                                <h2 className="text-lg font-bold text-blue-950">
                                    {property.title}
                                </h2>

                                <p className="text-sm text-blue-950/80 flex items-center gap-1">
                                    <MapPin size={14} />
                                    {property.address}
                                </p>

                                <p className="text-xs mt-1 text-gray-500">
                                    <span className="font-bold">
                                        {property.type}
                                    </span>
                                    {" • "}
                                    <span>
                                        {property.listingType}
                                    </span>
                                </p>

                                <p className="text-xs mt-1 text-gray-500">
                                    <span className="font-bold text-blue-950">
                                        GHC {property.price}
                                    </span>
                                </p>

                                {(property.bedrooms ||
                                    property.bathrooms ||
                                    property.area) && (
                                    <p className="text-xs mt-1 text-gray-500">
                                        {property.bedrooms && (
                                            <span>
                                                🛏 {property.bedrooms}
                                            </span>
                                        )}

                                        {property.bathrooms && (
                                            <span>
                                                {" "} • 🚿 {property.bathrooms}
                                            </span>
                                        )}

                                        {property.area && (
                                            <span>
                                                {" "} • 📐 {property.area} sqm
                                            </span>
                                        )}
                                    </p>
                                )}

                                {property.featured && (
                                    <div className="text-xs mt-2 text-amber-700 font-bold">
                                        ★ Featured
                                    </div>
                                )}

                            </div>

                            {/* Actions */}
                            <div className="flex flex-col md:flex-row gap-2">

                                {/* Edit */}
                                <a
                                    href={`/realtor/properties/${property._id}/edit`}
                                    className="
                                        btn btn-xs
                                        bg-blue-900
                                        text-white
                                        border-none
                                        rounded-full
                                        shadow
                                        flex items-center gap-1
                                    "
                                >
                                    <Pencil size={13} />
                                    Edit
                                </a>

                                {/* Delete */}
                                <button
                                    className="
                                        btn btn-xs
                                        bg-red-700
                                        text-white
                                        border-none
                                        rounded-full
                                        shadow
                                        flex items-center gap-1
                                    "
                                    onClick={async () => {

                                        if (
                                            !confirm(
                                                "Delete this property?"
                                            )
                                        )
                                            return;

                                        await fetch(
                                            `/api/properties/${property._id}`,
                                            {
                                                method: "DELETE",
                                            }
                                        );

                                        window.location.reload();
                                    }}
                                >
                                    <Trash size={13} />
                                    Del
                                </button>

                            </div>

                        </div>
                    ))}

                </div>
            )}
        </>
    );
}