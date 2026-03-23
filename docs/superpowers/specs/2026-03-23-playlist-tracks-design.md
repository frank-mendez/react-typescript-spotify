# Playlist Tracks Feature — Design Spec

**Date:** 2026-03-23
**Project:** react-typescript-spotify
**Branch:** feature/playlist-tracks (to be created from feature/featured-playlist)

---

## Problem

`PlaylistDetail.tsx` shows a playlist header (cover art, name, owner, track count, play button) but renders no track list. Users who navigate to a playlist see no content below the header.

---

## Solution

The updated Spotify `GET /playlists/{id}` endpoint now returns an **`items`** field directly on the playlist object, replacing the deprecated `GET /playlists/{id}/tracks` endpoint. The embedded `items` pagination object contains up to 100 playlist items per request. Since `usePlaylist` already calls this endpoint, the track data is available with no additional API call.

---

## Architecture

### 1. Type Updates — `src/types/spotify.ts`

Add a `PlaylistItem` interface to replace the deprecated `PlaylistTrack.track` field with `item`:

```ts
export interface PlaylistItem {
  added_at: string;
  added_by: {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    type: 'user';
    uri: string;
  };
  is_local: boolean;
  item: Track | Episode | null;
}
```

Update the `Playlist` interface to include the new `items` field alongside the existing `tracks` (kept for `total` display in `PlaylistHeader`):

```ts
items?: PaginatedResponse<PlaylistItem>;
```

Add a minimal `Episode` type (stub) to satisfy the union — episodes will be filtered out at render time.

### 2. New Component — `src/components/features/playlist/PlaylistTrackList.tsx`

- Receives `items: PlaylistItem[]` and `playlistUri: string`
- Filters to tracks only: `item.item?.type === 'track'`
- Renders a column header row (`#`, `Title`, `Duration`) matching `AlbumDetail`
- Renders each track using the existing `TrackRow` component
- Shows an empty state message when no tracks are present
- Handles play via `usePlaybackControls` with `context_uri` + `offset.position`

### 3. Update `PlaylistDetail.tsx`

- Import `PlaylistTrackList`
- Extract `playlist.items?.items ?? []` from existing `usePlaylist` data
- Render `<PlaylistTrackList>` below `<PlaylistHeader>` in the same `bg-[#121212]` section used by `AlbumDetail`
- No new hooks, no new service methods

### 4. Update `PlaylistHeader.tsx`

- Song count display: `playlist.items?.total ?? playlist.tracks?.total`
- Backward-compatible — still works if `items` is not present

---

## Data Flow

```
usePlaylist(id)
  → GET /playlists/{id}
  → returns Playlist { items: PaginatedResponse<PlaylistItem>, ... }
  → playlist.items.items[]  →  PlaylistTrackList  →  TrackRow (per track)
```

---

## Filtering

Playlist items can be tracks or episodes. The component filters at render time:

```ts
items.filter(i => i.item?.type === 'track')
```

Local tracks (`is_local: true`) are included but may not be playable — `TrackRow` handles this gracefully.

---

## Error Handling

- If `playlist.items` is undefined (e.g. not the playlist owner, or API variant): show empty state "No tracks available."
- Track-level play errors are already handled by `usePlaybackControls`

---

## Testing

- `PlaylistTrackList.tsx` — unit test: renders tracks, filters out episodes, shows empty state
- `PlaylistDetail.tsx` — update existing test to assert track list renders when `playlist.items.items` is populated
- No changes needed to `playlist.service.ts` tests

---

## Files Changed

| File | Change |
|------|--------|
| `src/types/spotify.ts` | Add `PlaylistItem`, `Episode` stub; add `items` to `Playlist` |
| `src/components/features/playlist/PlaylistTrackList.tsx` | New component |
| `src/components/features/playlist/PlaylistTrackList.test.tsx` | New test |
| `src/pages/PlaylistDetail.tsx` | Render track list |
| `src/pages/tests/PlaylistDetail.test.tsx` | Update test |
| `src/components/features/playlist/PlaylistHeader.tsx` | Fallback for song count |

---

## Out of Scope

- Pagination beyond first page of items (future: load-more or infinite scroll)
- Episode rendering (filtered out silently)
- Drag-to-reorder tracks
