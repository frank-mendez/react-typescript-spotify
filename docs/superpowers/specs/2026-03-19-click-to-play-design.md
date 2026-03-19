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
- The entire row is rendered as a `<button>` so it is accessible and keyboard-navigable
- Displays album art thumbnail (`track.album?.images?.[2]?.url ?? track.album?.images?.[0]?.url`); if `track.album` is undefined or no image is available, render a plain placeholder `<div>` with a background color
- Displays track name and artist names
- On hover, a `Play` icon button appears overlaid on the album art (Tailwind `group` / `group-hover` pattern)
- The inner Play `<button>` calls `e.stopPropagation()` before calling `onPlay` to prevent the row's click from also firing
- Clicking elsewhere on the row also calls `onPlay(track.uri)`
- Mutation loading/error states (no active device, request in flight) are out of scope for this iteration
- Uses only existing Tailwind + lucide-react (no new dependencies)

### Updated: `Search.tsx`

- Replace the existing track `<div>` with `<TrackRow>`
- `Search.tsx` imports `usePlaybackControls` from `../../hooks/useSpotifyMutations` (not `TrackRow` — `TrackRow` receives `onPlay` as a prop)
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
