"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export default function StationImageCarousel({ images, stationName }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef(null);

    const hasImages = images && images.length > 0;

    if (!hasImages) {
        return (
            <div className="w-full h-48 md:h-64 flex flex-col items-center justify-center text-blue-950/20 bg-blue-50/40 border-b border-white/40 gap-2">
                <ImageIcon size={44} strokeWidth={1.2} />
                <span className="text-[11px] uppercase font-black tracking-widest">No Gallery Images Uploaded</span>
            </div>
        );
    }

    const scrollToImage = (index) => {
        if (!scrollContainerRef.current) return;
        
        const container = scrollContainerRef.current;
        const width = container.clientWidth;
        
        container.scrollTo({
            left: width * index,
            behavior: "smooth"
        });
        setCurrentIndex(index);
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % images.length;
        scrollToImage(nextIndex);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        scrollToImage(prevIndex);
    };

    // Keep track of manual swipe gestures on mobile/touch screens
    const handleScroll = (e) => {
        const container = e.currentTarget;
        const scrollLeft = container.scrollLeft;
        const width = container.clientWidth;
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
            setCurrentIndex(newIndex);
        }
    };

    return (
        <div className="relative w-full bg-black/5 border-b border-white/40 group">
            {/* Widescreen Scroll-Snap Frame */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none h-64 md:h-96 auto-cols-max select-none"
            >
                {images.map((imgUrl, idx) => (
                    <div 
                        key={idx} 
                        className="w-full h-full flex-shrink-0 snap-center relative"
                    >
                        <img 
                            src={imgUrl} 
                            alt={`${stationName} View ${idx + 1}`} 
                            className="w-full h-full object-cover pointer-events-none"
                        />
                    </div>
                ))}
            </div>

            {/* Desktop Navigation Buttons (Visible on desktop hover) */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-md bg-white/70 hover:bg-white border border-white/40 shadow-lg flex items-center justify-center text-blue-950 transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                        aria-label="Previous Image"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-md bg-white/70 hover:bg-white border border-white/40 shadow-lg flex items-center justify-center text-blue-950 transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                        aria-label="Next Image"
                    >
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </button>
                </>
            )}

            {/* Premium Pagination Indicator Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 backdrop-blur-md bg-black/30 border border-white/10 px-3 py-1.5 rounded-full shadow-sm">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => scrollToImage(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* View Count Pill */}
            <div className="absolute bottom-4 right-4 backdrop-blur-md bg-black/60 border border-white/10 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                {currentIndex + 1} of {images.length}
            </div>
        </div>
    );
}