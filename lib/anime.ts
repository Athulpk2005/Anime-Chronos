import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, writeBatch, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Safe database getter that handles initialization errors
const getDb = () => {
  try {
    return getFirebaseDb();
  } catch (error) {
    console.error('Failed to get Firebase DB:', error);
    return null;
  }
};

/**
 * Jikan API Anime response type
 */
export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_synonyms: string[] | null;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string | null;
  type: string | null;
  episodes: number | null;
  status: string;
  aired: {
    from: string;
    to: string | null;
  } | null;
  score: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  genres: Array<{ mal_id: number; name: string; type: string }>;
  studios: Array<{ mal_id: number; name: string }>;
  source: string | null;
  rating: string | null;
  duration: string | null;
  year: number | null;
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
    images: {
      image_url: string | null;
      small_image_url: string | null;
      medium_image_url: string | null;
      large_image_url: string | null;
      maximum_image_url: string | null;
    };
  } | null;
}

/**
 * Utility functions for working with anime data from the Jikan API
 */

/**
 * Gets the English name of an anime, with fallback to original title
 * and other alternatives
 */
export function getEnglishTitle(anime: {
  title_english?: string | null;
  title?: string;
  title_synonyms?: string[] | null;
}): string {
  if (anime.title_english) {
    return anime.title_english;
  }
  if (anime.title) {
    return anime.title;
  }
  if (anime.title_synonyms && anime.title_synonyms.length > 0) {
    return anime.title_synonyms[0];
  }
  return "Unknown Title";
}

/**
 * Gets all available titles for an anime
 */
export function getAllTitles(anime: {
  title_english?: string | null;
  title?: string;
  title_synonyms?: string[] | null;
}): string[] {
  const titles: string[] = [];
  if (anime.title) titles.push(anime.title);
  if (anime.title_english && anime.title_english !== anime.title) {
    titles.push(anime.title_english);
  }
  if (anime.title_synonyms) {
    anime.title_synonyms.forEach((synonym) => {
      if (synonym !== anime.title && synonym !== anime.title_english) {
        titles.push(synonym);
      }
    });
  }
  return titles;
}

/**
 * Watch status type
 */
export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

/**
 * WatchList entry interface
 */
export interface WatchListEntry {
  id?: string;
  userId: string;
  animeId: number;
  animeTitle: string;
  animeImage: string;
  status: WatchStatus;
  episodesWatched: number;
  totalEpisodes: number;
  score?: number;
  startDate?: string;
  finishDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * WatchList stats interface
 */
export interface WatchListStats {
  total: number;
  watching: number;
  completed: number;
  onHold: number;
  dropped: number;
  planToWatch: number;
  totalEpisodesWatched: number;
  meanScore: number;
}

/**
 * Adds an anime to the user's watchlist
 */
export async function addToWatchList(
  userId: string,
  animeId: number,
  animeTitle: string,
  animeImage: string,
  totalEpisodes: number,
  status: WatchStatus
): Promise<WatchListEntry | null> {
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return null;
  }
  const now = new Date().toISOString();
  const entry = {
    userId,
    animeId,
    animeTitle,
    animeImage,
    status,
    episodesWatched: 0,
    totalEpisodes,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await addDoc(collection(db, 'watchlist'), entry);
  return { id: docRef.id, ...entry } as WatchListEntry;
}

/**
 * Updates an existing watchlist entry
 */
export async function updateWatchListEntry(entryId: string, updates: Partial<WatchListEntry>): Promise<void> {
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  const entryRef = doc(db, 'watchlist', entryId);
  await updateDoc(entryRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Gets all watchlist entries for a user
 */
export async function getUserWatchList(userId: string): Promise<WatchListEntry[]> {
  if (!userId) return [];
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return [];
  }
  const q = query(collection(db, 'watchlist'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as WatchListEntry));
}

/**
 * Gets a specific watchlist entry by anime ID
 */
export async function getWatchListEntry(userId: string, animeId: number): Promise<WatchListEntry | null> {
  if (!userId || !animeId) return null;
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return null;
  }
  const q = query(
    collection(db, 'watchlist'),
    where('userId', '==', userId),
    where('animeId', '==', animeId)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data() as Omit<WatchListEntry, 'id'>;
  return { id: doc.id, ...data } as WatchListEntry;
}

/**
 * Removes an anime from the user's watchlist
 */
export async function removeFromWatchList(entryId: string): Promise<void> {
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  await deleteDoc(doc(db, 'watchlist', entryId));
}

/**
 * Gets watchlist entries filtered by status
 */
export async function getWatchListByStatus(userId: string, status: WatchStatus): Promise<WatchListEntry[]> {
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return [];
  }
  const q = query(
    collection(db, 'watchlist'),
    where('userId', '==', userId),
    where('status', '==', status),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as WatchListEntry));
}

/**
 * Gets watchlist statistics for a user
 */
export async function getWatchListStats(userId: string): Promise<WatchListStats> {
  const watchlist = await getUserWatchList(userId);

  const stats: WatchListStats = {
    total: watchlist.length,
    watching: 0,
    completed: 0,
    onHold: 0,
    dropped: 0,
    planToWatch: 0,
    totalEpisodesWatched: 0,
    meanScore: 0,
  };

  let totalScore = 0;
  let scoreCount = 0;

  watchlist.forEach(entry => {
    switch (entry.status) {
      case 'watching':
        stats.watching++;
        break;
      case 'completed':
        stats.completed++;
        break;
      case 'on_hold':
        stats.onHold++;
        break;
      case 'dropped':
        stats.dropped++;
        break;
      case 'plan_to_watch':
        stats.planToWatch++;
        break;
    }

    stats.totalEpisodesWatched += entry.episodesWatched;

    if (entry.score) {
      totalScore += entry.score;
      scoreCount++;
    }
  });

  stats.meanScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;

  return stats;
}

/**
 * Episode watch record interface
 */
interface EpisodeWatchRecord {
  userId: string;
  animeId: number;
  episodeNumber: number;
  watchedAt: string;
  duration: number;
}

/**
 * Marks an episode as watched
 */
export async function markEpisodeWatched(
  userId: string,
  animeId: number,
  episodeNumber: number,
  duration: number = 0
): Promise<void> {
  if (!userId || !animeId || !episodeNumber) return;
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }
  const q = query(
    collection(db, 'episode_watches'),
    where('userId', '==', userId),
    where('animeId', '==', animeId),
    where('episodeNumber', '==', episodeNumber)
  );
  const querySnapshot = await getDocs(q);

  // Delete existing record if found
  if (!querySnapshot.empty) {
    await deleteDoc(doc(db, 'episode_watches', querySnapshot.docs[0].id));
  }

  // Add new record
  await addDoc(collection(db, 'episode_watches'), {
    userId,
    animeId,
    episodeNumber,
    duration,
    watchedAt: new Date().toISOString(),
  });

  // Update the episodesWatched count in watchlist
  const watchlistQ = query(
    collection(db, 'watchlist'),
    where('userId', '==', userId),
    where('animeId', '==', animeId)
  );
  const watchlistSnapshot = await getDocs(watchlistQ);

  if (!watchlistSnapshot.empty) {
    const watchlistDoc = watchlistSnapshot.docs[0];
    const currentData = watchlistDoc.data();

    // Get all watched episodes to count them
    const allEpisodesQ = query(
      collection(db, 'episode_watches'),
      where('userId', '==', userId),
      where('animeId', '==', animeId)
    );
    const allEpisodesSnapshot = await getDocs(allEpisodesQ);
    const episodesWatchedCount = allEpisodesSnapshot.size;

    await updateDoc(doc(db, 'watchlist', watchlistDoc.id), {
      episodesWatched: episodesWatchedCount,
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Unmarks an episode as watched
 */
export async function unmarkEpisodeWatched(userId: string, animeId: number, episodeNumber: number): Promise<void> {
  if (!userId || !animeId || !episodeNumber) return;
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }
  const q = query(
    collection(db, 'episode_watches'),
    where('userId', '==', userId),
    where('animeId', '==', animeId),
    where('episodeNumber', '==', episodeNumber)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    await deleteDoc(doc(db, 'episode_watches', querySnapshot.docs[0].id));
  }

  // Update the episodesWatched count in watchlist
  const watchlistQ = query(
    collection(db, 'watchlist'),
    where('userId', '==', userId),
    where('animeId', '==', animeId)
  );
  const watchlistSnapshot = await getDocs(watchlistQ);

  if (!watchlistSnapshot.empty) {
    const watchlistDoc = watchlistSnapshot.docs[0];

    // Get all watched episodes to count them
    const allEpisodesQ = query(
      collection(db, 'episode_watches'),
      where('userId', '==', userId),
      where('animeId', '==', animeId)
    );
    const allEpisodesSnapshot = await getDocs(allEpisodesQ);
    const episodesWatchedCount = allEpisodesSnapshot.size;

    await updateDoc(doc(db, 'watchlist', watchlistDoc.id), {
      episodesWatched: episodesWatchedCount,
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Gets all watched episodes for an anime
 */
export async function getWatchedEpisodes(userId: string, animeId: number): Promise<number[]> {
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return [];
  }
  const q = query(
    collection(db, 'episode_watches'),
    where('userId', '==', userId),
    where('animeId', '==', animeId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs
    .map(doc => doc.data().episodeNumber)
    .sort((a, b) => a - b);
}

/**
 * Updates the anime status in the watchlist
 */
export async function updateAnimeStatus(
  entryId: string,
  status: WatchStatus,
  episodesWatched?: number,
  score?: number
): Promise<void> {
  const db = getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  const updates: Partial<WatchListEntry> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (episodesWatched !== undefined) {
    updates.episodesWatched = episodesWatched;
  }

  if (score !== undefined) {
    updates.score = score;
  }

  await updateDoc(doc(db, 'watchlist', entryId), updates);
}

/**
 * Clears all watch history for an anime
 */
export async function clearWatchHistory(userId: string, animeId: number): Promise<void> {
  const db = getDb();

  if (!db) {
    console.error('Database not available');
    return;
  }

  // Get all episode watch records
  const q = query(
    collection(db, 'episode_watches'),
    where('userId', '==', userId),
    where('animeId', '==', animeId)
  );
  const querySnapshot = await getDocs(q);

  // Delete all records
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(docToDelete => {
    batch.delete(doc(db, 'episode_watches', docToDelete.id));
  });
  await batch.commit();

  // Update watchlist entry
  const watchlistQ = query(
    collection(db, 'watchlist'),
    where('userId', '==', userId),
    where('animeId', '==', animeId)
  );
  const watchlistSnapshot = await getDocs(watchlistQ);

  if (!watchlistSnapshot.empty) {
    const watchlistDoc = watchlistSnapshot.docs[0];
    await updateDoc(doc(db, 'watchlist', watchlistDoc.id), {
      episodesWatched: 0,
      score: null,
      startDate: null,
      finishDate: null,
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Gets total watch time for a user in minutes
 */
export async function getTotalWatchTime(userId: string): Promise<number> {
  const db = getDb();

  if (!db) {
    console.error('Database not available');
    return 0;
  }
  const q = query(
    collection(db, 'episode_watches'),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  let totalMinutes = 0;
  querySnapshot.docs.forEach(doc => {
    totalMinutes += doc.data().duration || 0;
  });

  return totalMinutes;
}

/**
 * Gets anime currently being watched (episodes in progress)
 */
export async function getCurrentlyWatching(userId: string): Promise<WatchListEntry[]> {
  return getWatchListByStatus(userId, 'watching');
}

/**
 * Gets recently updated watchlist entries
 */
export async function getRecentlyUpdated(userId: string, limit: number = 10): Promise<WatchListEntry[]> {
  const watchlist = await getUserWatchList(userId);

  // Sort by updatedAt descending
  watchlist.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return watchlist.slice(0, limit);
}

/**
 * Monthly progress interface
 */
export interface MonthlyProgress {
  month: string;
  episodesWatched: number;
  animeCompleted: number;
  animeStarted: number;
  percentComplete: number;
  episodesThisWeek: number;
  episodesThisMonth: number;
  monthlyGoal: number;
}

/**
 * Gets monthly watch progress for a user
 */
export async function getMonthlyProgress(userId: string): Promise<MonthlyProgress> {
  const db = getDb();

  if (!db) {
    // Return default progress if database is not available
    return {
      month: new Date().toISOString().slice(0, 7),
      episodesWatched: 0,
      animeCompleted: 0,
      animeStarted: 0,
      percentComplete: 0,
      episodesThisWeek: 0,
      episodesThisMonth: 0,
      monthlyGoal: 120,
    };
  }

  // Get all watchlist entries
  const watchlist = await getUserWatchList(userId);

  // Get all episode watch records
  const q = query(
    collection(db, 'episode_watches'),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format

  let episodesThisMonth = 0;
  let completedThisMonth = 0;
  let startedThisMonth = 0;

  // Count episodes watched this month
  querySnapshot.docs.forEach(doc => {
    const data = doc.data();
    const watchedDate = new Date(data.watchedAt);
    const watchedMonth = watchedDate.toISOString().slice(0, 7);

    if (watchedMonth === currentMonth) {
      episodesThisMonth++;
    }
  });

  // Count completed and started anime this month
  watchlist.forEach(entry => {
    const createdDate = new Date(entry.createdAt);
    const updatedDate = new Date(entry.updatedAt);

    const createdMonth = createdDate.toISOString().slice(0, 7);
    const updatedMonth = updatedDate.toISOString().slice(0, 7);

    if (createdMonth === currentMonth) {
      startedThisMonth++;
    }

    if (entry.status === 'completed' && updatedMonth === currentMonth) {
      completedThisMonth++;
    }
  });

  return {
    month: currentMonth,
    episodesWatched: episodesThisMonth,
    animeCompleted: completedThisMonth,
    animeStarted: startedThisMonth,
    percentComplete: Math.min(100, Math.round((episodesThisMonth / 120) * 100)), // 120 episodes = 100% (assuming 1 episode/day for half a month)
    episodesThisWeek: Math.round(episodesThisMonth / 4),
    episodesThisMonth: episodesThisMonth,
    monthlyGoal: 120,
  };
}
