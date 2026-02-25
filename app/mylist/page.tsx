"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import {
  getUserWatchList,
  getWatchListStats,
  type WatchListEntry,
  type WatchListStats,
  type WatchStatus
} from "@/lib/anime";

const statusLabels: Record<WatchStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
  plan_to_watch: "Plan to Watch",
};

export default function MyListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchList, setWatchList] = useState<WatchListEntry[]>([]);
  const [stats, setStats] = useState<WatchListStats | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("all");

  // Update active status when URL changes
  useEffect(() => {
    const status = searchParams.get("status") || "all";
    setActiveStatus(status);
  }, [searchParams]);

  useEffect(() => {
    const { app } = require("@/lib/firebase");
    const auth = getAuth(app);

    // Set a timeout to prevent hanging
    const dataTimeout = setTimeout(() => {
      console.warn("Watchlist fetch timed out");
      setLoading(false);
    }, 15000); // 15 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        clearTimeout(dataTimeout);
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Fetch watch list and stats
      try {
        const list = await getUserWatchList(currentUser.uid);
        const watchStats = await getWatchListStats(currentUser.uid);
        setWatchList(list);
        setStats(watchStats);
      } catch (e) {
        console.error("Error fetching watch list:", e);
        // Still allow the page to render even if fetch fails
      }

      clearTimeout(dataTimeout);
      setLoading(false);
    }, (error) => {
      // Handle auth error
      console.error("Auth error in mylist:", error);
      clearTimeout(dataTimeout);
      router.push("/login");
    });

    return () => {
      clearTimeout(dataTimeout);
      unsubscribe();
    };
  }, [router]);

  // Get status from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status) setActiveStatus(status);
  }, []);

  const filteredList = activeStatus !== "all"
    ? watchList.filter(entry => entry.status === activeStatus)
    : watchList;

  const sortedList = [...filteredList].sort((a, b) => {
    const statusOrder: Record<WatchStatus, number> = {
      watching: 0,
      plan_to_watch: 1,
      on_hold: 2,
      dropped: 3,
      completed: 4,
    };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const statusTabs = [
    { key: "all", label: "All" },
    { key: "watching", label: "Watching" },
    { key: "completed", label: "Completed" },
    { key: "plan_to_watch", label: "Plan to Watch" },
    { key: "on_hold", label: "On Hold" },
    { key: "dropped", label: "Dropped" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">My List</h1>
        <p className="text-slate-400">Track and manage your anime watch progress</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-primary/20 border border-primary/30 rounded-xl p-4">
            <p className="text-primary text-xs uppercase tracking-wider">Watching</p>
            <p className="text-2xl font-bold text-primary">{stats.watching}</p>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-xs uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-xs uppercase tracking-wider">On Hold</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.onHold}</p>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-xs uppercase tracking-wider">Dropped</p>
            <p className="text-2xl font-bold text-red-400">{stats.dropped}</p>
          </div>
          <div className="bg-slate-500/20 border border-slate-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Plan to Watch</p>
            <p className="text-2xl font-bold text-slate-400">{stats.planToWatch}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {statusTabs.map(tab => (
          <Link
            key={tab.key}
            href={`/mylist${tab.key !== 'all' ? `?status=${tab.key}` : ''}`}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeStatus === tab.key
              ? "bg-primary text-white"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Watch List */}
      {sortedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedList.map((entry) => (
            <Link
              href={`/anime/${entry.animeId}`}
              key={entry.id}
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="relative aspect-video">
                <Image
                  src={entry.animeImage}
                  alt={entry.animeTitle}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${entry.status === 'watching' ? 'bg-primary' :
                    entry.status === 'completed' ? 'bg-green-500' :
                      entry.status === 'on_hold' ? 'bg-yellow-500' :
                        entry.status === 'dropped' ? 'bg-red-500' :
                          'bg-slate-500'
                    }`}>
                    {statusLabels[entry.status]}
                  </span>
                </div>
                {entry.status === 'watching' && entry.totalEpisodes > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(entry.episodesWatched / entry.totalEpisodes) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">
                  {entry.animeTitle}
                </h3>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-slate-400">
                    {entry.episodesWatched} / {entry.totalEpisodes || "?"} eps
                  </span>
                  {entry.score && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <span className="material-symbols-outlined text-sm">star</span>
                      {entry.score}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">
            movie_filter
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">
            {activeStatus !== "all" ? `No ${statusLabels[activeStatus as WatchStatus] || activeStatus} anime` : "Your list is empty"}
          </h2>
          <p className="text-slate-400 mb-6">
            {activeStatus !== "all"
              ? `You don't have any anime in this category yet`
              : "Start adding anime to your list to track your progress"}
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors"
          >
            Browse Anime
          </Link>
        </div>
      )}
    </div>
  );
}
