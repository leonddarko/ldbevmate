"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function BottomSheet({ station, onClose }) {
    return (
        <AnimatePresence>
            {station && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black z-[900]"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 300 }}
                        onDragEnd={(e, info) => {
                            if (info.offset.y > 120) onClose();
                        }}
                        className="absolute bottom-0 left-0 right-0 
                       bg-white/20 backdrop-blur-3xl 
                       border-t border-white/30 
                       rounded-t-3xl 
                       z-[1000] 
                       p-6 text-black"
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-black/40 rounded-full mx-auto mb-4" />

                        <h2 className="text-xl font-semibold">
                            {station.name}
                        </h2>

                        <div className="mt-3 flex justify-between text-sm opacity-80">
                            <span>{station.powerKW} kW</span>
                            <span>₵{station.pricePerKWh}.00/kWh</span>
                        </div>

                        <div className="mt-2 text-sm">
                            Connectors: {station.connectors.join(", ")}
                        </div>

                        <div className="mt-3 text-sm">
                            ⭐ {station.rating}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}