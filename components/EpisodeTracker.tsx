"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import {
    markEpisodeWatched,
    unmarkEpisodeWatched,
    getWatchedEpisodes,
    type WatchListEntry
} from "@/lib/anime";

interface Episode {
    mal_id: number;
    title: string;
    title_japanese?: string;
    aired?: string;
}

interface EpisodeTrackerProps {
    animeId: number;
    animeTitle: string;
    totalEpisodes: number;
    episodes: Episode[];
    watchEntry: WatchListEntry | null;
}

export default function EpisodeTracker({
    animeId,
    animeTitle,
    totalEpisodes,
    episodes,
    watchEntry
}: EpisodeTrackerProps) {
    const [user, setUser] = useState<User | null>(null);
    const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => {
        const { app } = require("@/lib/firebase");
        const auth = getAuth(app);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const watched = await getWatchedEpisodes(currentUser.uid, animeId);
                setWatchedEpisodes(watched);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [animeId]);

    const handleToggleEpisode = async (episodeNumber: number) => {
        if (!user) return;

        setProcessing(episodeNumber);
        try {
            if (watchedEpisodes.includes(episodeNumber)) {
                await unmarkEpisodeWatched(user.uid, animeId, episodeNumber);
                setWatchedEpisodes(prev => prev.filter(ep => ep !== episodeNumber));
            } else {
                await markEpisodeWatched(user.uid, animeId, episodeNumber, undefined);
                setWatchedEpisodes(prev => [...prev, episodeNumber].sort((a, b) => a - b));
            }
        } catch (error) {
            console.error("Error toggling episode:", error);
        }
        setProcessing(null);
    };

    const handleMarkAllUpTo = async (episodeNumber: number) => {
        if (!user) return;

        setProcessing(episodeNumber);
        try {
            // Mark all episodes up to this number as watched
            for (let i = 1; i <= episodeNumber; i++) {
                if (!watchedEpisodes.includes(i)) {
                    await markEpisodeWatched(user.uid, animeId, i, undefined);
                }
            }
            const newWatched = Array.from({ length: episodeNumber }, (_, i) => i + 1);
            setWatchedEpisodes(newWatched);
        } catch (error) {
            console.error("Error marking episodes:", error);
        }
        setProcessing(null);
    };

    const watchedCount = watchedEpisodes.length;
    const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;

    // For anime with many episodes, show a more compact view
    const isLargeSet = episodes.length > 50;

    return (
        <div className="mt-16">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-cyan text-3xl">list_alt</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Episodes</h3>
                    {watchEntry && (
                        <span className="text-sm text-slate-400 ml-2">
                            ({watchedCount}/{totalEpisodes || episodes.length} watched)
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                {watchEntry && totalEpisodes > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent-cyan rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
                    </div>
                )}
            </div>

            {/* Episode list */}
            <div className={`flex flex-col gap-2 ${isLargeSet ? 'max-h-[400px] overflow-y-auto pr-2 custom-scrollbar' : 'max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'}`}>
                {episodes.map((ep) => {
                    const isWatched = watchedEpisodes.includes(ep.mal_id);
                    const isCurrentlyAiring = !ep.aired;

                    return (
                        <div
                            key={ep.mal_id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl transition-all gap-4 group ${isWatched
                                    ? 'bg-accent-cyan/10 border border-accent-cyan/30'
                                    : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-5">
                                {/* Watch button */}
                                <button
                                    onClick={() => handleToggleEpisode(ep.mal_id)}
                                    disabled={!user || processing === ep.mal_id}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${isWatched
                                            ? 'bg-accent-cyan text-white'
                                            : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                        } ${user ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                    title={user ? (isWatched ? 'Mark as unwatched' : 'Mark as watched') : 'Login to track progress'}
                                >
                                    {processing === ep.mal_id ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : isWatched ? (
                                        <span className="material-symbols-outlined text-lg">check</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                                    )}
                                </button>

                                <div className="flex items-center gap-4">
                                    <span className={`text-xl font-black w-10 text-center transition-colors ${isWatched ? 'text-accent-cyan' : 'text-slate-500 group-hover:text-accent-cyan'
                                        }`}>
                                        {ep.mal_id}
                                    </span>
                                    <div>
                                        <h4 className={`font-bold text-sm sm:text-base leading-snug transition-colors ${isWatched ? 'text-accent-cyan line-through opacity-70' : 'text-white'
                                            }`}>
                                            {ep.title}
                                        </h4>
                                        {ep.title_japanese && (
                                            <span className="text-xs text-slate-400">{ep.title_japanese}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Quick mark all up to button */}
                                {user && !isWatched && (
                                    <button
                                        onClick={() => handleMarkAllUpTo(ep.mal_id)}
                                        disabled={processing === ep.mal_id}
                                        className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                                        title="Mark all up to this episode"
                                    >
                                        Mark all prior
                                    </button>
                                )}
                                {ep.aired && (
                                    <span className="text-xs text-slate-400 font-medium shrink-0 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                        {new Date(ep.aired).toLocaleDateString()}
                                    </span>
                                )}
                                {isCurrentlyAiring && (
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                                        airing
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {episodes.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-6xl mb-4">movie_filter</span>
                    <p>No episodes available yet</p>
                </div>
            )}
        </div>
    );
}
