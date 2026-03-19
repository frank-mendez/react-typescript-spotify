# Click-to-Play Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hover-activated play button to search result track rows so clicking a track plays it on the user's active Spotify device.

**Architecture:** Create a reusable `TrackRow` component that wraps a track in a single `<button>`. A decorative `Play` icon overlay (`pointer-events-none`) appears on hover — the outer button handles all clicks. Update `Search.tsx` to use `TrackRow` and wire `onPlay` to `play.mutate({ uris: [uri] })` from `usePlaybackControls`.

**Tech Stack:** React, TypeScript, Tailwind CSS, lucide-react, `@tanstack/react-query` mutations

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/components/features/TrackRow.tsx` | Create | Reusable track row with hover play button |
| `src/components/features/TrackRow.test.tsx` | Create | Unit tests for TrackRow |
| `src/components/features/Search.tsx` | Modify | Replace inline track div with TrackRow + wire onPlay |

---

### Task 1: Create `TrackRow` component with tests

**Files:**
- Create: `src/components/features/TrackRow.tsx`
- Create: `src/components/features/TrackRow.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/features/TrackRow.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TrackRow } from './TrackRow';
import type { Track } from '../../types/spotify';

const mockTrack: Track = {
  id: '1',
  name: 'Test Song',
  uri: 'spotify:track:1',
  artists: [{ id: 'a1', name: 'Test Artist', type: 'artist', href: '', uri: '', external_urls: { spotify: '' } }],
  album: {
    id: 'al1',
    name: 'Test Album',
    images: [
      { url: 'http://img.test/large.jpg' },
      { url: 'http://img.test/medium.jpg' },
      { url: 'http://img.test/small.jpg' },
    ],
    album_type: 'album',
    total_tracks: 10,
    href: '',
    uri: '',
    external_urls: { spotify: '' },
    release_date: '2024-01-01',
    release_date_precision: 'day',
    type: 'album',
    artists: [],
  },
  disc_number: 1,
  duration_ms: 200000,
  explicit: false,
  external_urls: { spotify: '' },
  href: '',
  is_local: false,
  popularity: 80,
  track_number: 1,
  type: 'track',
};

describe('TrackRow', () => {
  it('renders track name and artist', () => {
    render(<TrackRow track={mockTrack} onPlay={vi.fn()} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('renders album art with small image preferred', () => {
    render(<TrackRow track={mockTrack} onPlay={vi.fn()} />);
    const img = screen.getByRole('img', { name: 'Test Album' });
    expect(img).toHaveAttribute('src', 'http://img.test/small.jpg');
  });

  it('renders placeholder when album is undefined', () => {
    const trackNoAlbum = { ...mockTrack, album: undefined };
    render(<TrackRow track={trackNoAlbum} onPlay={vi.fn()} />);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('calls onPlay with track uri when row button is clicked', () => {
    const onPlay = vi.fn();
    render(<TrackRow track={mockTrack} onPlay={onPlay} />);
    // The entire row is one button — accessible name comes from visible text
    fireEvent.click(screen.getByRole('button', { name: /test song/i }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith('spotify:track:1');
  });

  it('renders a play icon overlay (decorative, no separate button)', () => {
    render(<TrackRow track={mockTrack} onPlay={vi.fn()} />);
    // Only one interactive element — no nested buttons
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/components/features/TrackRow.test.tsx
```

Expected: FAIL — `TrackRow` not found.

- [ ] **Step 3: Create `TrackRow` component**

Create `src/components/features/TrackRow.tsx`:

```tsx
import { Play } from 'lucide-react';
import type { Track } from '../../types/spotify';

interface TrackRowProps {
  track: Track;
  onPlay: (uri: string) => void;
}

export function TrackRow({ track, onPlay }: TrackRowProps) {
  const imageUrl =
    track.album?.images?.[2]?.url ?? track.album?.images?.[0]?.url;

  return (
    <button
      onClick={() => onPlay(track.uri)}
      className="group flex items-center gap-3 p-2 rounded hover:bg-surface-hover transition-colors text-left w-full"
    >
      {/* Album art with decorative hover play overlay */}
      <div className="relative w-10 h-10 shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={track.album?.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-border" />
        )}
        {/* Decorative overlay — pointer-events-none so clicks pass to the outer button */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      </div>

      {/* Track info — provides accessible name for the outer button */}
      <div className="flex flex-col min-w-0">
        <span className="text-text-primary text-sm truncate">{track.name}</span>
        <span className="text-text-muted text-xs truncate">
          {track.artists.map((a) => a.name).join(', ')}
        </span>
      </div>
    </button>
  );
}
```

Key design decisions:
- Single `<button>` — no nested interactive elements (valid HTML)
- Play overlay is `pointer-events-none` + `aria-hidden` — purely decorative, clicks pass through to the button
- Accessible name derives from visible text children (track name + artist) — no redundant `aria-label`

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/components/features/TrackRow.test.tsx
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/TrackRow.tsx src/components/features/TrackRow.test.tsx
git commit -m "feat: add TrackRow component with hover play button"
```

---

### Task 2: Wire `TrackRow` into `Search.tsx`

**Files:**
- Modify: `src/components/features/Search.tsx`

- [ ] **Step 1: Update `Search.tsx`**

Add two imports after the existing import block:

```tsx
import { TrackRow } from './TrackRow';
import { usePlaybackControls } from '../../hooks/useSpotifyMutations';
```

Inside the `Search` component body, add after the existing hooks:

```tsx
const { play } = usePlaybackControls();
const handlePlay = (uri: string) => play.mutate({ uris: [uri] });
```

Replace the track `<div>` inside the Songs section map (the element with `key={track.id}`):

```tsx
// BEFORE:
<div
  key={track.id}
  className="flex items-center gap-3 p-2 rounded hover:bg-surface-hover transition-colors"
>
  <img
    src={track.album?.images?.[2]?.url}
    alt={track.album?.name}
    className="w-10 h-10 rounded object-cover shrink-0"
  />
  <div className="flex flex-col min-w-0">
    <span className="text-text-primary text-sm truncate">{track.name}</span>
    <span className="text-text-muted text-xs truncate">
      {track.artists.map((a) => a.name).join(', ')}
    </span>
  </div>
</div>

// AFTER:
<TrackRow
  key={track.id}
  track={track}
  onPlay={handlePlay}
/>
```

- [ ] **Step 2: Run the full test suite**

```bash
npx vitest run
```

Expected: All existing tests PASS, no regressions.

- [ ] **Step 3: Manual test**

1. Run `npm run dev` and open `http://127.0.0.1:5173`
2. Open Spotify on any device (desktop app or mobile) — this registers an active device
3. Navigate to Search, type a query
4. Hover over a track row — the play overlay should appear over the album art
5. Click anywhere on the row — the track should start playing on your Spotify device
6. The PlayerBar should update to reflect the new track

- [ ] **Step 4: Commit**

```bash
git add src/components/features/Search.tsx
git commit -m "feat: wire click-to-play into search results"
```
