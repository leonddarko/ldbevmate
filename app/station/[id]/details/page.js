import connectDB from "@/lib/db";
import Station from "@/models/Station";
import CPO from "@/models/CPO";
import StationImageCarousel from "@/components/ui/StationImageCarousel";
import {
    Star,
    Zap,
    Plug,
    Wallet,
    Building2,
    Mail,
    Phone,
    BadgeCheck,
    EvCharger,
    MapPin
} from "lucide-react";

export default async function StationDetailsPage({ params }) {

    const { id } = await params;

    await connectDB();

    const station = await Station.findById(id)
        .populate("cpo")
        .lean();

    if (!station) {
        return (
            <div className="min-h-screen flex items-center justify-center p-10 bg-blue-50/50">
                <div className="text-center p-8 bg-white shadow-xl rounded-3xl border border-gray-100 max-w-sm">
                    <p className="text-lg font-bold text-blue-950">Station Not Found</p>
                    <p className="text-sm text-gray-500 mt-1">The charging hub you are looking for does not exist or has been relocated.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="
            min-h-screen
            py-24 px-4 sm:px-6
            bg-[url(/backgroundimages/ev-charging-station_tp.JPG)]
            bg-cover bg-center bg-fixed
        ">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

                {/* PREMIUM HERO CONTAINER */}
                <div className="
                    backdrop-blur-2xl
                    bg-white/80
                    border border-white/50
                    rounded-[2.5rem]
                    overflow-hidden
                    shadow-[0_20px_50px_rgba(0,180,255,0.15)]
                ">
                    {/* Render extracted Carousel with custom non-touch controls */}
                    <StationImageCarousel 
                        images={station.images} 
                        stationName={station.name} 
                    />

                    {/* HERO INFORMATION BODY */}
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-blue-950">
                                    {station.name}
                                </h1>
                                <p className="text-sm text-gray-500/90 flex items-center gap-1.5 mt-2">
                                    <MapPin size={15} className="text-blue-600 shrink-0" />
                                    <span>{station.address}</span>
                                </p>
                            </div>

                            {/* Info Status Floating Pill */}
                            <div className="shrink-0">
                                {station.availabilityStatus === "available" && (
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm capitalize tracking-wide">
                                        ● {station.availabilityStatus}
                                    </span>
                                )}
                                {station.availabilityStatus === "busy" && (
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm capitalize tracking-wide">
                                        ● {station.availabilityStatus}
                                    </span>
                                )}
                                {station.availabilityStatus === "offline" && (
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm capitalize tracking-wide">
                                        ● {station.availabilityStatus}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-950/10 to-transparent my-6" />

                        <p className="text-blue-950/90 leading-relaxed font-medium text-base">
                            {station.description ||
                                "Welcome to our premium charging destination. Enjoy lightning-fast infrastructure engineered for safety and efficiency."}
                        </p>
                    </div>
                </div>

                {/* PREMIUM SUMMARY METRICS OVERVIEW */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="
                        px-4 py-2.5
                        rounded-2xl
                        bg-white/85
                        backdrop-blur-xl
                        border border-white/40
                        shadow-sm
                        flex items-center gap-2
                    ">
                        <Star
                            size={16}
                            className="text-amber-500 fill-amber-500"
                        />
                        <span className="font-bold text-blue-950 text-sm">
                            {station.reviewCount > 0
                                ? station.averageRating.toFixed(1)
                                : "No Ratings"}
                        </span>
                        <span className="text-gray-400 text-xs font-semibold">
                            ({station.reviewCount} reviews)
                        </span>
                    </div>
                </div>

                {/* TECH DETAIL SUMMARY GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* CONNECTORS BLOCK */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/50 flex flex-col justify-between">
                        <div>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100/50">
                                <Plug size={18} />
                            </div>
                            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Supported Plugs</p>
                        </div>
                        <p className="font-black text-blue-950 text-sm mt-2 break-words leading-tight">
                            {station.connectors && station.connectors.length > 0 ? station.connectors.join(", ") : "Standard"}
                        </p>
                    </div>

                    {/* POWER OUTPUT BLOCK */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/50">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4 border border-amber-100/50">
                            <Zap size={18} />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Charging Power</p>
                        <p className="font-black text-2xl text-blue-950 mt-1.5 tracking-tight">
                            {station.powerKW} <span className="text-xs font-bold text-gray-400">kW</span>
                        </p>
                    </div>

                    {/* OUTLETS COUNT BLOCK */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/50">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100/50">
                            <EvCharger size={18} />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Available Hubs</p>
                        <p className="font-black text-2xl text-blue-950 mt-1.5 tracking-tight">
                            {station.outlets || 0} <span className="text-xs font-bold text-gray-400">Bays</span>
                        </p>
                    </div>

                    {/* PRICING SCHEME BLOCK */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/50">
                        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4 border border-green-100/50">
                            <Wallet size={18} />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Pricing Metric</p>
                        <p className="font-black text-2xl text-blue-950 mt-1.5 tracking-tight">
                            ₵{station.pricePerKWh || 0} <span className="text-xs font-bold text-gray-400">/kWh</span>
                        </p>
                    </div>
                </div>

                {/* OPERATOR INFO DISPLAY */}
                <div className="
                    backdrop-blur-xl
                    bg-white/80
                    border border-white/50
                    rounded-[2rem]
                    p-6
                    shadow-[0_15px_35px_rgba(0,180,255,0.08)]
                ">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 bg-blue-950 text-white rounded-2xl flex items-center justify-center shadow-inner">
                                <Building2 size={22} />
                            </div>
                            <div>
                                <h2 className="font-black text-xl text-blue-950 tracking-tight">
                                    {station.cpo?.companyName || "Independent Host"}
                                </h2>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                                    Charge Point Operator Network
                                </p>
                            </div>
                        </div>

                        {station.cpo?.verified && (
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold tracking-wide w-fit">
                                <BadgeCheck size={15} />
                                Verified Provider
                            </div>
                        )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-6 border-t border-blue-950/5 pt-5">
                        <div className="bg-blue-50/20 border border-blue-950/5 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-1.5 text-blue-950">
                                <Mail size={15} className="text-blue-600" />
                                <span className="font-bold text-xs uppercase tracking-wide text-gray-400">Support Email</span>
                            </div>
                            <p className="text-sm font-bold text-blue-950">
                                {station.cpo?.contactEmail || "Not provided"}
                            </p>
                        </div>

                        <div className="bg-blue-50/20 border border-blue-950/5 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-1.5 text-blue-950">
                                <Phone size={15} className="text-blue-600" />
                                <span className="font-bold text-xs uppercase tracking-wide text-gray-400">Helpline Phone</span>
                            </div>
                            <p className="text-sm font-bold text-blue-950">
                                {station.cpo?.contactPhone || "Not provided"}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}