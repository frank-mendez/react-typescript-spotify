# Web Playback SDK — In-Browser Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register the browser as a Spotify playback device so clicking a track in search results routes audio to the browser instead of requiring an external device.

**Architecture:** Fix two pre-existing bugs in `useSpotifyPlayer.ts` that clobber `device_id` state, dynamically inject the SDK script, create a new Zustand store (`usePlayerStore`) to hold `deviceId`, mount the player hook in `Dashboard` and sync `device_id` to the store, then pass `deviceId` from the store to the `playTrack` mutation in `Search`.

**Tech Stack:** React 18, TypeScript, Zustand, Spotify Web Playback SDK, Vitest + React Testing Library

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/hooks/useSpotifyPlayer.ts` — fix 2 bugs + add dynamic script loading |
| Create | `src/stores/usePlayerStore.ts` — `{ deviceId, setDeviceId }` Zustand store |
| Create | `src/stores/tests/usePlayerStore.test.ts` |
| Modify | `src/pages/Dashboard.tsx` — mount `useSpotifyPlayer`, sync `device_id` to store |
| Modify | `src/pages/tests/Dashboard.test.tsx` — add mocks for new hooks |
| Modify | `src/hooks/tests/useSpotifyPlayer.test.ts` — add tests for bug fixes + script loading |
| Modify | `src/components/features/Search.tsx` — read `deviceId` from store, pass to `playTrack` |

---

## Task 1: Fix two bugs in `useSpotifyPlayer.ts`

**Files:**
- Modify: `src/hooks/useSpotifyPlayer.ts:125-147`
- Modify: `src/hooks/tests/useSpotifyPlayer.test.ts`

### Background

**Bug 1 (line 128-136):** The `player_state_changed` listener passes `device_id: null` as a literal, overwriting the `device_id` set by the `ready` event on every playback update.

**Bug 2 (line 145-147):** The `not_ready` listener only calls `setIsReady(false)` — it never clears `device_id`, leaving a stale ID that causes 404 errors on play calls.

- [ ] **Step 1: Write the failing tests**

Add to `src/hooks/tests/useSpotifyPlayer.test.ts`, inside the `describe('useSpotifyPlayer')` block, after the existing tests:

```ts
import { act } from '@testing-library/react';

// Helper: extract a named listener from the mock
function getListener(eventName: string) {
  const call = mockPlayer.addListener.mock.calls.find(([e]) => e === eventName);
  return call?.[1] as ((data: unknown) => void) | undefined;
}

const mockTrackState = {
  paused: false,
  position: 100,
  track_window: {
    current_track: {
      id: '1', uri: 'spotify:track:1', name: 'Song', is_playable: true, duration_ms: 3000,
      album: { uri: 'a', name: 'Album', images: [] },
      artists: [{ uri: 'b', name: 'Artist' }],
    },
    previous_tracks: [],
    next_tracks: [],
  },
};

it('player_state_changed preserves device_id set by ready event', async () => {
  const { result } = renderHook(() => useSpotifyPlayer());

  await act(async () => {
    getListener('ready')?.({ device_id: 'test-device-123' });
  });
  expect(result.current.playerState.device_id).toBe('test-device-123');

  await act(async () => {
    getListener('player_state_changed')?.(mockTrackState);
  });

  expect(result.current.playerState.device_id).toBe('test-device-123');
  expect(result.current.playerState.is_paused).toBe(false);
});

it('not_ready clears device_id', async () => {
  const { result } = renderHook(() => useSpotifyPlayer());

  await act(async () => {
    getListener('ready')?.({ device_id: 'test-device-123' });
  });
  expect(result.current.playerState.device_id).toBe('test-device-123');

  await act(async () => {
    getListener('not_ready')?.({ device_id: 'test-device-123' });
  });

  expect(result.current.playerState.device_id).toBeNull();
  expect(result.current.is_ready).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/hooks/tests/useSpotifyPlayer.test.ts
```

Expected: 2 new tests FAIL (Bug 1 test: `device_id` becomes `null`; Bug 2 test: `device_id` stays non-null)

- [ ] **Step 3: Fix Bug 1 — `player_state_changed` clobbers `device_id`**

In `src/hooks/useSpotifyPlayer.ts`, replace lines 125-136:

```ts
// BEFORE
spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
  if (!state) return;

  setPlayerState({
    is_paused: state.paused,
    is_active: !!state.track_window?.current_track,
    position: state.position,
    duration: state.track_window?.current_track?.duration_ms || 0,
    current_track: state.track_window?.current_track || null,
    device_id: null, // Will be set when ready
  });
});
```

```ts
// AFTER
spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
  if (!state) return;

  setPlayerState(prev => ({
    ...prev,
    is_paused: state.paused,
    is_active: !!state.track_window?.current_track,
    position: state.position,
    duration: state.track_window?.current_track?.duration_ms || 0,
    current_track: state.track_window?.current_track || null,
  }));
});
```

- [ ] **Step 4: Fix Bug 2 — `not_ready` does not clear `device_id`**

In `src/hooks/useSpotifyPlayer.ts`, replace lines 144-147:

```ts
// BEFORE
spotifyPlayer.addListener('not_ready', (_: { device_id: string }) => {
  setIsReady(false);
});
```

```ts
// AFTER
spotifyPlayer.addListener('not_ready', (_: { device_id: string }) => {
  setIsReady(false);
  setPlayerState(prev => ({ ...prev, device_id: null }));
});
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/hooks/tests/useSpotifyPlayer.test.ts
```

Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useSpotifyPlayer.ts src/hooks/tests/useSpotifyPlayer.test.ts
git commit -m "fix: preserve device_id across player_state_changed and not_ready events"
```

---

## Task 2: Add dynamic SDK script injection to `useSpotifyPlayer.ts`

**Files:**
- Modify: `src/hooks/useSpotifyPlayer.ts:156-169`
- Modify: `src/hooks/tests/useSpotifyPlayer.test.ts`

### Background

The Spotify Web Playback SDK script must be loaded dynamically (not via `index.html`) so that `window.onSpotifyWebPlaybackSDKReady` is set before the script fires it. A guard on `id='spotify-player-script'` prevents double-injection across React re-mounts.

- [ ] **Step 1: Write the failing test**

Add inside `describe('useSpotifyPlayer')` in `src/hooks/tests/useSpotifyPlayer.test.ts`:

```ts
it('injects SDK script tag when window.Spotify is not loaded', () => {
  const savedSpotify = window.Spotify;
  window.Spotify = undefined as unknown as typeof window.Spotify;

  const appendSpy = vi.spyOn(document.body, 'appendChild');

  renderHook(() => useSpotifyPlayer());

  expect(appendSpy).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'spotify-player-script' }),
  );

  // cleanup
  appendSpy.mockRestore();
  document.getElementById('spotify-player-script')?.remove();
  window.Spotify = savedSpotify;
});

it('does not inject SDK script if already present in DOM', () => {
  const savedSpotify = window.Spotify;
  window.Spotify = undefined as unknown as typeof window.Spotify;

  const existing = document.createElement('script');
  existing.id = 'spotify-player-script';
  document.body.appendChild(existing);

  const appendSpy = vi.spyOn(document.body, 'appendChild');

  renderHook(() => useSpotifyPlayer());

  expect(appendSpy).not.toHaveBeenCalledWith(
    expect.objectContaining({ id: 'spotify-player-script' }),
  );

  // cleanup
  appendSpy.mockRestore();
  existing.remove();
  window.Spotify = savedSpotify;
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/hooks/tests/useSpotifyPlayer.test.ts
```

Expected: 2 new tests FAIL (no script tag injected yet)

- [ ] **Step 3: Add script injection to the `else` branch in `useSpotifyPlayer.ts`**

In `src/hooks/useSpotifyPlayer.ts`, replace the `useEffect` body (lines 156-169):

```ts
// BEFORE
useEffect(() => {
  if (window.Spotify) {
    initializePlayer();
  } else {
    window.onSpotifyWebPlaybackSDKReady = initializePlayer;
  }

  return () => {
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }
  };
}, [initializePlayer]);
```

```ts
// AFTER
useEffect(() => {
  if (window.Spotify) {
    initializePlayer();
  } else {
    window.onSpotifyWebPlaybackSDKReady = initializePlayer;

    if (!document.getElementById('spotify-player-script')) {
      const script = document.createElement('script');
      script.id = 'spotify-player-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  return () => {
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }
  };
}, [initializePlayer]);
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/hooks/tests/useSpotifyPlayer.test.ts
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpotifyPlayer.ts src/hooks/tests/useSpotifyPlayer.test.ts
git commit -m "feat: dynamically inject Spotify Web Playback SDK script"
```

---

## Task 3: Create `usePlayerStore` Zustand store

**Files:**
- Create: `src/stores/usePlayerStore.ts`
- Create: `src/stores/tests/usePlayerStore.test.ts`

### Background

`usePlayerStore` follows the exact pattern of `src/stores/useContentStore.ts`. It holds `deviceId` (the browser SDK device ID) so any component can read it without prop-drilling.

- [ ] **Step 1: Write the failing test**

Create `src/stores/tests/usePlayerStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayerStore } from '../usePlayerStore';

describe('usePlayerStore', () => {
  beforeEach(() => {
    // Reset Zustand singleton state between tests
    usePlayerStore.setState({ deviceId: null });
  });

  it('initial deviceId is null', () => {
    const { result } = renderHook(() => usePlayerStore());
    expect(result.current.deviceId).toBeNull();
  });

  it('setDeviceId updates deviceId', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.setDeviceId('abc-123');
    });

    expect(result.current.deviceId).toBe('abc-123');
  });

  it('setDeviceId can reset deviceId to null', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.setDeviceId('abc-123');
    });
    act(() => {
      result.current.setDeviceId(null);
    });

    expect(result.current.deviceId).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/stores/tests/usePlayerStore.test.ts
```

Expected: FAIL — `Cannot find module '../usePlayerStore'`

- [ ] **Step 3: Create the store**

Create `src/stores/usePlayerStore.ts`:

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

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/stores/tests/usePlayerStore.test.ts
```

Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add src/stores/usePlayerStore.ts src/stores/tests/usePlayerStore.test.ts
git commit -m "feat: add usePlayerStore for browser SDK device ID"
```

---

## Task 4: Wire `Dashboard` to sync `device_id` into the store

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/pages/tests/Dashboard.test.tsx`

### Background

`Dashboard` is the authenticated root — the right place to mount `useSpotifyPlayer` once and sync `playerState.device_id` to `usePlayerStore` via a `useEffect`. `Search` and other children then read `deviceId` from the store without needing `useSpotifyPlayer` themselves.

- [ ] **Step 1: Update Dashboard test to mock new hooks**

In `src/pages/tests/Dashboard.test.tsx`, add two new `vi.mock` calls after the existing ones:

```ts
vi.mock('../../hooks/useSpotifyPlayer', () => ({
  useSpotifyPlayer: () => ({
    playerState: {
      device_id: null,
      is_paused: true,
      is_active: false,
      position: 0,
      duration: 0,
      current_track: null,
    },
    is_ready: false,
    togglePlay: vi.fn(),
    nextTrack: vi.fn(),
    previousTrack: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
  }),
}));

vi.mock('../../stores/usePlayerStore', () => ({
  usePlayerStore: () => ({
    deviceId: null,
    setDeviceId: vi.fn(),
  }),
}));
```

- [ ] **Step 2: Run Dashboard tests to confirm they still pass (no regressions)**

```bash
npx vitest run src/pages/tests/Dashboard.test.tsx
```

Expected: 3/3 PASS (mocks are not yet needed because Dashboard doesn't call these hooks yet — this is fine)

- [ ] **Step 3: Update `Dashboard.tsx` to mount the player and sync device_id**

In `src/pages/Dashboard.tsx`:

Add imports at the top (after existing imports):
```ts
import { useEffect } from 'react';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { usePlayerStore } from '../stores/usePlayerStore';
```

Replace the `Dashboard` component body:
```ts
// BEFORE
const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen bg-bg" data-testid="dashboard-element">
```

```ts
// AFTER
const Dashboard = () => {
  const { playerState } = useSpotifyPlayer();
  const { setDeviceId } = usePlayerStore();

  useEffect(() => {
    setDeviceId(playerState.device_id);
  }, [playerState.device_id, setDeviceId]);

  return (
    <div className="flex flex-col h-screen bg-bg" data-testid="dashboard-element">
```

- [ ] **Step 4: Run all tests to verify no regressions**

```bash
npx vitest run src/pages/tests/Dashboard.test.tsx
```

Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/tests/Dashboard.test.tsx
git commit -m "feat: mount Web Playback SDK in Dashboard and sync device_id to store"
```

---

## Task 5: Update `Search` to pass `device_id` when playing

**Files:**
- Modify: `src/components/features/Search.tsx:32-34`

### Background

`handlePlay` currently calls `playTrack({ uris: [uri] })` with no `device_id`. After this task it reads `deviceId` from `usePlayerStore` and passes it if available, so `PUT /me/player/play?device_id=<id>` routes audio to the browser player. If `deviceId` is null (SDK not ready), the call proceeds as before — graceful degradation.

- [ ] **Step 1: Update `Search.tsx`**

In `src/components/features/Search.tsx`, add the import for `usePlayerStore` after the existing `useContentStore` import:

```ts
import { usePlayerStore } from '../../stores/usePlayerStore';
```

Replace lines 32-34 (the `play` / `handlePlay` block):

```ts
// BEFORE
const { play } = usePlaybackControls();
const { mutate: playTrack } = play;
const handlePlay = useCallback((uri: string) => playTrack({ uris: [uri] }), [playTrack]);
```

```ts
// AFTER
const { play } = usePlaybackControls();
const { mutate: playTrack } = play;
const { deviceId } = usePlayerStore();

const handlePlay = useCallback(
  (uri: string) => playTrack({ uris: [uri], device_id: deviceId ?? undefined }),
  [playTrack, deviceId],
);
```

- [ ] **Step 2: Run the full test suite and build**

```bash
npx vitest run && npm run build
```

Expected: all tests pass, build succeeds with no TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/components/features/Search.tsx
git commit -m "feat: route search play calls to browser SDK device"
```

---

## Final Verification

- [ ] **Run full test suite with coverage**

```bash
npm run coverage
```

Expected: all tests pass, coverage ≥ 60%

- [ ] **Manual smoke test**
  1. `npm run dev` and open `http://127.0.0.1:5173/`
  2. Log in with a Spotify Premium account
  3. Open browser DevTools → Network tab
  4. Navigate to Search, type an artist name
  5. Click a track row — verify `PUT /me/player/play` request includes `device_id` query param
  6. Confirm audio plays in the browser
