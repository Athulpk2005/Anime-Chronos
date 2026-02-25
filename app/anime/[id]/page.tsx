import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnglishTitle } from "@/lib/anime";
import AddToListButton from "@/components/AddToListButton";
import EpisodeTracker from "@/components/EpisodeTracker";

export default async function AnimeDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) return notFound();

    let anime: any = null;
    let characters: any[] = [];
    let episodes: any[] = [];
    let relations: any[] = [];

    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`, { next: { revalidate: 3600 } });
        if (!res.ok) {
            if (res.status === 404) return notFound();
            throw new Error("Failed to fetch");
        }
        anime = (await res.json()).data;

        // Fetch characters
        await new Promise(resolve => setTimeout(resolve, 333));
        const charRes = await fetch(`https://api.jikan.moe/v4/anime/${id}/characters`);
        if (charRes.ok) {
            characters = (await charRes.json()).data?.slice(0, 10) || [];
        }

        // Fetch episodes
        await new Promise(resolve => setTimeout(resolve, 333));
        const epRes = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`);
        if (epRes.ok) {
            episodes = (await epRes.json()).data || [];
        }

        // Fetch relations
        await new Promise(resolve => setTimeout(resolve, 333));
        const relRes = await fetch(`https://api.jikan.moe/v4/anime/${id}/relations`);
        if (relRes.ok) {
            relations = (await relRes.json()).data || [];
        }

    } catch (error) {
        console.error("Error fetching anime details:", error);
    }

    if (!anime) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const heroBg = anime.trailer?.images?.maximum_image_url || anime.images?.jpg?.large_image_url || "";
    const title = getEnglishTitle(anime);

    return (
        <div className="relative pb-20">
            {/* Hero Banner / Cover Background */}
            <div className="absolute top-0 left-0 w-[calc(100%+4rem)] h-[450px] z-0 -mt-8 -mx-8 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {heroBg && <Image src={heroBg} alt={title} fill className="object-cover opacity-[0.15] object-top blur-[2px] transition-opacity duration-1000" priority />}
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-linear-to-r from-[#0f1014] via-transparent to-transparent z-10 opacity-80"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-20 pt-10">
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to browsing
                    </Link>
                </div>

                {/* Top Section: Poster + Info */}
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left: Poster */}
                    <div className="w-full lg:w-[280px] shrink-0">
                        <div className="aspect-2/3 relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5">
                            <Image src={anime.images.jpg.large_image_url} alt={title} fill className="object-cover" priority />
                            <div className="absolute top-0 left-0 w-full h-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
                        </div>
                        {/* Actions */}
                        <div className="mt-6 flex flex-col gap-3">
                            {anime.trailer?.url ? (
                                <Link href={anime.trailer.url} target="_blank" className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(140,37,244,0.3)] hover:shadow-[0_0_30px_rgba(140,37,244,0.5)] transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5">
                                    <span className="material-symbols-outlined">play_arrow</span> Watch Trailer
                                </Link>
                            ) : (
                                <button disabled className="w-full py-3.5 bg-white/5 text-slate-500 font-bold rounded-xl border border-white/5 cursor-not-allowed flex justify-center items-center gap-2">
                                    <span className="material-symbols-outlined">videocam_off</span> No Trailer
                                </button>
                            )}
                            <AddToListButton
                                animeId={anime.mal_id}
                                animeTitle={title}
                                animeImage={anime.images.jpg.large_image_url}
                                totalEpisodes={anime.episodes || 0}
                            />
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 text-slate-100 space-y-6 pt-2">
                        {/* Title & Score */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                {anime.status && <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-black bg-white/10 rounded-md text-emerald-400 border border-emerald-400/20">{anime.status}</span>}
                                {anime.type && <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-black bg-primary/20 rounded-md text-primary border border-primary/30">{anime.type}</span>}
                                {anime.rating && <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold bg-white/5 rounded-md text-slate-300 border border-white/10">{anime.rating.split(' ')[0]}</span>}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-2 leading-tight">{title}</h1>
                            {anime.title_japanese && <h2 className="text-lg text-slate-400 font-medium">{anime.title_japanese}</h2>}
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-8 py-5 border-y border-white/5">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-yellow-400 fill-1 text-4xl drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">star</span>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white leading-none">{anime.score || "N/A"}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{anime.scored_by?.toLocaleString()} users</span>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-accent-cyan text-4xl drop-shadow-[0_0_10px_rgba(0,242,254,0.3)]">emoji_events</span>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white leading-none">#{anime.rank || "?"}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Ranked</span>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-rose-400 text-4xl drop-shadow-[0_0_10px_rgba(251,113,133,0.3)]">favorite</span>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white leading-none">#{anime.popularity || "?"}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Popularity</span>
                                </div>
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                            {anime.genres?.map((g: any) => (
                                <span key={g.mal_id} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors rounded-full text-xs font-bold tracking-wide text-slate-300 cursor-pointer backdrop-blur-sm">{g.name}</span>
                            ))}
                        </div>

                        {/* Synopsis */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Synopsis</h3>
                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line bg-white/5 p-6 rounded-2xl border border-white/5">
                                {anime.synopsis || "No synopsis available."}
                            </p>
                        </div>

                        {/* Detailed Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-linear-to-br from-white/5 to-transparent rounded-2xl border border-white/5 backdrop-blur-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none"></div>

                            <div>
                                <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Studios</span>
                                <span className="text-sm font-bold text-white leading-tight block">{anime.studios?.map((s: any) => s.name).join(", ") || "Unknown"}</span>
                            </div>
                            <div>
                                <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Source</span>
                                <span className="text-sm font-bold text-white leading-tight block">{anime.source || "Unknown"}</span>
                            </div>
                            <div>
                                <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Episodes</span>
                                <span className="text-sm font-bold text-white leading-tight block">{anime.episodes || "?"} <span className="text-slate-400 font-normal">({anime.duration})</span></span>
                            </div>
                            <div>
                                <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Aired</span>
                                <span className="text-sm font-bold text-white leading-tight block">{anime.aired?.string || "Unknown"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Watch Order / Relations Section */}
                {relations && relations.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-rose-400 text-3xl">account_tree</span>
                            <h3 className="text-xl font-bold text-white tracking-tight">Related Media & Watch Order</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {relations.map((rel: any, idx: number) => (
                                <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col h-full">
                                    <span className="text-[11px] text-rose-400 uppercase tracking-widest font-black mb-4 block">{rel.relation}</span>
                                    <div className="flex flex-col gap-3 mt-auto">
                                        {rel.entry.map((entry: any) => (
                                            entry.type === 'anime' ? (
                                                <Link href={`/anime/${entry.mal_id}`} key={entry.mal_id} className="text-sm font-bold text-white hover:text-primary transition-colors flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-sm text-primary mt-0.5 shrink-0">play_circle</span>
                                                    <span className="leading-snug">{entry.name}</span>
                                                </Link>
                                            ) : (
                                                <span key={entry.mal_id} className="text-sm font-bold text-slate-300 flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-sm text-slate-500 mt-0.5 shrink-0">menu_book</span>
                                                    <span className="leading-snug">{entry.name} <span className="text-[10px] text-slate-500 uppercase tracking-widest font-normal ml-1">({entry.type})</span></span>
                                                </span>
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Characters Section */}
                {characters && characters.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">groups</span>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Main Characters</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {characters.map((char: any) => (
                                <div key={char.character.mal_id} className="flex bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
                                    <div className="relative w-[70px] h-[90px] shrink-0">
                                        <Image src={char.character.images.jpg.image_url} alt={char.character.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-3 flex flex-col justify-center">
                                        <span className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{char.character.name}</span>
                                        <span className="text-[10px] text-primary uppercase tracking-widest mt-0.5">{char.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Episodes Section with Tracker */}
                {episodes && episodes.length > 0 && (
                    <EpisodeTracker
                        animeId={anime.mal_id}
                        animeTitle={title}
                        totalEpisodes={anime.episodes || 0}
                        episodes={episodes}
                        watchEntry={null}
                    />
                )}

                {/* Background Details if provided */}
                {anime.background && (
                    <div className="mt-12 p-8 bg-primary/5 rounded-3xl border border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                            <span className="material-symbols-outlined text-primary">info</span>
                            Background Context
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line relative z-10">{anime.background}</p>
                    </div>
                )}

            </div>
        </div>
    );
}
