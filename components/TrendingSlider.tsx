"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import type { JikanAnime } from "@/lib/anime";
import { getEnglishTitle } from "@/lib/anime";

interface TrendingSliderProps {
    anime: JikanAnime[];
}

export default function TrendingSlider({ anime }: TrendingSliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isPaused) return;

        let scrollAmount = 1;
        const maxScroll = scrollContainer.scrollWidth / 2;

        const interval = setInterval(() => {
            if (scrollContainer.scrollLeft >= maxScroll) {
                scrollContainer.scrollLeft = 0;
            } else {
                scrollContainer.scrollLeft += scrollAmount;
            }
        }, 30);

        return () => clearInterval(interval);
    }, [isPaused]);

    const handleScroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "right" ? scrollAmount : -scrollAmount,
                behavior: "smooth",
            });
        }
    };

    // Duplicate the anime list for infinite scroll effect
    const duplicatedAnime = [...anime, ...anime, ...anime];

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Navigation Buttons */}
            <button
                onClick={() => handleScroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-primary backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
            >
                <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
                onClick={() => handleScroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-primary backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
            >
                <span className="material-symbols-outlined">chevron_right</span>
            </button>

            {/* Slider Container */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth py-4"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {duplicatedAnime.map((item, index) => (
                    <Link
                        href={`/anime/${item.mal_id}`}
                        key={`${item.mal_id}-${index}`}
                        className="flex-none w-40 sm:w-48 md:w-56 lg:w-64 group cursor-pointer"
                    >
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 border border-white/5 bg-white/5">
                            <Image
                                src={item.images.jpg.large_image_url}
                                alt={getEnglishTitle(item)}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Rank Badge */}
                            <div className="absolute top-3 left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-black">#{(index % anime.length) + 1}</span>
                            </div>

                            {/* Score */}
                            <div className="absolute top-3 right-3 glass px-2 py-1 rounded-xl flex items-center gap-1">
                                <span className="material-symbols-outlined text-yellow-400 text-xs fill-1">star</span>
                                <span className="text-[11px] font-bold text-white">{item.score || 'N/A'}</span>
                            </div>

                            {/* Play Button on Hover */}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                    <span className="material-symbols-outlined text-3xl fill-1">play_arrow</span>
                                </div>
                            </div>

                            {/* Title at Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h4 className="text-white font-bold text-sm truncate group-hover:text-primary transition-colors">
                                    {getEnglishTitle(item)}
                                </h4>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
