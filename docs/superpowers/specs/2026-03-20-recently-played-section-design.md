# Recently Played Section — Design Spec

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

Add a "Recently Played" section to the Dashboard home view showing a mixed grid of albums and artists the user has recently played. Each item renders as a horizontal pill card (image + name + play button). This is the first of several planned home sections (Made For, Top Mixes, Favorite Artists); a reusable `HomeSection` shell is introduced to support them.

---

## Architecture

### New files

| File | Purpose |
|------|---------|
| `src/components/features/home/HomeSection.tsx` | Reusable section wrapper — accepts `title` prop and renders children in a labeled block |
| `src/components/features/home/RecentlyPlayedCard.tsx` | Horizontal pill card — image, name/subtitle, circular play button |
| `src/components/features/home/RecentlyPlayedSection.tsx` | Fetches data, derives `RecentItem[]`, renders grid inside `HomeSection` |

### Modified files

| File | Change |
|------|--------|
| `src/hooks/useSpotifyQueries.ts` | Add `useRecentlyPlayed(limit = 20)` hook |
| `src/pages/Dashboard.tsx` | Render `<RecentlyPlayedSection />` inside `MainPanel` when `currentContent === MainContent.PLAYER` |

---

## Data Flow

### Hook — `useRecentlyPlayed`

```ts
export const useRecentlyPlayed = (limit = 20) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ['spotify', 'recently-played', limit],
    queryFn: () => requireApi(api).playback.getRecentlyPlayedTracks({ limit }),
    enabled: api !== null,
    staleTime: 2 * 60 * 1000,
  });
};
```

### Derived type — `RecentItem`

```ts
type RecentItem = {
  id: string;
  name: string;
  imageUrl?: string;
  type: 'album' | 'artist';
  uri: string;
  navigationPath: string;
  subtitle: string;
}
```

### Derivation logic (in `RecentlyPlayedSection`)

1. Iterate `items` from the hook response in order (most recent first).
2. For each track:
   - If `track.album` exists and its `id` has not been seen: add an album `RecentItem`.
   - Add `track.artists[0]` if its `id` has not been seen: add an artist `RecentItem`.
3. Stop after collecting 8 unique items (albums and artists interleaved in recency order).
4. `imageUrl`: `track.album.images[1]?.url ?? images[0]?.url` for albums; `undefined` for artists (no image in this endpoint).
5. `subtitle`: comma-joined artist names for albums; `"Artist"` label for artist items.
6. `navigationPath`: `/album/:id` for albums; `/artist/:id` for artists.
7. `uri`: `track.album.uri` for albums; `track.artists[0].uri` for artists (used as `context_uri` for playback).

---

## Component Design

### `HomeSection`

```tsx
interface HomeSectionProps {
  title: string;
  children: React.ReactNode;
}
```

Renders a `<section>` with an `<h2>` title (`text-text-primary font-bold text-xl`) and the children below it. No logic — purely presentational.

### `RecentlyPlayedCard`

```tsx
interface RecentlyPlayedCardProps {
  item: RecentItem;
  onPlay: (uri: string) => void;
}
```

Layout:
- Outer: `flex items-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors group overflow-hidden cursor-pointer`
- Left: `w-16 h-16 shrink-0` — `<img>` with `object-cover`; artist fallback = `div` with circle + 2-char initials in `bg-accent/20 text-accent`
- Center: `flex-1 px-3 min-w-0` — truncated `<p>` for name + truncated `<p>` for subtitle in `text-text-muted text-xs`
- Right: `pr-3 opacity-0 group-hover:opacity-100 transition-opacity` — circular play button `w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg`

Clicking the card body navigates to `navigationPath`. Play button calls `onPlay(item.uri)` and stops event propagation.

### `RecentlyPlayedSection`

- Calls `useRecentlyPlayed(20)` and `useSpotifyMutations` (for `startResumePlayback`).
- Renders a skeleton grid (8 skeleton pills) while loading.
- Renders nothing if data is empty.
- Grid: `grid grid-cols-2 lg:grid-cols-4 gap-2`

---

## States

| State | Behavior |
|-------|---------|
| Loading | 8 skeleton pills in the same grid layout |
| Empty / error | Section not rendered (returns `null`) |
| Populated | Grid of up to 8 `RecentlyPlayedCard` items |

---

## Integration

`MainPanel` in `Dashboard.tsx` gains a home view branch:

```tsx
// when currentContent === MainContent.PLAYER and no outlet
return (
  <div className="p-4 flex flex-col gap-6">
    <RecentlyPlayedSection />
  </div>
);
```

The existing "Open Spotify on a device to start playing" message is removed from this branch — the home view is now the recently played grid.

---

## Out of Scope

- Playlists (require extra per-item API fetches)
- Artist images (not returned by `/me/player/recently-played`)
- "Made For", "Top Mixes", "Favorite Artists" sections (future, will reuse `HomeSection`)
- Infinite scroll / pagination
