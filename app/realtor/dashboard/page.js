"use client";

import { useState, useEffect } from "react";

import {
    BadgeCheck,
    BadgeX,
    Building2,
    House,
    MapPin,
    Star,
} from "lucide-react";

export default function RealtorDashboardPage() {

    const [realtor, setRealtor] = useState(null);

    const [properties, setProperties] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRealtor() {
            try {
                const res = await fetch("/api/realtor/me");
                const data = await res.json();
                if (res.ok) {
                    setRealtor(data.realtor);
                    setProperties(data.properties || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchRealtor();
    }, []);

    return (
        <div
            className="
                py-6 md:pt-12
                px-4 md:px-10
                h-screen
                rounded-2xl
                bg-blue-50/50
                backdrop-blur-sm
                border border-white/20
                overflow-scroll
            "
        >

            {/* Header */}
            <div
                className="
                    flex flex-wrap
                    justify-between
                    items-center
                    gap-3
                    mb-8
                "
            >

                {loading && (
                    <span
                        className="
                            loading
                            loading-spinner
                            loading-lg
                            text-blue-900
                        "
                    ></span>
                )}

                {realtor && (
                    <div>

                        <div
                            className="
                                flex items-center
                                gap-2 mb-1
                            "
                        >

                            <h1
                                className="
                                    text-3xl md:text-4xl
                                    font-bold
                                    text-blue-950
                                    tracking-tight
                                "
                            >
                                {realtor?.agencyName}
                            </h1>

                            {realtor?.verified ? (
                                <BadgeCheck
                                    size={20}
                                    className="text-green-700"
                                />
                            ) : (
                                <BadgeX
                                    size={20}
                                    className="text-amber-700"
                                />
                            )}

                        </div>

                        <div
                            className="
                                flex items-center
                                gap-2
                                text-sm
                                text-blue-900/70
                            "
                        >

                            <MapPin size={15} />

                            <span>
                                {realtor?.location?.city}
                                {realtor?.location?.region &&
                                    `, ${realtor.location.region}`}
                            </span>

                        </div>

                    </div>
                )}

            </div>

            {/* Stats */}
            <div
                className="
                    grid grid-cols-1
                    md:grid-cols-3
                    gap-6
                "
            >

                {/* {loading && (
                    <span
                        className="
                            loading
                            loading-spinner
                            loading-lg
                            text-blue-950
                        "
                    ></span>
                )} */}

                {/* Total Properties */}
                <div
                    className="
                        relative p-6 rounded-2xl
                        bg-linear-to-br
                        from-white/80
                        to-blue-100/90
                        backdrop-blur-lg
                        shadow-sm
                        hover:shadow-[0_5px_15px_rgba(0,0,0,0.08)]
                        transition-all duration-300
                    "
                >

                    <div
                        className="
                            flex items-center
                            justify-between
                        "
                    >

                        <h2
                            className="
                                text-xs
                                font-medium
                                text-blue-900/70
                            "
                        >
                            Total Properties
                        </h2>

                        <House
                            size={18}
                            className="text-blue-950"
                        />

                    </div>

                    <p
                        className="
                            text-5xl mt-3
                            font-bold
                            text-blue-950
                            tracking-tight
                        "
                    >
                        {properties?.length || 0}
                    </p>

                </div>

                {/* Rating */}
                <div
                    className="
                        relative p-6 rounded-2xl
                        bg-linear-to-br
                        from-white/80
                        to-amber-100/90
                        backdrop-blur-lg
                        shadow-sm
                        hover:shadow-[0_5px_15px_rgba(0,0,0,0.08)]
                        transition-all duration-300
                    "
                >

                    <div
                        className="
                            flex items-center
                            justify-between
                        "
                    >

                        <h2
                            className="
                                text-xs
                                font-medium
                                text-blue-900/70
                            "
                        >
                            Average Rating
                        </h2>

                        <Star
                            size={18}
                            className="text-amber-700"
                        />

                    </div>

                    <p
                        className="
                            text-5xl mt-3
                            font-bold
                            text-blue-950
                            tracking-tight
                        "
                    >
                        {realtor?.ratingsAverage || 0}
                    </p>

                </div>

                {/* Verification */}
                <div
                    className="
                        relative p-6 rounded-2xl
                        bg-linear-to-br
                        from-white/80
                        to-cyan-100/90
                        backdrop-blur-lg
                        shadow-sm
                        hover:shadow-[0_5px_15px_rgba(0,0,0,0.08)]
                        transition-all duration-300
                    "
                >

                    <div
                        className="
                            flex items-center
                            justify-between
                        "
                    >

                        <h2
                            className="
                                text-xs
                                font-medium
                                text-blue-900/70
                            "
                        >
                            Verification Status
                        </h2>

                        <Building2
                            size={18}
                            className="text-cyan-800"
                        />

                    </div>

                    <p
                        className="
                            text-3xl mt-5
                            font-bold
                            tracking-tight
                        "
                    >
                        {realtor?.verified
                            ? (
                                <span className="text-green-700">
                                    Verified
                                </span>
                            )
                            : (
                                <span className="text-amber-700">
                                    Pending
                                </span>
                            )}
                    </p>

                </div>
            </div>

            {/* Bio */}
            {realtor?.bio && (
                <div
                    className="
                        mt-8 p-6
                        rounded-2xl
                        bg-white/70
                        border border-white/40
                        shadow-sm
                    "
                >

                    <h2
                        className="
                            text-lg
                            font-bold
                            text-blue-950
                            mb-3 leading-relaxed
                        "
                    >
                        About
                    </h2>

                    <p
                        className="
                            text-sm
                            leading-relaxed
                            text-blue-900/80
                        "
                    >
                        {realtor.bio}
                    </p>

                </div>
            )}

        </div>
    );
}