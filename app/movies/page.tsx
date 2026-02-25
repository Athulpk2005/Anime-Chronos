import Image from "next/image";
import Link from "next/link";
import { getEnglishTitle, type JikanAnime } from "@/lib/anime";
import CategoryFilter from "@/components/CategoryFilter";

type Anime = JikanAnime;

export default async function MoviesPage({
    searchParams,
}: {
    searchParams: Promise<{ genre?: string }>;
}) {
    const { genre } = await searchParams;

    // Build API URL with optional genre filter
    let apiUrl = 'https://api.jikan.moe/v4/top/anime?type=movie&limit=24';
    if (genre) {
        apiUrl = `https://api.jikan.moe/v4/anime?type=movie&genres=${encodeURIComponent(genre)}&order_by=score&sort=desc&limit=24`;
    }

    let movies: Anime[] = [];

    try {
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (res.ok) {
            const data = (await res.json()).data || [];
            // Remove duplicates based on mal_id
            const seen = new Set();
            movies = data.filter((anime: Anime) => {
                if (seen.has(anime.mal_id)) return false;
                seen.add(anime.mal_id);
                return true;
            });
        }
    } catch (e) {
        console.error("Failed to fetch movies from Jikan", e);
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Anime Movies</h1>
                <p className="text-slate-400">Discover top-rated feature-length anime films.</p>
            </div>

            {/* Category Filter */}
            <CategoryFilter type="movie" selectedGenre={genre} />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {movies.map((anime) => (
                    <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id} className="group cursor-pointer">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 border border-white/5 bg-white/5">
                            <Image src={anime.images.jpg.large_image_url} alt={getEnglishTitle(anime)} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-3 right-3 glass px-2 py-1 rounded-xl flex items-center gap-1">
                                <span className="material-symbols-outlined text-yellow-400 text-xs fill-1">star</span>
                                <span className="text-[11px] font-bold text-white">{anime.score || 'N/A'}</span>
                            </div>
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                    <span className="material-symbols-outlined text-3xl fill-1">play_arrow</span>
                                </div>
                            </div>
                        </div>
                        <h4 className="text-white font-bold group-hover:text-primary transition-colors truncate">{getEnglishTitle(anime)}</h4>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-slate-500 text-xs font-medium truncate">{anime.genres?.slice(0, 2).map(g => g.name).join(" • ") || "N/A"}</p>
                            <span className="text-slate-400 text-[10px] font-bold">{anime.year || "N/A"}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
