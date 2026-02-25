"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { JikanAnime } from "@/lib/anime";
import { getEnglishTitle } from "@/lib/anime";

interface HeroSliderProps {
    animeList: JikanAnime[];
    fallbackImage: string;
}

export default function HeroSlider({ animeList, fallbackImage }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % animeList.length);
    }, [animeList.length]);

    useEffect(() => {
        // Auto-advance every 6 seconds
        const interval = setInterval(goToNext, 6000);
        return () => clearInterval(interval);
    }, [goToNext]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const getAnimeData = (index: number) => {
        const anime = animeList[index];
        if (!anime) {
            return {
                image: fallbackImage,
                title: "Cyberpunk: Edge Runners",
                synopsis: "In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw.",
                status: "Season 2 • Ep 12",
                mal_id: 0,
            };
        }
        return {
            image: anime.trailer?.images?.maximum_image_url || anime.trailer?.images?.large_image_url || anime.images.jpg.large_image_url || fallbackImage,
            title: getEnglishTitle(anime),
            synopsis: anime.synopsis || "",
            status: anime.status ? `${anime.status} • ${anime.episodes ? `Ep ${anime.episodes}` : 'Ongoing'}` : "Ongoing",
            mal_id: anime.mal_id,
        };
    };

    const currentAnime = getAnimeData(currentIndex);

    return (
        <section className="relative h-[250px] sm:h-[350px] md:h-[450px] rounded-2xl md:rounded-[2.5rem] overflow-hidden group border border-white/5">
            {/* Background Images */}
            {animeList.map((anime, index) => {
                const animeData = getAnimeData(index);
                return (
                    <div
                        key={anime.mal_id}
                        className={`absolute inset-0 transition-all duration-1000 ${index === currentIndex
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-105"
                            }`}
                    >
                        <Image
                            src={animeData.image}
                            alt={animeData.title}
                            fill
                            className="object-cover object-center"
                            priority={index === 0}
                        />
                    </div>
                );
            })}

            {/* Fallback background when no anime */}
            {animeList.length === 0 && (
                <div className="absolute inset-0">
                    <Image
                        src={fallbackImage}
                        alt="Hero"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-linear-to-t from-background-dark via-background-dark/20 to-transparent"></div>
            <div className="absolute inset-0 bg-linear-to-r from-background-dark/80 via-transparent to-transparent"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-4 md:p-12 w-full max-w-3xl space-y-3 md:space-y-6">
                <div className="flex items-center gap-2">
                    <span className="px-2 md:px-3 py-1 bg-primary text-white text-[8px] md:text-[10px] font-bold rounded-full uppercase tracking-widest">Trending Now</span>
                    <span className="px-2 md:px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[8px] md:text-[10px] font-bold rounded-full uppercase tracking-widest border border-white/10">{currentAnime.status}</span>
                </div>

                <div className="space-y-1 md:space-y-2">
                    <h2 className="text-2xl md:text-4xl lg:text-6xl font-black text-white tracking-tighter line-clamp-2 animate-fade-in">
                        {currentAnime.title}
                    </h2>
                    <p className="text-xs md:text-lg text-slate-300 leading-relaxed line-clamp-2 animate-fade-in">
                        {currentAnime.synopsis}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    {currentAnime.mal_id > 0 && (
                        <Link
                            href={`/anime/${currentAnime.mal_id}`}
                            className="flex items-center gap-1 md:gap-2 px-4 md:px-8 py-2 md:py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl md:rounded-2xl transition-all shadow-xl shadow-primary/30 text-xs md:text-base animate-fade-in"
                        >
                            <span className="material-symbols-outlined fill-1 text-sm md:text-xl">play_arrow</span>
                            <span className="hidden sm:inline">Watch Now</span>
                            <span className="sm:hidden">Play</span>
                        </Link>
                    )}
                    <button className="flex items-center gap-1 md:gap-2 px-4 md:px-8 py-2 md:py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold rounded-xl md:rounded-2xl border border-white/10 transition-all text-xs md:text-base animate-fade-in">
                        <span className="material-symbols-outlined text-sm md:text-xl">add</span>
                        <span className="hidden sm:inline">Add to List</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute right-2 md:right-8 bottom-4 md:bottom-12 flex flex-col gap-2 md:gap-3">
                {animeList.slice(0, 5).map((anime, index) => (
                    <button
                        key={anime.mal_id}
                        onClick={() => goToSlide(index)}
                        className={`w-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                            ? "h-12 bg-primary"
                            : "h-6 bg-white/20 hover:bg-white/40 cursor-pointer"
                            }`}
                    />
                ))}
            </div>
        </section >
    );
}
