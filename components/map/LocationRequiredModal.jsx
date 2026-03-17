import { RotateCw } from "lucide-react";

export default function LocationRequiredModal({
    open,
    message,
    onRetry,
}) {
    if (!open) return null;

    return (
        <div className="modal modal-open z-10001">
            <div
                className="
                modal-box 
                relative
                bg-white/20
                backdrop-blur-md
                border border-white/30
                shadow-2xl
                rounded-3xl
                text-black
                overflow-hidden
        "
            >
                {/* Gradient Glow Layer */}
                <div className="absolute inset-0 bg-white/20 border border-white/30 backdrop-blur-2xl pointer-events-none rounded-3xl shadow-2xl" />

                <div className="relative z-10 text-left space-y-4">
                    <h3 className="text-2xl font-bold tracking-wide leading-2">
                        Location Required
                    </h3>

                    <p className="text-black/70 text-sm">
                        {message}
                    </p>

                    <div className="mt-4">
                        <button
                            onClick={onRetry}
                            className="
                            w-full
                            py-2
                            rounded-full 
                            border-none
                            bg-blue-800/80 hover:bg-blue-900
                            transition-all 
                            duration-200
                            text-white
                            cursor-pointer
                            flex justify-center items-center gap-2
              "
                        >
                            <RotateCw size={20} />
                            Retry Location
                        </button>
                    </div>
                </div>
            </div>

            {/* Dark Blurred Backdrop */}
            <div className="modal-backdrop backdrop-blur-md bg-white/5"></div>
        </div>
    );
}