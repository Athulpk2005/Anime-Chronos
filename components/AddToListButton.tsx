"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import {
    addToWatchList,
    removeFromWatchList,
    updateAnimeStatus,
    getWatchListEntry,
    type WatchListEntry,
    type WatchStatus
} from "@/lib/anime";

interface AddToListButtonProps {
    animeId: number;
    animeTitle: string;
    animeImage: string;
    totalEpisodes: number;
}

export default function AddToListButton({
    animeId,
    animeTitle,
    animeImage,
    totalEpisodes
}: AddToListButtonProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [watchEntry, setWatchEntry] = useState<WatchListEntry | null>(null);
    const [processing, setProcessing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const { app } = require("@/lib/firebase");
        const auth = getAuth(app);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check if anime is already in watch list
                const entry = await getWatchListEntry(currentUser.uid, animeId);
                setWatchEntry(entry);
            } else {
                setWatchEntry(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [animeId]);

    const handleAddToList = async (status: WatchStatus = "plan_to_watch") => {
        if (!user) {
            router.push("/login");
            return;
        }

        setProcessing(true);
        try {
            console.log("Adding to watchlist:", { userId: user.uid, animeId, animeTitle, status });
            const result = await addToWatchList(
                user.uid,
                animeId,
                animeTitle,
                animeImage,
                totalEpisodes,
                status
            );
            console.log("Add result:", result);
            if (result) {
                setWatchEntry(result);
                router.push("/mylist");
            }
        } catch (error: any) {
            console.error("Error adding to list:", error);
            alert("Failed to add to list: " + (error?.message || "Unknown error"));
        } finally {
            setProcessing(false);
            setShowMenu(false);
        }
    };

    const handleRemoveFromList = async () => {
        if (!watchEntry?.id) return;

        setProcessing(true);
        try {
            await removeFromWatchList(watchEntry.id);
            setWatchEntry(null);
        } catch (error) {
            console.error("Error removing from list:", error);
        }
        setProcessing(false);
    };

    const handleUpdateStatus = async (status: WatchStatus) => {
        if (!watchEntry?.id) return;

        setProcessing(true);
        try {
            await updateAnimeStatus(watchEntry.id, status);
            const updated = await getWatchListEntry(user!.uid, animeId);
            setWatchEntry(updated);
            router.push("/mylist");
        } catch (error) {
            console.error("Error updating status:", error);
        }
        setProcessing(false);
        setShowMenu(false);
    };

    if (loading) {
        return (
            <button disabled className="w-full py-3.5 bg-white/5 text-slate-500 font-bold rounded-xl border border-white/5 cursor-not-allowed flex justify-center items-center gap-2">
                <span className="material-symbols-outlined animate-spin">sync</span> Loading...
            </button>
        );
    }

    // Already in watch list - show status menu
    if (watchEntry) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={processing}
                    className={`w-full py-3.5 font-bold rounded-xl border transition-all flex justify-center items-center gap-2 ${watchEntry.status === 'completed'
                        ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                        : watchEntry.status === 'watching'
                            ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                >
                    <span className="material-symbols-outlined">
                        {watchEntry.status === 'completed' ? 'check_circle' :
                            watchEntry.status === 'watching' ? 'play_circle' : 'bookmark'}
                    </span>
                    {watchEntry.status === 'completed' ? 'Completed' :
                        watchEntry.status === 'watching' ? 'Watching' :
                            watchEntry.status === 'plan_to_watch' ? 'Plan to Watch' :
                                watchEntry.status === 'on_hold' ? 'On Hold' : 'Dropped'}
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b1e] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                        <button
                            onClick={() => handleUpdateStatus('watching')}
                            disabled={processing}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-primary">play_circle</span>
                            Watching
                            {watchEntry.status === 'watching' && <span className="ml-auto text-primary">✓</span>}
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('completed')}
                            disabled={processing}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-green-400">check_circle</span>
                            Completed
                            {watchEntry.status === 'completed' && <span className="ml-auto text-green-400">✓</span>}
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('on_hold')}
                            disabled={processing}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-yellow-400">pause_circle</span>
                            On Hold
                            {watchEntry.status === 'on_hold' && <span className="ml-auto text-yellow-400">✓</span>}
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('dropped')}
                            disabled={processing}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-red-400">cancel</span>
                            Dropped
                            {watchEntry.status === 'dropped' && <span className="ml-auto text-red-400">✓</span>}
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('plan_to_watch')}
                            disabled={processing}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-400">bookmark_add</span>
                            Plan to Watch
                            {watchEntry.status === 'plan_to_watch' && <span className="ml-auto text-slate-400">✓</span>}
                        </button>
                        <div className="border-t border-white/10" />
                        <button
                            onClick={handleRemoveFromList}
                            disabled={processing}
                            className="w-full px-4 py-3 text-left hover:bg-red-500/10 flex items-center gap-3 text-red-400 transition-colors"
                        >
                            <span className="material-symbols-outlined">delete</span>
                            Remove from List
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Not in watch list - show add button
    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={processing}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/10 transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5"
            >
                <span className="material-symbols-outlined">bookmark_add</span> Add to List
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1b1e] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                    <button
                        onClick={() => handleAddToList('watching')}
                        disabled={processing}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-primary">play_circle</span>
                        Start Watching
                    </button>
                    <button
                        onClick={() => handleAddToList('completed')}
                        disabled={processing}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                        Mark as Completed
                    </button>
                    <button
                        onClick={() => handleAddToList('on_hold')}
                        disabled={processing}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-yellow-400">pause_circle</span>
                        On Hold
                    </button>
                    <button
                        onClick={() => handleAddToList('dropped')}
                        disabled={processing}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-red-400">cancel</span>
                        Dropped
                    </button>
                    <button
                        onClick={() => handleAddToList('plan_to_watch')}
                        disabled={processing}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400">bookmark_add</span>
                        Plan to Watch
                    </button>
                </div>
            )}
        </div>
    );
}
