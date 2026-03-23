# Playlist Tracks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the tracks of a Spotify playlist on the `PlaylistDetail` page using data already returned by the existing `GET /playlists/{id}` API call.

**Architecture:** The updated Spotify API returns an `items` field directly on the playlist object (replacing the deprecated `/playlists/{id}/tracks` endpoint). `usePlaylist` already fetches this data — no new API calls needed. We add types, a `PlaylistTrackList` component that reuses `TrackRow`, and wire it into `PlaylistDetail`.

**Tech Stack:** React 18, TypeScript, TanStack Query, Vitest + Testing Library, Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/types/spotify.ts` | Modify | Add `Episode` stub, `PlaylistItem`; add `items?` to `Playlist` |
| `src/components/features/playlist/PlaylistHeader.tsx` | Modify | Update Pick type to include `items`; update song count display |
| `src/components/features/playlist/PlaylistTrackList.tsx` | Create | Renders filtered track list using `TrackRow` |
| `src/components/features/playlist/PlaylistTrackList.test.tsx` | Create | Unit tests for `PlaylistTrackList` |
| `src/pages/PlaylistDetail.tsx` | Modify | Extract `playlist.items?.items` and render `PlaylistTrackList` |
| `src/pages/tests/PlaylistDetail.test.tsx` | Modify | Add track list fixture and assertions |

---

## Task 1: Update types in `src/types/spotify.ts`

**Files:**
- Modify: `src/types/spotify.ts`

- [ ] **Step 1: Add `Episode` stub and `PlaylistItem` interface**

After the `PlaylistTrack` interface (around line 165), add:

```ts
export interface Episode {
  id: string;
  name: string;
  type: 'episode';
  uri: string;
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

- [ ] **Step 2: Add `items` field to `Playlist` interface**

Inside the `Playlist` interface (after the existing `tracks` field, around line 162), add:

```ts
items?: PaginatedResponse<PlaylistItem>;
```

The existing `tracks` field is kept as-is — it is still used for `tracks.total` in `PlaylistHeader`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/frankmendez/Projects/react-typescript-spotify
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/spotify.ts
git commit -m "feat: add Episode, PlaylistItem types and items field to Playlist"
```

---

## Task 2: Update `PlaylistHeader` for the new `items` field

**Files:**
- Modify: `src/components/features/playlist/PlaylistHeader.tsx`

- [ ] **Step 1: Update the Pick type to include `items`**

Change line 4 from:

```ts
type PlaylistHeaderPlaylist = Pick<Playlist, 'name' | 'uri' | 'images' | 'owner' | 'tracks'>;
```

To:

```ts
type PlaylistHeaderPlaylist = Pick<Playlist, 'name' | 'uri' | 'images' | 'owner' | 'tracks' | 'items'>;
```

- [ ] **Step 2: Update the song count to prefer `items.total`**

Change the song count expression (around line 32) from:

```tsx
{playlist.tracks?.total != null && (
  <>{' · '}<span>{playlist.tracks.total} songs</span></>
)}
```

To:

```tsx
{(playlist.items?.total ?? playlist.tracks?.total) != null && (
  <>{' · '}<span>{playlist.items?.total ?? playlist.tracks?.total} songs</span></>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run existing tests to confirm nothing broke**

```bash
npm run test:run
```

Expected: all passing (no changes to test behavior).

- [ ] **Step 5: Commit**

```bash
git add src/components/features/playlist/PlaylistHeader.tsx
git commit -m "feat: update PlaylistHeader to use items.total for song count"
```

---

## Task 3: Create `PlaylistTrackList` component with tests (TDD)

**Files:**
- Create: `src/components/features/playlist/PlaylistTrackList.tsx`
- Create: `src/components/features/playlist/PlaylistTrackList.test.tsx`

### 3a — Write the failing tests first

- [ ] **Step 1: Create `PlaylistTrackList.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { PlaylistTrackList } from './PlaylistTrackList';
import type { PlaylistItem } from '../../../types/spotify';

// Mock usePlaybackControls — TrackRow's onPlay fires play.mutate
const mockPlayMutate = vi.fn();
vi.mock('../../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: () => ({
    play: { mutate: mockPlayMutate },
  }),
}));

// Minimal Track shape required by TrackRow
const makeTrackItem = (id: string): PlaylistItem => ({
  added_at: '2024-01-01T00:00:00Z',
  added_by: { external_urls: { spotify: '' }, href: '', id: 'user1', type: 'user', uri: '' },
  is_local: false,
  item: {
    id,
    name: `Track ${id}`,
    uri: `spotify:track:${id}`,
    type: 'track',
    artists: [{ id: 'a1', name: 'Artist', type: 'artist', href: '', uri: '', external_urls: { spotify: '' } }],
    album: {
      id: 'al1', name: 'Album', images: [], album_type: 'album', total_tracks: 1,
      href: '', uri: '', external_urls: { spotify: '' }, release_date: '2024-01-01',
      release_date_precision: 'day', type: 'album', artists: [],
    },
    disc_number: 1, duration_ms: 180000, explicit: false,
    external_urls: { spotify: '' }, href: '', is_local: false,
    popularity: 50, track_number: 1,
  },
});

const makeEpisodeItem = (id: string): PlaylistItem => ({
  added_at: '2024-01-01T00:00:00Z',
  added_by: { external_urls: { spotify: '' }, href: '', id: 'user1', type: 'user', uri: '' },
  is_local: false,
  item: { id, name: `Episode ${id}`, type: 'episode', uri: `spotify:episode:${id}` },
});

function renderList(items: PlaylistItem[], playlistUri = 'spotify:playlist:pl1') {
  return render(
    <MemoryRouter>
      <PlaylistTrackList items={items} playlistUri={playlistUri} />
    </MemoryRouter>
  );
}

describe('PlaylistTrackList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a row for each track item', () => {
    renderList([makeTrackItem('1'), makeTrackItem('2')]);
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
  });

  it('filters out episode items', () => {
    renderList([makeTrackItem('1'), makeEpisodeItem('ep1')]);
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.queryByText('Episode ep1')).not.toBeInTheDocument();
  });

  it('shows empty state when items array is empty', () => {
    renderList([]);
    expect(screen.getByText(/no tracks available/i)).toBeInTheDocument();
  });

  it('shows empty state when all items are episodes', () => {
    renderList([makeEpisodeItem('ep1'), makeEpisodeItem('ep2')]);
    expect(screen.getByText(/no tracks available/i)).toBeInTheDocument();
  });

  it('renders the Title column header', () => {
    renderList([makeTrackItem('1')]);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test -- --run src/components/features/playlist/PlaylistTrackList.test.tsx
```

Expected: FAIL — `PlaylistTrackList` not found.

### 3b — Implement the component

- [ ] **Step 3: Create `PlaylistTrackList.tsx`**

```tsx
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { TrackRow } from '../TrackRow';
import type { PlaylistItem, Track } from '../../../types/spotify';

interface PlaylistTrackListProps {
  items: PlaylistItem[];
  playlistUri: string;
}

export function PlaylistTrackList({ items, playlistUri }: Readonly<PlaylistTrackListProps>) {
  const { play } = usePlaybackControls();

  const tracks = items.filter(
    (i): i is PlaylistItem & { item: Track } => i.item?.type === 'track'
  );

  if (tracks.length === 0) {
    return (
      <p className="text-text-muted text-sm text-center py-12">No tracks available.</p>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[#121212] px-2 py-2 border-b border-border mb-2">
        <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Title</span>
      </div>
      {tracks.map((playlistItem) => (
        <TrackRow
          key={playlistItem.item.id}
          track={playlistItem.item}
          onPlay={(uri) => play.mutate({ context_uri: playlistUri, offset: { uri } })}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test -- --run src/components/features/playlist/PlaylistTrackList.test.tsx
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/playlist/PlaylistTrackList.tsx \
        src/components/features/playlist/PlaylistTrackList.test.tsx
git commit -m "feat: add PlaylistTrackList component with tests"
```

---

## Task 4: Wire `PlaylistTrackList` into `PlaylistDetail`

**Files:**
- Modify: `src/pages/PlaylistDetail.tsx`
- Modify: `src/pages/tests/PlaylistDetail.test.tsx`

### 4a — Update the test first (TDD)

- [ ] **Step 1: Update `PlaylistDetail.test.tsx`**

Add a `mockPlaylistItem` fixture and a new track list test case. Add this after the `mockPlaylist` const (around line 38):

```ts
const mockTrackForPlaylist = {
  id: 'tr1',
  name: 'Test Track',
  uri: 'spotify:track:tr1',
  type: 'track' as const,
  artists: [{ id: 'a1', name: 'Test Artist', type: 'artist' as const, href: '', uri: '', external_urls: { spotify: '' } }],
  album: {
    id: 'al1', name: 'Test Album', images: [], album_type: 'album' as const, total_tracks: 1,
    href: '', uri: '', external_urls: { spotify: '' }, release_date: '2024-01-01',
    release_date_precision: 'day' as const, type: 'album' as const, artists: [],
  },
  disc_number: 1, duration_ms: 180000, explicit: false,
  external_urls: { spotify: '' }, href: '', is_local: false,
  popularity: 50, track_number: 1,
};

const mockPlaylistItem = {
  added_at: '2024-01-01T00:00:00Z',
  added_by: { external_urls: { spotify: '' }, href: '', id: 'user1', type: 'user' as const, uri: '' },
  is_local: false,
  item: mockTrackForPlaylist,
};

const mockPlaylistWithTracks = {
  ...mockPlaylist,
  items: {
    href: '',
    limit: 20,
    offset: 0,
    total: 1,
    items: [mockPlaylistItem],
  },
};
```

Then add this test inside the `'rendered content'` describe block:

```ts
it('renders track list when playlist has items', () => {
  mockUsePlaylist.mockReturnValue({
    data: mockPlaylistWithTracks,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  renderWithRouter();
  expect(screen.getByText('Test Track')).toBeInTheDocument();
});

it('renders empty state when playlist has no items', () => {
  mockUsePlaylist.mockReturnValue({
    data: { ...mockPlaylist, items: { href: '', limit: 20, offset: 0, total: 0, items: [] } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  renderWithRouter();
  expect(screen.getByText(/no tracks available/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to confirm new cases fail**

```bash
npm run test -- --run src/pages/tests/PlaylistDetail.test.tsx
```

Expected: 2 new tests FAIL, existing tests PASS.

### 4b — Implement the change

- [ ] **Step 3: Update `PlaylistDetail.tsx`**

Replace the full file content with:

```tsx
import { useParams } from 'react-router-dom';
import { usePlaylist } from '../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../hooks/useSpotifyMutations';
import { ErrorState } from '../components/ui/ErrorState';
import { PlaylistDetailSkeleton } from '../components/features/playlist/PlaylistDetailSkeleton';
import { PlaylistHeader } from '../components/features/playlist/PlaylistHeader';
import { PlaylistTrackList } from '../components/features/playlist/PlaylistTrackList';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: playlist, isLoading, isError, refetch } = usePlaylist(id ?? '');
  const { play } = usePlaybackControls();

  if (isLoading) return <PlaylistDetailSkeleton />;
  if (isError || !playlist) {
    return <ErrorState message="Failed to load playlist." onRetry={() => refetch()} />;
  }

  const playlistItems = playlist.items?.items ?? [];

  return (
    <div className="flex flex-col min-h-full" data-testid="playlist-detail">
      <PlaylistHeader
        playlist={playlist}
        onPlay={() => play.mutate({ context_uri: playlist.uri })}
      />
      <div className="flex-1 bg-[#121212] px-6 py-4">
        <PlaylistTrackList items={playlistItems} playlistUri={playlist.uri} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run all PlaylistDetail tests**

```bash
npm run test -- --run src/pages/tests/PlaylistDetail.test.tsx
```

Expected: all tests PASS (including the 2 new ones).

- [ ] **Step 5: Run full test suite to confirm no regressions**

```bash
npm run test:run
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/PlaylistDetail.tsx \
        src/pages/tests/PlaylistDetail.test.tsx
git commit -m "feat: display playlist tracks in PlaylistDetail"
```

---

## Task 5: Final verification

- [ ] **Step 1: TypeScript clean build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run full test suite one more time**

```bash
npm run test:run
```

Expected: all tests PASS.

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Navigate to a playlist (e.g. `http://localhost:5173/playlist/4kSMSMPgaCrR8AgUu9z4tS`) and confirm:
- Playlist header renders (cover art, name, owner, track count)
- Track list appears below header with album art, track name, artist, album
- Clicking a track starts playback in playlist context
- Empty playlists show "No tracks available."

- [ ] **Step 4: Final commit / push**

```bash
git push origin feature/playlist-tracks
```
