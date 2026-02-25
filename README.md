# Anime Chronos - Premium Anime Tracker

A modern anime tracking web application built with Next.js, React, and Firebase.

## Features

- **Browse Anime**: Explore popular, top-rated, currently airing, and upcoming anime
- **Search**: Find anime by title with full-text search
- **Categories**: Filter by genre, format (TV, Movie, OVA), and status
- **Track Progress**: Track your watchlist with status (Watching, Completed, Plan to Watch, Dropped, On Hold)
- **Episode Tracking**: Keep track of episodes watched per anime
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **User Authentication**: Sign in with Google to save your anime list

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth, Firestore)
- **Data Source**: MyAnimeList API (Jikan)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
aniflow/
├── app/                    # Next.js app router pages
│   ├── anime/[id]/        # Anime detail page
│   ├── login/             # Login page
│   ├── movies/            # Movies browse page
│   ├── mylist/            # User's watchlist
│   ├── register/          # Registration page
│   ├── search/            # Search page
│   ├── series/            # Series browse page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AddToListButton.tsx
│   ├── AuthWidget.tsx
│   ├── CategoryFilter.tsx
│   ├── ClientLayoutWrapper.tsx
│   ├── EpisodeTracker.tsx
│   └── ...
├── lib/                   # Utility functions
│   ├── anime.ts           # Anime data fetching
│   └── firebase.ts        # Firebase config
└── public/                # Static assets
```

## Environment Variables

Create a `.env.local` file with your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Jikan API Documentation](https://jikan.moe/)
- [Firebase Documentation](https://firebase.google.com/docs)
