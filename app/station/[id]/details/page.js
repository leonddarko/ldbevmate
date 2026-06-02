import connectDB from "@/lib/db";
import Station from "@/models/Station";
import CPO from "@/models/CPO";
import {
    Star,
    Zap,
    Plug,
    Wallet,
    Building2,
    Mail,
    Phone,
    BadgeCheck,
    EvCharger
} from "lucide-react";

export default async function StationDetailsPage({ params }) {

    const { id } = await params;

    await connectDB();

    const station = await Station.findById(id)
        .populate("cpo")
        .lean();

    if (!station) {
        return (
            <div className="p-10">
                Station not found.
            </div>
        );
    }

    return (
        <div className="
            min-h-screen
            py-24 px-6
            bg-[url(/backgroundimages/ev-charging-station_tp.JPG)]
            bg-cover bg-center bg-fixed
        ">
            <div className="max-w-4xl mx-auto space-y-5">

                {/* HERO CARD */}
                <div className="
                    backdrop-blur-xl
                    bg-white/75
                    border border-white/40
                    rounded-4xl
                    p-7
                    shadow-[0_0_30px_rgba(0,200,255,0.15)]
                ">
                    <h1 className="text-3xl md:text-4xl font-bold text-blue-950">
                        {station.name}
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        {station.address}
                    </p>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-5" />

                    <p className="text-blue-950 leading-relaxed">
                        {station.description ||
                            "No description available for this charging station."}
                    </p>
                </div>

                {/* PREMIUM BADGES */}
                <div className="flex flex-wrap gap-3">

                    <div className="
                        px-4 py-2
                        rounded-full
                        bg-white/80
                        backdrop-blur-xl
                        shadow-sm
                        flex items-center gap-2
                    ">
                        <Star
                            size={16}
                            className="text-amber-500 fill-amber-500"
                        />
                        <span className="font-medium text-blue-950">
                            {station.reviewCount > 0
                                ? station.averageRating.toFixed(1)
                                : "No Ratings"}
                        </span>

                        <span className="text-gray-500 text-sm">
                            ({station.reviewCount})
                        </span>
                    </div>

                    <div className={`
                        px-4 py-2
                        rounded-full
                        backdrop-blur-xl
                        shadow-sm
                        font-medium
                        ${station.availabilityStatus === "available"
                            ? "bg-green-100 text-green-700"
                            : station.availabilityStatus === "busy"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"}
                    `}>
                        {station.availabilityStatus}
                    </div>

                </div>

                {/* FEATURE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* CONNECTORS */}
                    <div className="
                        bg-white/75
                        backdrop-blur-xl
                        rounded-3xl
                        p-5
                        shadow-sm
                        border border-white/40
                    ">
                        <Plug
                            className="text-blue-600 mb-3"
                            size={20}
                        />

                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Connectors
                        </p>

                        <p className="font-semibold text-blue-950 mt-1">
                            {station.connectors.join(", ")}
                        </p>
                    </div>

                    {/* POWER */}
                    <div className="
                        bg-white/75
                        backdrop-blur-xl
                        rounded-3xl
                        p-5
                        shadow-sm
                        border border-white/40
                    ">
                        <Zap
                            className="text-yellow-500 mb-3"
                            size={20}
                        />

                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Power
                        </p>

                        <p className="font-bold text-2xl text-blue-950 mt-1">
                            {station.powerKW}
                        </p>

                        <p className="text-gray-500 text-sm">
                            kW Output
                        </p>
                    </div>

                    {/* OUTLETS */}
                    <div className="
                        bg-white/75
                        backdrop-blur-xl
                        rounded-3xl
                        p-5
                        shadow-sm
                        border border-white/40
                    ">
                        <EvCharger
                            className="text-blue-600 mb-3"
                            size={20}
                        />

                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Outlets
                        </p>

                        <p className="font-bold text-2xl text-blue-950 mt-1">
                            {station.outlets}
                        </p>
                    </div>

                    {/* PRICE */}
                    <div className="
                        bg-white/75
                        backdrop-blur-xl
                        rounded-3xl
                        p-5
                        shadow-sm
                        border border-white/40
                    ">
                        <Wallet
                            className="text-green-600 mb-3"
                            size={20}
                        />

                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Price
                        </p>

                        <p className="font-bold text-2xl text-blue-950 mt-1">
                            ₵{station.pricePerKWh || 0}
                        </p>

                        <p className="text-gray-500 text-sm">
                            per kWh
                        </p>
                    </div>

                </div>

                {/* OPERATOR CARD */}
                <div className="
                    backdrop-blur-xl
                    bg-white/75
                    border border-white/40
                    rounded-4xl
                    p-6
                    shadow-[0_0_25px_rgba(0,200,255,0.12)]
                ">
                    <div className="flex justify-between items-center">

                        <div className="flex items-center gap-3">
                            <Building2
                                size={24}
                                className="text-blue-700"
                            />

                            <div>
                                <h2 className="font-bold text-xl text-blue-950">
                                    {station.cpo?.companyName}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Charging Point Operator
                                </p>
                            </div>
                        </div>

                        {station.cpo?.verified && (
                            <div className="
                                flex items-center gap-2
                                px-3 py-1.5
                                rounded-full
                                bg-green-100
                                text-green-700
                                text-sm
                                font-medium
                            ">
                                <BadgeCheck size={16} />
                                Verified
                            </div>
                        )}

                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">

                        <div className="
                            bg-white/60
                            rounded-2xl
                            p-4
                        ">
                            <div className="flex items-center gap-2 mb-1 text-blue-950">
                                <Mail size={16} />
                                <span className="font-medium">
                                    Email
                                </span>
                            </div>

                            <p className="text-gray-600">
                                {station.cpo?.contactEmail || "Not provided"}
                            </p>
                        </div>

                        <div className="
                            bg-white/60
                            rounded-2xl
                            p-4
                        ">
                            <div className="flex items-center gap-2 mb-1 text-blue-950">
                                <Phone size={16} />
                                <span className="font-medium">
                                    Phone
                                </span>
                            </div>

                            <p className="text-gray-600">
                                {station.cpo?.contactPhone || "Not provided"}
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}