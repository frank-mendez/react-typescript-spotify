# Featured Playlist Section — Design Spec

**Date:** 2026-03-21

## Overview

Add a "Featured Playlists" section to the dashboard home page, directly below the existing "Made For You" section. The implementation mirrors `MadeForYouSection` in structure and behavior, using the Spotify featured playlists endpoint instead of the current user's playlists.

## Goals

- Display Spotify-curated featured playlists on the home dashboard
- Reuse existing UI patterns (scrollable card row, play/pause overlay, chevron navigation)
- Extract the shared `PlaylistCard` component to avoid duplication

## Architecture

### Shared Component: `PlaylistCard`

`PlaylistCard` is currently defined as a private component inside `MadeForYouSection.tsx`. Since both sections need it, it will be extracted to its own file:

- **`src/components/features/home/PlaylistCard.tsx`** — exported `PlaylistCard` component with the same props interface (`playlist`, `onPlay`, `onPause`, `isActive`, `isPlaying`)

### Updated: `MadeForYouSection.tsx`

- Remove inline `PlaylistCard` definition and `PlaylistCardProps` interface
- Import `PlaylistCard` from `./PlaylistCard`
- All other logic unchanged

### New: `FeaturedPlaylistSection.tsx`

- Located at `src/components/features/home/FeaturedPlaylistSection.tsx`
- Uses `useFeaturedPlaylists(20)` hook (already exists in `useSpotifyQueries.ts`)
- Uses `useCurrentPlayback` and `usePlaybackControls` for play/pause state (same as `MadeForYouSection`)
- Static section title: `"Featured Playlists"`
- Same horizontal scroll container with left/right chevron arrows and gradient fade
- Same skeleton loading state (8 cards)
- Returns `null` if no playlists are returned
- Imports `PlaylistCard` from `./PlaylistCard`

### Updated: `MainPanel.tsx`

- Import `FeaturedPlaylistSection`
- Render `<FeaturedPlaylistSection />` directly below `<MadeForYouSection />`

## Data Flow

```
useFeaturedPlaylists(20)
  → api.browse.getFeaturedPlaylists({ limit: 20 })
  → GET /browse/featured-playlists
  → FeaturedPlaylists { message?: string; playlists: PaginatedResponse<Playlist> }
```

`data.playlists.items` is the array of `Playlist` objects passed to `PlaylistCard`.

## Error Handling

- While loading: render skeleton placeholders (8 cards)
- If `data.playlists.items` is empty: return `null` (section hidden)
- API errors are handled by React Query's default error boundary propagation

## Testing

No new test files are required for this change. The extracted `PlaylistCard` component is already covered indirectly by `HomeSection.test.tsx`. If a dedicated test is desired, it can be added as `PlaylistCard.test.tsx` in the same directory following the existing co-location pattern.

## Files Changed

| File | Action |
|------|--------|
| `src/components/features/home/PlaylistCard.tsx` | Create (extracted from MadeForYouSection) |
| `src/components/features/home/MadeForYouSection.tsx` | Modify (import PlaylistCard) |
| `src/components/features/home/FeaturedPlaylistSection.tsx` | Create |
| `src/components/layout/MainPanel.tsx` | Modify (add FeaturedPlaylistSection) |
