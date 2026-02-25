"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth, type User } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AuthWidget from "./AuthWidget";
import { getMonthlyProgress, type MonthlyProgress } from "../lib/anime";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState<string>("");
    const [searchStatus, setSearchStatus] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [user, setUser] = useState<User | null>(null);
    const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Filter options for search
    const typeFilters = [
        { value: "", label: "All Types" },
        { value: "tv", label: "TV" },
        { value: "movie", label: "Movie" },
        { value: "ova", label: "OVA" },
        { value: "special", label: "Special" },
        { value: "ona", label: "ONA" },
        { value: "music", label: "Music" },
    ];

    const statusFilters = [
        { value: "", label: "All Status" },
        { value: "airing", label: "Airing" },
        { value: "complete", label: "Completed" },
        { value: "upcoming", label: "Upcoming" },
    ];

    // Category quick filters with Jikan API genre IDs
    const categoryFilters = [
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
        { value: "17", label: "Magic", icon: "auto_awesome" },
        { value: "29", label: "Vampire", icon: "nightlight" },
    ];

    useEffect(() => {
        const publicPaths = ["/login", "/register"];
        const isAuthPage = publicPaths.includes(pathname);

        // Set a timeout to prevent hanging on auth check
        const authTimeout = setTimeout(() => {
            console.warn("Auth check timed out - proceeding anyway");
            setLoading(false);
        }, 10000); // 10 second timeout

        try {
            const auth = getFirebaseAuth();
            if (!auth) {
                console.warn('Firebase auth not available');
                clearTimeout(authTimeout);
                if (!isAuthPage) {
                    router.push("/login");
                } else {
                    setLoading(false);
                }
                return;
            }

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                // Clear timeout on successful auth check
                clearTimeout(authTimeout);

                if (!currentUser && !isAuthPage) {
                    router.push("/login");
                } else if (currentUser && isAuthPage) {
                    router.push("/");
                } else {
                    setUser(currentUser);
                    // Fetch monthly progress
                    if (currentUser) {
                        try {
                            const progress = await getMonthlyProgress(currentUser.uid);
                            setMonthlyProgress(progress);
                        } catch (error) {
                            console.error('Error fetching monthly progress:', error);
                        }
                    }
                    setLoading(false);
                }
            }, (error) => {
                // Handle auth errors
                console.error("Auth state change error:", error);
                clearTimeout(authTimeout);
                // If there's an auth error and we're not on a public page, redirect to login
                // Otherwise, just proceed to allow the app to work
                if (!isAuthPage) {
                    router.push("/login");
                } else {
                    setLoading(false);
                }
            });

            return () => {
                clearTimeout(authTimeout);
                unsubscribe();
            };
        } catch (error) {
            console.error('Firebase auth initialization error:', error);
            clearTimeout(authTimeout);
            if (!isAuthPage) {
                router.push("/login");
            } else {
                setLoading(false);
            }
        }
    }, [pathname, router]);

    const handleSearch = (e?: React.KeyboardEvent<HTMLInputElement>) => {
        if (e && e.key !== 'Enter') return;

        // Build query params
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (searchType) params.set('type', searchType);
        if (searchStatus) params.set('status', searchStatus);
        if (selectedCategory) params.set('genre', selectedCategory);

        const queryString = params.toString();
        router.push(`/search${queryString ? '?' + queryString : ''}`);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchType("");
        setSearchStatus("");
        setSelectedCategory("");
    };

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        // Build query params
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (searchType) params.set('type', searchType);
        if (searchStatus) params.set('status', searchStatus);
        if (category) params.set('genre', category);

        const queryString = params.toString();
        router.push(`/search${queryString ? '?' + queryString : ''}`);
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center relative z-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center opacity-70 animate-pulse shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-3xl">auto_awesome</span>
                    </div>
                    <p className="text-primary font-medium tracking-widest uppercase text-xs animate-pulse">Authenticating...</p>
                </div>
            </div>
        );
    }

    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (isAuthPage) {
        return <div className="h-full w-full relative z-10">{children}</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden relative z-10">
            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Glassmorphic Sidebar - Mobile and Desktop */}
            <aside className={`
 fixed md:static inset-y-0 left-0 z-40 w-64 h-full p-6 flex-col gap-8 border-r border-white/5 flex-shrink-0 transition-transform duration-300                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `} style={{ backgroundColor: '#0a0a0a' }}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
                        <Image
                            src="/anime-chronos-logo.png"
                            alt="Anime Chronos"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight text-white">Anime Chronos</h1>
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Premium Tracker</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 grow justify-between">
                    <div className="flex flex-col gap-2">
                        <Link
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === '/' ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-2 border-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}`} href="/">
                            {pathname === '/' && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent-cyan rounded-full shadow-[0_0_16px_rgba(168,85,247,0.8)] animate-pulse"></div>
                            )}
                            <span className={`material-symbols-outlined transition-all duration-300 ${pathname === '/' ? 'text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'group-hover:text-white group-hover:scale-110'}`}>home</span>
                            <span className={`font-medium transition-all duration-300 ${pathname === '/' ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-white'}`}>Home</span>
                        </Link>
                        <Link
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === '/movies' ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-2 border-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}`} href="/movies">
                            {pathname === '/movies' && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent-cyan rounded-full shadow-[0_0_16px_rgba(168,85,247,0.8)] animate-pulse"></div>
                            )}
                            <span className={`material-symbols-outlined transition-all duration-300 ${pathname === '/movies' ? 'text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'group-hover:text-white group-hover:scale-110'}`}>movie</span>
                            <span className={`font-medium transition-all duration-300 ${pathname === '/movies' ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-white'}`}>Anime Movies</span>
                        </Link>
                        <Link
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === '/series' ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-2 border-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}`} href="/series">
                            {pathname === '/series' && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent-cyan rounded-full shadow-[0_0_16px_rgba(168,85,247,0.8)] animate-pulse"></div>
                            )}
                            <span className={`material-symbols-outlined transition-all duration-300 ${pathname === '/series' ? 'text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'group-hover:text-white group-hover:scale-110'}`}>live_tv</span>
                            <span className={`font-medium transition-all duration-300 ${pathname === '/series' ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-white'}`}>Anime Series</span>
                        </Link>
                        <Link
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === '/mylist' ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-2 border-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}`} href="/mylist">
                            {pathname === '/mylist' && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent-cyan rounded-full shadow-[0_0_16px_rgba(168,85,247,0.8)] animate-pulse"></div>
                            )}
                            <span className={`material-symbols-outlined transition-all duration-300 ${pathname === '/mylist' ? 'text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'group-hover:text-white group-hover:scale-110'}`}>format_list_bulleted</span>
                            <span className={`font-medium transition-all duration-300 ${pathname === '/mylist' ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-white'}`}>My List</span>
                        </Link>
                    </div>

                    {/* User Stats Widget - Enhanced */}
                    <div className="glass p-4 rounded-2xl flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-white text-sm">local_fire_department</span>
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Progress</span>
                            </div>
                            <span className="text-xs font-black text-primary bg-primary/20 px-2 py-1 rounded-lg">
                                {monthlyProgress ? `${monthlyProgress.percentComplete}%` : '0%'}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative">
                            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-accent-cyan shadow-[0_0_12px_rgba(140,37,244,0.6)]"
                                    style={{ width: monthlyProgress ? `${monthlyProgress.percentComplete}%` : '0%' }}
                                ></div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-accent-cyan text-sm">play_circle</span>
                                    <span className="text-[10px] text-slate-400 uppercase">This Week</span>
                                </div>
                                <span className="text-lg font-black text-white">
                                    {monthlyProgress ? monthlyProgress.episodesThisWeek : 0}
                                </span>
                                <span className="text-[10px] text-slate-500 ml-1">eps</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
                                    <span className="text-[10px] text-slate-400 uppercase">This Month</span>
                                </div>
                                <span className="text-lg font-black text-white">
                                    {monthlyProgress ? monthlyProgress.episodesThisMonth : 0}
                                </span>
                                <span className="text-[10px] text-slate-500 ml-1">eps</span>
                            </div>
                        </div>

                        {/* Motivational Text */}
                        <p className="text-[11px] text-slate-400 leading-tight text-center">
                            {monthlyProgress && monthlyProgress.episodesThisMonth >= monthlyProgress.monthlyGoal ? (
                                <span className="text-green-400 flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-sm">emoji_events</span>
                                    Goal reached! Amazing!
                                </span>
                            ) : monthlyProgress && monthlyProgress.episodesThisMonth > 0 ? (
                                <>Keep going! <span className="text-white font-medium">{monthlyProgress.monthlyGoal - monthlyProgress.episodesThisMonth}</span> more to reach your goal</>
                            ) : (
                                <span>Start watching to track your progress!</span>
                            )}
                        </p>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto hide-scrollbar relative w-full">
                {/* Top Header / Search */}
                <header className="sticky top-0 z-30 px-4 md:px-8 py-4 md:py-6 glass border-b border-white/5 backdrop-blur-md space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>

                        <div className="relative flex-1 max-w-xl group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors cursor-pointer" onClick={() => handleSearch()}>search</span>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                placeholder="Search for anime, characters, or studios..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                        </div>

                        {/* Type Filter */}
                        <select
                            value={searchType}
                            onChange={(e) => { setSearchType(e.target.value); handleSearch(); }}
                            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-white/10 transition-all"
                        >
                            {typeFilters.map((filter) => (
                                <option key={filter.value} value={filter.value} className="bg-slate-800">
                                    {filter.label}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={searchStatus}
                            onChange={(e) => { setSearchStatus(e.target.value); handleSearch(); }}
                            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-white/10 transition-all"
                        >
                            {statusFilters.map((filter) => (
                                <option key={filter.value} value={filter.value} className="bg-slate-800">
                                    {filter.label}
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background-dark"></span>
                            </button>
                            <AuthWidget />
                        </div>
                    </div>

                    {/* Category Quick Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                        {categoryFilters.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => handleCategoryClick(category.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === category.value
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{category.icon}</span>
                                {category.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="px-4 md:px-8 py-6 md:py-8 space-y-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
