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

Add a `PlaylistItem` interface (replacing the deprecated `PlaylistTrack.track` field with `item`):

```ts
export interface Episode {
  id: string;
  name: string;
  type: 'episode';
  uri: string;
  // other fields omitted — episodes are filtered out at render time
}

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

Update the `Playlist` interface to include the new `items` field alongside the existing `tracks` (kept for backward compatibility — `tracks.total` is still used by `PlaylistHeader`):

```ts
items?: PaginatedResponse<PlaylistItem>;
```

The existing `PlaylistTrack` interface is retained as-is for backward compatibility.

---

### 2. New Component — `src/components/features/playlist/PlaylistTrackList.tsx`

- Receives `items: PlaylistItem[]` and `playlistUri: string`
- Filters to tracks only: `item.item?.type === 'track'`
- Renders a minimal column header with just `Title` (no `#` or `Duration` — `TrackRow` is a flex layout with album art + name/artist/album and does not display a track number or duration)
- Renders each track using the existing `TrackRow` component with an adapter that bridges its `onPlay(uri: string)` callback to Spotify context playback:

```ts
onPlay={(uri) => play.mutate({ context_uri: playlistUri, offset: { uri } })}
```

This plays the selected track in the context of the playlist (preserving the queue), using the track URI as the offset rather than a positional index.

- Shows an empty state message ("No tracks available.") when no tracks are present after filtering
- Calls `usePlaybackControls` internally to obtain the `play` mutation

**Test file:** `src/components/features/playlist/PlaylistTrackList.test.tsx` (co-located alongside the component, matching the project convention — e.g. `TrackRow.test.tsx` lives alongside `TrackRow.tsx`)

---

### 3. Update `PlaylistDetail.tsx` — `src/pages/PlaylistDetail.tsx`

- Import `PlaylistTrackList`
- Extract `playlist.items?.items ?? []` from existing `usePlaylist` data
- Render `<PlaylistTrackList items={playlistItems} playlistUri={playlist.uri} />` below `<PlaylistHeader>` inside a `flex-1 bg-[#121212] px-6 py-4` section (mirrors `AlbumDetail` layout)
- No new hooks, no new service methods

---

### 4. Update `PlaylistHeader.tsx` — `src/components/features/playlist/PlaylistHeader.tsx`

- Song count display: `playlist.items?.total ?? playlist.tracks?.total`
- Add `'items'` to the local `PlaylistHeaderPlaylist` Pick type:

```ts
type PlaylistHeaderPlaylist = Pick<Playlist, 'name' | 'uri' | 'images' | 'owner' | 'tracks' | 'items'>;
```

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

Local tracks (`is_local: true`) are included but may not be playable — `TrackRow` handles this gracefully since it delegates play to the callback.

---

## Error Handling

- If `playlist.items` is undefined (e.g. not the playlist owner, or API variant): show empty state "No tracks available."
- Track-level play errors are already handled by `usePlaybackControls`

---

## Testing

### `PlaylistTrackList.test.tsx`
- Renders track rows when given valid `PlaylistItem[]` items
- Filters out episode items — only track-type items appear
- Shows empty state when `items` is empty or all items are episodes

### `PlaylistDetail.test.tsx`
- Update the existing `mockPlaylist` fixture to include an `items` field:
  ```ts
  items: { href: '', limit: 20, offset: 0, total: 2, items: [mockPlaylistItem1, mockPlaylistItem2] }
  ```
- Add assertion: track list renders when `playlist.items.items` is populated
- Existing passing tests continue to work; `items` can be omitted from fixtures that don't test the track list (it is typed as optional on `Playlist`)

---

## Files Changed

| File | Change |
|------|--------|
| `src/types/spotify.ts` | Add `Episode` stub, `PlaylistItem`; add `items` to `Playlist` |
| `src/components/features/playlist/PlaylistTrackList.tsx` | New component |
| `src/components/features/playlist/PlaylistTrackList.test.tsx` | New test (co-located) |
| `src/pages/PlaylistDetail.tsx` | Render track list below header |
| `src/pages/tests/PlaylistDetail.test.tsx` | Update mock fixture + add track list assertion |
| `src/components/features/playlist/PlaylistHeader.tsx` | Update Pick type + fallback song count |

---

## Out of Scope

- Pagination beyond first page of items (future: load-more or infinite scroll)
- Episode rendering (filtered out silently)
- Drag-to-reorder tracks
- Active track highlighting (`isCurrentTrack` / `isActiveAndPlaying`) — `PlaylistTrackList` does not consume `useCurrentlyPlaying`; this can be added in a follow-up
- Duration column in track list (not shown by `TrackRow`; a future `PlaylistTrackRow` component could add this)
