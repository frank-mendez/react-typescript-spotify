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

- **`src/components/features/home/PlaylistCard.tsx`** — exports `PlaylistCard` component and `PlaylistCardProps` interface (`playlist`, `onPlay`, `onPause`, `isActive`, `isPlaying`). `PlaylistCardProps` is exported for use in tests. Neither `MadeForYouSection` nor `FeaturedPlaylistSection` need to import the type — they pass props inline. The component signature preserves `Readonly<PlaylistCardProps>` to match existing style.

### Updated: `MadeForYouSection.tsx`

- Remove inline `PlaylistCard` definition and `PlaylistCardProps` interface (no longer needed locally)
- Import `PlaylistCard` from `./PlaylistCard`
- All other logic unchanged

### New: `FeaturedPlaylistSection.tsx`

- Located at `src/components/features/home/FeaturedPlaylistSection.tsx`
- Uses `useFeaturedPlaylists(20)` hook (`../../../hooks/useSpotifyQueries`; `offset` defaults to `0` and is not overridden)
- Uses `useCurrentPlayback` (`../../../hooks/useSpotifyQueries`), `usePlaybackControls` (`../../../hooks/useSpotifyMutations`), and `usePlayerStore` (`../../../stores/usePlayerStore`) for play/pause state (same as `MadeForYouSection`)
- `deviceId` is read from `usePlayerStore` and passed to `play.mutate` and `pause.mutate`
- Static section title: `"Featured Playlists"`
- Same horizontal scroll container with left/right chevron arrows and gradient fade
- Same skeleton loading state (8 cards)
- Data access: `const playlists = data?.playlists?.items ?? []` — note this differs from `MadeForYouSection` which uses `data?.items` because `FeaturedPlaylists` nests the paginated list under a `playlists` key
- Guard: `if (!playlists.length) return null`
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
- If `data?.playlists?.items` is empty or undefined: `return null` (section hidden)
- On API error (`isError === true`): `return null` — the section is silently hidden. There is no global error boundary configured in `MainPanel.tsx` or `App.tsx`, so errors do not propagate further; the section simply disappears.

## Testing

- **`PlaylistCard.test.tsx`** (required): Created in `src/components/features/home/`. At minimum test: renders playlist name, renders image when present, renders initials fallback when no image, calls `onPlay` when play button clicked, calls `onPause` when pause button clicked while active and playing, navigates on card click.
- **`FeaturedPlaylistSection.test.tsx`** (required): Created in `src/components/features/home/`. Must cover: renders skeleton while `isLoading` is true, returns `null` when playlist list is empty, returns `null` when `isError` is true, and verifies `canScrollLeft`/`canScrollRight` arrow visibility reacts to scroll position. These are required to maintain the 60% coverage threshold.
- **`MadeForYouSection.test.tsx`** (not required): No existing test file for `MadeForYouSection` was found in the repo. The extraction of `PlaylistCard` is a pure refactor (no behavior change) so no new tests are needed for this file. Coverage for `PlaylistCard` behavior moves to `PlaylistCard.test.tsx`.

## Files Changed

| File | Action |
|------|--------|
| `src/components/features/home/PlaylistCard.tsx` | Create (extracted from MadeForYouSection) |
| `src/components/features/home/PlaylistCard.test.tsx` | Create (unit tests for PlaylistCard) |
| `src/components/features/home/MadeForYouSection.tsx` | Modify (import PlaylistCard, drop inline definition) |
| `src/components/features/home/FeaturedPlaylistSection.tsx` | Create |
| `src/components/features/home/FeaturedPlaylistSection.test.tsx` | Create (smoke tests: loading skeleton, empty null) |
| `src/components/layout/MainPanel.tsx` | Modify (add FeaturedPlaylistSection) |
