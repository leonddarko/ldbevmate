"use client";

import { useState, useEffect } from "react";
import { RotateCw, Smartphone, Globe, RefreshCw } from "lucide-react";

export default function LocationRequiredModal({ open, message, onRetry }) {
    const [deviceOS, setDeviceOS] = useState("ios"); // "ios" | "android"

    useEffect(() => {
        if (typeof window !== "undefined") {
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            if (/android/i.test(ua)) {
                setDeviceOS("android");
            } else if (/iPad|iPhone|iPod|Macintosh/i.test(ua)) {
                setDeviceOS("ios");
            }
        }
    }, []);

    if (!open) return null;

    const toggleOS = () => {
        setDeviceOS((prev) => (prev === "ios" ? "android" : "ios"));
    };

    return (
        <div className="modal modal-open z-[10001] p-4 flex items-center justify-center">
            <div className="
                modal-box 
                relative
                max-w-lg
                w-full
                bg-white/30
                backdrop-blur-2xl
                border border-white/40
                shadow-2xl
                rounded-3xl
                text-black
                overflow-hidden
                p-6
                space-y-4
            ">
                {/* Header */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-wide text-blue-950">
                            Location Required
                        </h3>
                        <button
                            onClick={toggleOS}
                            className="text-[11px] font-bold bg-white/60 hover:bg-white text-blue-950 border border-white/50 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                        >
                            <RefreshCw size={12} />
                            Switch to {deviceOS === "ios" ? "Android" : "Apple"}
                        </button>
                    </div>
                    <p className="text-black/80 text-sm font-medium">
                        {message || "Please enable location to find stations near you."}
                    </p>
                </div>

                {/* Auto-Detected Badge */}
                <div className="text-[11px] font-bold text-blue-950/70 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center justify-between">
                    <span>Instructions for: <strong className="text-blue-950 uppercase">{deviceOS === "ios" ? "Apple (iOS)" : "Android"}</strong></span>
                </div>

                {/* Dynamic Instructions List */}
                <div className="space-y-3.5 bg-white/40 rounded-2xl p-4 border border-white/50 text-xs">
                    {deviceOS === "ios" ? (
                        <>
                            {/* Step 1: System */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                                    <Smartphone size={15} />
                                    <span>1. iPhone Settings</span>
                                </div>
                                <p className="text-black/70 pl-5 leading-relaxed">
                                    Open <span className="font-bold">Settings</span> &gt; <span className="font-bold">Privacy & Security</span> &gt; <span className="font-bold">Location Services</span> &gt; Turn <span className="font-bold text-green-700">ON</span>.
                                </p>
                            </div>

                            <hr className="border-white/40" />

                            {/* Step 2: Browser */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                                    <Globe size={15} />
                                    <span>2. Safari / Chrome Permission</span>
                                </div>
                                <p className="text-black/70 pl-5 leading-relaxed">
                                    In Safari, tap <span className="font-bold">AA</span> in the URL bar &gt; <span className="font-bold">Website Settings</span> &gt; <span className="font-bold">Location</span> &gt; <span className="font-bold text-green-700">Allow</span>.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Step 1: System */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                                    <Smartphone size={15} />
                                    <span>1. Android Settings</span>
                                </div>
                                <p className="text-black/70 pl-5 leading-relaxed">
                                    Open <span className="font-bold">Settings</span> &gt; <span className="font-bold">Location</span> &gt; Enable <span className="font-bold text-green-700">"Use location"</span>.
                                </p>
                            </div>

                            <hr className="border-white/40" />

                            {/* Step 2: Browser */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                                    <Globe size={15} />
                                    <span>2. Chrome / Browser Permission</span>
                                </div>
                                <p className="text-black/70 pl-5 leading-relaxed">
                                    Tap <span className="font-bold">Lock 🔒</span> or <span className="font-bold">3 dots ⋮</span> next to URL &gt; <span className="font-bold">Permissions</span> &gt; <span className="font-bold">Location</span> &gt; <span className="font-bold text-green-700">Allow</span>.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Retry Button */}
                <div>
                    <button
                        onClick={onRetry}
                        className="
                            w-full
                            py-3
                            rounded-2xl 
                            border-none
                            bg-blue-900/90 hover:bg-blue-950
                            transition-all 
                            duration-200
                            text-white
                            font-bold
                            cursor-pointer
                            flex justify-center items-center gap-2
                            shadow-lg
                        "
                    >
                        <RotateCw size={18} />
                        Retry Location Access
                    </button>
                </div>
            </div>

            {/* Dark Blurred Backdrop */}
            <div className="modal-backdrop backdrop-blur-md bg-black/20" />
        </div>
    );
}


// import { RotateCw } from "lucide-react";

// export default function LocationRequiredModal({
//     open,
//     message,
//     onRetry,
// }) {
//     if (!open) return null;

//     return (
//         <div className="modal modal-open z-10001">
//             <div
//                 className="
//                 modal-box
//                 relative
//                 bg-white/20
//                 backdrop-blur-md
//                 border border-white/30
//                 shadow-2xl
//                 rounded-3xl
//                 text-black
//                 overflow-hidden
//         "
//             >
//                 {/* Gradient Glow Layer */}
//                 <div className="absolute inset-0 bg-white/20 border border-white/30 backdrop-blur-2xl pointer-events-none rounded-3xl shadow-2xl" />

//                 <div className="relative z-10 text-left space-y-4">
//                     <h3 className="text-2xl font-bold tracking-wide leading-2">
//                         Location Required
//                     </h3>

//                     <p className="text-black/70 text-sm">
//                         {message}
//                     </p>

//                     <div className="mt-4">
//                         <button
//                             onClick={onRetry}
//                             className="
//                             w-full
//                             py-2
//                             rounded-full
//                             border-none
//                             bg-blue-800/80 hover:bg-blue-900
//                             transition-all
//                             duration-200
//                             text-white
//                             cursor-pointer
//                             flex justify-center items-center gap-2
//               "
//                         >
//                             <RotateCw size={20} />
//                             Retry Location
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Dark Blurred Backdrop */}
//             <div className="modal-backdrop backdrop-blur-md bg-white/5"></div>
//         </div>
//     );
// }