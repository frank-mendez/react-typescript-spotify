# Web Playback SDK — In-Browser Audio

**Date:** 2026-03-19
**Status:** Approved

## Problem

Clicking a track in search results triggers `PUT /me/player/play` with no `device_id`, which returns 404 when no external Spotify device is active. The user wants audio to play directly in the browser without needing an external device.

## Goal

Register the browser as a Spotify playback device using the Web Playback SDK. When a track is clicked, always route audio to the browser device.

## Design

### 0. Pre-requisite Fixes — `useSpotifyPlayer.ts`

Two bugs in the existing hook must be fixed before the store sync will work correctly:

**Bug 1 — `player_state_changed` clobbers `device_id` with `null`:**
The listener currently hard-codes `device_id: null` in its `setPlayerState` call. Every playback state change event (track start, pause, seek) resets `device_id` to `null`, undoing what the `ready` listener set. Fix by using the functional setter form and omitting `device_id` from the update:

```ts
// BEFORE
setPlayerState({
  is_paused: state.paused,
  is_active: !!state.track_window?.current_track,
  position: state.position,
  duration: state.track_window?.current_track?.duration_ms || 0,
  current_track: state.track_window?.current_track || null,
  device_id: null, // BUG: clobbers the device_id set by the ready event
});

// AFTER
setPlayerState(prev => ({
  ...prev,
  is_paused: state.paused,
  is_active: !!state.track_window?.current_track,
  position: state.position,
  duration: state.track_window?.current_track?.duration_ms || 0,
  current_track: state.track_window?.current_track || null,
}));
```

**Bug 2 — `not_ready` handler does not clear `device_id`:**
When the device becomes unavailable, `not_ready` only sets `isReady = false` but leaves a stale `device_id` in state. Subsequent play calls would send that stale ID and receive a 404. Fix:

```ts
// BEFORE
spotifyPlayer.addListener('not_ready', (_: { device_id: string }) => {
  setIsReady(false);
});

// AFTER
spotifyPlayer.addListener('not_ready', (_: { device_id: string }) => {
  setIsReady(false);
  setPlayerState(prev => ({ ...prev, device_id: null }));
});
```

---

### 1. Dynamic SDK Loading — `useSpotifyPlayer.ts`

The Spotify Web Playback SDK script (`https://sdk.scdn.co/spotify-player.js`) must be loaded after React mounts and after `window.onSpotifyWebPlaybackSDKReady` is set. The script is injected dynamically inside the existing `useEffect` rather than via `index.html`.

**Loading logic (added to the existing `useEffect`):**
```ts
window.onSpotifyWebPlaybackSDKReady = initializePlayer;

if (!document.getElementById('spotify-player-script')) {
  const script = document.createElement('script');
  script.id = 'spotify-player-script';
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  script.async = true;
  document.body.appendChild(script);
}
```

The `id` guard prevents the script from being injected more than once across React re-mounts. If `window.Spotify` is already available (e.g. hot reload), `initializePlayer()` is called directly without re-injecting the script (existing behaviour preserved).

No changes to `index.html`.

### 2. New Zustand Store — `src/stores/usePlayerStore.ts`

```ts
import { create } from 'zustand';

interface PlayerStore {
  deviceId: string | null;
  setDeviceId: (id: string | null) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  deviceId: null,
  setDeviceId: (id) => set({ deviceId: id }),
}));
```

Follows the exact pattern of `src/stores/useContentStore.ts`.

### 3. Dashboard — `src/pages/Dashboard.tsx`

Mount `useSpotifyPlayer` at the Dashboard level (only rendered when authenticated). Sync `playerState.device_id` to the store via `useEffect`:

```ts
const { playerState } = useSpotifyPlayer();
const { setDeviceId } = usePlayerStore();

useEffect(() => {
  setDeviceId(playerState.device_id);
}, [playerState.device_id, setDeviceId]);
```

When the SDK fires `ready`, `playerState.device_id` becomes non-null and the store is updated. Disconnection is handled by `useSpotifyPlayer`'s existing cleanup.

### 4. Search — `src/components/features/Search.tsx`

Read `deviceId` from the store and pass it to the play mutation:

```ts
const { deviceId } = usePlayerStore();

const handlePlay = useCallback(
  (uri: string) => playTrack({ uris: [uri], device_id: deviceId ?? undefined }),
  [playTrack, deviceId],
);
```

If `deviceId` is null (SDK not yet ready), the call proceeds without it — graceful degradation to the existing behaviour.

## Data Flow

```
App loads → Dashboard mounts → useSpotifyPlayer injects SDK script
→ SDK loads → onSpotifyWebPlaybackSDKReady fires → initializePlayer()
→ Player connects → ready event fires with device_id
→ playerState.device_id set → usePlayerStore.deviceId updated

User clicks track in Search
→ handlePlay(uri)
→ playTrack({ uris: [uri], device_id: browserDeviceId })
→ PUT /me/player/play?device_id=<id>  { uris: ["spotify:track:xxx"] }
→ Spotify routes audio to browser SDK player
→ Browser plays audio
```

## Out of Scope

- Showing SDK player status in the UI (ready/not-ready indicator)
- Error feedback when SDK fails to initialise (authentication_error, account_error)
- Replacing PlayerBar controls with SDK-direct controls
- Volume sync between SDK player and PlayerBar slider
