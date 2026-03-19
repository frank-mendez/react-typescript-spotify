# Click-to-Play on Search Results

**Date:** 2026-03-19
**Status:** Approved

## Problem

Track rows in the Search view are display-only. There is no way to initiate playback of a specific track from the UI. The PlayerBar only resumes/pauses whatever is already active on the user's Spotify device.

## Goal

Allow the user to click a track in search results to play it immediately on their active Spotify device.

## Design

### New Component: `TrackRow`

**File:** `src/components/features/TrackRow.tsx`

A reusable component that renders a single track row with a hover-activated play button.

**Props:**
```ts
interface TrackRowProps {
  track: Track;
  onPlay: (uri: string) => void;
}
```

**Behavior:**
- Displays album art (thumbnail), track name, and artist names — matching the existing search row layout
- On hover, a `Play` icon button appears overlaid on the album art (Tailwind `group` / `group-hover` pattern)
- Clicking anywhere on the row OR the play button calls `onPlay(track.uri)`
- Uses only existing Tailwind + lucide-react (no new dependencies)

### Updated: `Search.tsx`

- Replace the existing track `<div>` with `<TrackRow>`
- Import `usePlaybackControls` from `../../hooks/useSpotifyMutations`
- Pass `onPlay={(uri) => play.mutate({ uris: [uri] })}` to each `TrackRow`

## Data Flow

```
User clicks TrackRow
  → onPlay(track.uri)
  → play.mutate({ uris: [uri] })
  → playback.startResumePlayback({ uris: [uri] })
  → PUT /me/player/play  { uris: ["spotify:track:xxx"] }
  → Spotify plays track on active device
  → invalidateQueries(['spotify', 'playback'])
  → PlayerBar reflects new state
```

## Out of Scope

- Active/playing track highlight (can be added later)
- Queueing multiple tracks
- Playlist/album click-to-play
