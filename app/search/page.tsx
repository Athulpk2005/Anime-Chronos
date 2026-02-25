import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnglishTitle, type JikanAnime } from "@/lib/anime";

// Since this page consumes searchParams dynamically, it should be server-rendered on demand.
export const dynamic = 'force-dynamic';

type Anime = JikanAnime;

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; type?: string; status?: string; genre?: string }>;
}) {
    const { q, type, status, genre } = await searchParams;

    if (!q && !type && !status && !genre) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-slate-600">search_off</span>
                <h2 className="text-2xl font-bold text-white">No Search Query Provided</h2>
                <p className="text-slate-400 max-w-md">Please enter an anime title in the search bar above or select a category to begin exploring.</p>
            </div>
        )
    }

    let results: Anime[] = [];

    // Build the API URL with filters
    let apiUrl = 'https://api.jikan.moe/v4/anime?sfw=true&limit=24';

    if (q) {
        apiUrl += `&q=${encodeURIComponent(q)}`;
    }
    if (type) {
        apiUrl += `&type=${encodeURIComponent(type)}`;
    }
    if (status) {
        apiUrl += `&status=${encodeURIComponent(status)}`;
    }
    if (genre) {
        apiUrl += `&genres=${encodeURIComponent(genre)}`;
    }

    try {
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (res.ok) {
            const data = (await res.json()).data || [];
            // Remove duplicates based on mal_id
            const seen = new Set();
            results = data.filter((anime: Anime) => {
                if (seen.has(anime.mal_id)) return false;
                seen.add(anime.mal_id);
                return true;
            });
        }
    } catch (e) {
        console.error("Failed to fetch search results from Jikan", e);
    }

    // Build filter description
    const filterParts: string[] = [];
    if (q) filterParts.push(`"${q}"`);
    if (type) filterParts.push(`${type}`);
    if (status) filterParts.push(status);
    if (genre) filterParts.push(genre);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Search Results</h1>
                <p className="text-slate-400">
                    Found {results.length} results for <span className="text-primary font-bold">{filterParts.join(', ')}</span>
                </p>
            </div>

            {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {results.map((anime) => (
                        <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id} className="group cursor-pointer">
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 border border-white/5 bg-white/5">
                                <Image src={anime.images.jpg.large_image_url} alt={getEnglishTitle(anime)} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-3 right-3 glass px-2 py-1 rounded-xl flex items-center gap-1">
                                    <span className="material-symbols-outlined text-yellow-400 text-xs fill-1">star</span>
                                    <span className="text-[11px] font-bold text-white">{anime.score || 'N/A'}</span>
                                </div>
                                {anime.type && (
                                    <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md px-2 py-0.5 rounded shadow-lg">
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{anime.type}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                        <span className="material-symbols-outlined text-3xl fill-1">play_arrow</span>
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-white font-bold group-hover:text-primary transition-colors truncate">{getEnglishTitle(anime)}</h4>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-slate-500 text-xs font-medium truncate">{anime.genres?.slice(0, 2).map(g => g.name).join(" • ")}</p>
                                <span className="text-slate-400 text-[10px] font-bold shrink-0 ml-2">{anime.year || anime.status?.split(' ')[0] || "N/A"}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[40vh] text-center space-y-4 bg-white/5 rounded-3xl border border-white/5">
                    <span className="material-symbols-outlined text-6xl text-slate-600">sentiment_dissatisfied</span>
                    <h2 className="text-xl font-bold text-white">No results found</h2>
                    <p className="text-slate-400 max-w-sm">We couldn't find any anime matching "{q}". Try checking your spelling or using different keywords.</p>
                </div>
            )}
        </div>
    );
}
