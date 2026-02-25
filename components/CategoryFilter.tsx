"use client";

import Link from "next/link";

// Genre categories with Jikan API IDs
const genreCategories = [
    { value: "", label: "All", icon: "apps" },
    { value: "1", label: "Action", icon: "sports_martial_arts" },
    { value: "2", label: "Adventure", icon: "explore" },
    { value: "4", label: "Comedy", icon: "sentiment_very_satisfied" },
    { value: "8", label: "Drama", icon: "theater_comedy" },
    { value: "10", label: "Fantasy", icon: "auto_awesome" },
    { value: "7", label: "Mystery", icon: "question_mark" },
    { value: "14", label: "Horror", icon: "warning" },
    { value: "22", label: "Romance", icon: "favorite" },
    { value: "24", label: "Sci-Fi", icon: "rocket_launch" },
    { value: "36", label: "Slice of Life", icon: "self_improvement" },
    { value: "30", label: "Sports", icon: "sports_soccer" },
    { value: "21", label: "School", icon: "school" },
    { value: "28", label: "Super Power", icon: "bolt" },
    { value: "37", label: "Supernatural", icon: "auto_fix_high" },
    { value: "31", label: "Thriller", icon: "psychology" },
];

interface CategoryFilterProps {
    type: "movie" | "series";
    selectedGenre?: string;
}

export default function CategoryFilter({ type, selectedGenre = "" }: CategoryFilterProps) {
    const typeParam = type === "movie" ? "movie" : "tv";

    return (
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 py-2 px-1">
            {genreCategories.map((genre) => {
                const href = genre.value
                    ? `/${type === "movie" ? "movies" : "series"}?genre=${genre.value}`
                    : `/${type === "movie" ? "movies" : "series"}`;
                const isSelected = selectedGenre === genre.value;

                return (
                    <Link
                        key={genre.value}
                        href={href}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${isSelected
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{genre.icon}</span>
                        {genre.label}
                    </Link>
                );
            })}
        </div>
    );
}
