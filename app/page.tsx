import Image from "next/image";
import Link from "next/link";
import { getEnglishTitle, type JikanAnime } from "@/lib/anime";
import TrendingSlider from "@/components/TrendingSlider";
import HeroSlider from "@/components/HeroSlider";

type Anime = JikanAnime;

export default async function Home() {
  let heroAnimeList: Anime[] = [];
  let topRated: Anime[] = [];
  let newest: Anime[] = [];

  try {
    // Fetch top airing anime for hero slider
    const res1 = await fetch(`https://api.jikan.moe/v4/top/anime?filter=airing&limit=5`, { cache: 'no-store' });
    if (res1.ok) heroAnimeList = (await res1.json()).data || [];

    await new Promise(resolve => setTimeout(resolve, 400));

    // Fetch top rated anime
    const res2 = await fetch(`https://api.jikan.moe/v4/top/anime?limit=10`, { cache: 'no-store' });
    if (res2.ok) topRated = (await res2.json()).data || [];

    await new Promise(resolve => setTimeout(resolve, 400));

    // Fetch currently airing anime
    const res3 = await fetch(`https://api.jikan.moe/v4/seasons/now?limit=10`, { cache: 'no-store' });
    if (res3.ok) newest = (await res3.json()).data || [];
  } catch (e) {
    console.error("Failed to fetch from Jikan", e);
  }

  // Fallbacks using previous dummy images in case API is down
  const defaultHeroImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuD8XXH9NYcgpMPRU8DR0Qm8CL3rRT4mSjvrQOh0co-kpoQicbGI9FgLxdwA9iIsYTNJhArw0W3IrjHdbl4ZkUgWarvIIEU6f9qD9unp6LhOrnSjYBwvShLqyitUnswnHzcdiiQCQe9glQHoRCpzrO1acFbn2mAQb8T_2j43T0ZcppahRH2iVwYpUm6zmERoEmN0o4eNx4uKMwMyJRzb3GjQgFGFDE7k6EUwp50OIXALL1-bj81avyNQbBGuIj9RZ2qdjVZyy0PqYA8U";

  return (
    <>
      {/* Hero Section with Animated Slider */}
      <HeroSlider animeList={heroAnimeList} fallbackImage={defaultHeroImage} />

      {/* Trending Anime Slider */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_fire_department</span>
            Trending Now
          </h3>
          <p className="text-slate-400 text-sm">The most popular anime right now.</p>
        </div>

        <TrendingSlider anime={topRated} />
      </section>

      {/* Top Rated Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">stars</span>
              Top Rated Titles
            </h3>
            <p className="text-slate-400 text-sm">The most critically acclaimed series.</p>
          </div>
          <Link className="text-primary text-sm font-bold hover:underline" href="/series">View All</Link>
        </div>

        <TrendingSlider anime={topRated.slice(0, 5)} />
      </section>

      {/* Newest Episodes Grid */}
      <section className="space-y-6 pb-12">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-cyan">update</span>
              Currently Airing
            </h3>
            <p className="text-slate-400 text-sm">Freshly subbed and ready for your viewing pleasure.</p>
          </div>
          <Link className="text-accent-cyan text-sm font-bold hover:underline" href="/series">View All</Link>
        </div>

        <TrendingSlider anime={newest.slice(0, 5)} />
      </section>
    </>
  );
}
