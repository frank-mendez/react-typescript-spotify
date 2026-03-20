# Recently Played Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Recently Played" section to the Dashboard home view showing a mixed grid of albums and artists as horizontal pill cards.

**Architecture:** A new `useRecentlyPlayed` query hook fetches `/me/player/recently-played`. A `RecentlyPlayedSection` component derives up to 8 unique `RecentItem` entries (albums + artists) from the response and renders them as `RecentlyPlayedCard` pill components inside a reusable `HomeSection` wrapper. The Dashboard's `MainPanel` PLAYER fallthrough is updated to render this section instead of the current placeholder message.

**Tech Stack:** React, TypeScript, Tailwind CSS, React Query (`@tanstack/react-query`), Vitest, React Testing Library

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/hooks/useSpotifyQueries.ts` | Add `useRecentlyPlayed` hook |
| Modify | `src/hooks/tests/useSpotifyQueries.test.ts` | Tests for `useRecentlyPlayed` |
| Create | `src/components/features/home/HomeSection.tsx` | Reusable section shell (title + children) |
| Create | `src/components/features/home/HomeSection.test.tsx` | Tests for `HomeSection` |
| Create | `src/components/features/home/RecentlyPlayedCard.tsx` | Horizontal pill card component |
| Create | `src/components/features/home/RecentlyPlayedCard.test.tsx` | Tests for `RecentlyPlayedCard` |
| Create | `src/components/features/home/RecentlyPlayedSection.tsx` | Fetches data, derives items, renders grid |
| Create | `src/components/features/home/RecentlyPlayedSection.test.tsx` | Tests for `RecentlyPlayedSection` |
| Modify | `src/pages/Dashboard.tsx` | Wire `RecentlyPlayedSection` into `MainPanel` |
| Modify | `src/pages/tests/Dashboard.test.tsx` | Add `useRecentlyPlayed` to query mock |

---

## Task 1: Add `useRecentlyPlayed` hook

**Files:**
- Modify: `src/hooks/useSpotifyQueries.ts`
- Modify: `src/hooks/tests/useSpotifyQueries.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/hooks/tests/useSpotifyQueries.test.ts`.

**a)** Add `playback` to the existing `mockApi` const object (do NOT replace the whole object — just add the new property):

```ts
// existing object gains one new key:
playback: { getRecentlyPlayedTracks: vi.fn() },
```

**b)** Extend the existing named import on line 6 to include `useRecentlyPlayed`:

```ts
// before:
import { usePlaylist, useAlbumTracks, useArtistAlbums } from '../useSpotifyQueries';
// after:
import { usePlaylist, useAlbumTracks, useArtistAlbums, useRecentlyPlayed } from '../useSpotifyQueries';
```

**c)** Add the test suite at the end of the file:

```ts
describe('useRecentlyPlayed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('fetches recently played tracks with default limit', async () => {
    const mockData = { items: [], cursors: {}, href: '', limit: 20 };
    mockApi.playback.getRecentlyPlayedTracks.mockResolvedValue(mockData);

    const { result } = renderHook(() => useRecentlyPlayed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.playback.getRecentlyPlayedTracks).toHaveBeenCalledWith({ limit: 20 });
    expect(result.current.data).toEqual(mockData);
  });

  it('fetches recently played tracks with custom limit', async () => {
    const mockData = { items: [], cursors: {}, href: '', limit: 5 };
    mockApi.playback.getRecentlyPlayedTracks.mockResolvedValue(mockData);

    const { result } = renderHook(() => useRecentlyPlayed(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.playback.getRecentlyPlayedTracks).toHaveBeenCalledWith({ limit: 5 });
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => useRecentlyPlayed(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.playback.getRecentlyPlayedTracks).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npx vitest run src/hooks/tests/useSpotifyQueries.test.ts
```

Expected: `useRecentlyPlayed` tests fail with "is not a function" or import error.

- [ ] **Step 3: Add the hook to `useSpotifyQueries.ts`**

Append at the end of `src/hooks/useSpotifyQueries.ts`:

```ts
export const useRecentlyPlayed = (limit = 20) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ['spotify', 'recently-played', limit],
    queryFn: () => requireApi(api).playback.getRecentlyPlayedTracks({ limit }),
    enabled: api !== null,
    staleTime: 2 * 60 * 1000,
  });
};
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
npx vitest run src/hooks/tests/useSpotifyQueries.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpotifyQueries.ts src/hooks/tests/useSpotifyQueries.test.ts
git commit -m "feat: add useRecentlyPlayed query hook"
```

---

## Task 2: Create `HomeSection` component

**Files:**
- Create: `src/components/features/home/HomeSection.tsx`
- Create: `src/components/features/home/HomeSection.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/features/home/HomeSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HomeSection } from './HomeSection';

describe('HomeSection', () => {
  it('renders the title', () => {
    render(<HomeSection title="Recently Played"><div /></HomeSection>);
    expect(screen.getByText('Recently Played')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <HomeSection title="Test">
        <span data-testid="child">hello</span>
      </HomeSection>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders title as an h2', () => {
    render(<HomeSection title="My Section"><div /></HomeSection>);
    expect(screen.getByRole('heading', { level: 2, name: 'My Section' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npx vitest run src/components/features/home/HomeSection.test.tsx
```

Expected: Fails — module not found.

- [ ] **Step 3: Implement `HomeSection`**

Create `src/components/features/home/HomeSection.tsx`:

```tsx
import type { ReactNode } from 'react';

interface HomeSectionProps {
  title: string;
  children: ReactNode;
}

export function HomeSection({ title, children }: Readonly<HomeSectionProps>) {
  return (
    <section>
      <h2 className="text-text-primary font-bold text-xl mb-3">{title}</h2>
      {children}
    </section>
  );
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
npx vitest run src/components/features/home/HomeSection.test.tsx
```

Expected: All 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/home/HomeSection.tsx src/components/features/home/HomeSection.test.tsx
git commit -m "feat: add reusable HomeSection wrapper component"
```

---

## Task 3: Create `RecentlyPlayedCard` component

**Files:**
- Create: `src/components/features/home/RecentlyPlayedCard.tsx`
- Create: `src/components/features/home/RecentlyPlayedCard.test.tsx`

The card accepts a `RecentItem` (defined locally in this file and exported) and an `onPlay` callback. Clicking the card body navigates; the play button calls `onPlay` without navigating.

- [ ] **Step 1: Write the failing tests**

Create `src/components/features/home/RecentlyPlayedCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { RecentlyPlayedCard } from './RecentlyPlayedCard';
import type { RecentItem } from './RecentlyPlayedCard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const albumItem: RecentItem = {
  id: 'album1',
  name: 'Test Album',
  imageUrl: 'https://img.test/cover.jpg',
  type: 'album',
  uri: 'spotify:album:album1',
  navigationPath: '/album/album1',
  subtitle: 'Test Artist',
};

const artistItem: RecentItem = {
  id: 'artist1',
  name: 'Test Artist',
  imageUrl: undefined,
  type: 'artist',
  uri: 'spotify:artist:artist1',
  navigationPath: '/artist/artist1',
  subtitle: 'Artist',
};

function renderCard(item = albumItem, onPlay = vi.fn()) {
  return render(
    <MemoryRouter>
      <RecentlyPlayedCard item={item} onPlay={onPlay} />
    </MemoryRouter>
  );
}

describe('RecentlyPlayedCard', () => {
  it('renders item name and subtitle', () => {
    renderCard();
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('renders album image when imageUrl is provided', () => {
    renderCard();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://img.test/cover.jpg');
  });

  it('renders initials fallback when imageUrl is undefined', () => {
    renderCard(artistItem);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('TE')).toBeInTheDocument(); // "Test Artist" → "TE"
  });

  it('calls onPlay with item uri when play button is clicked', () => {
    const onPlay = vi.fn();
    renderCard(albumItem, onPlay);
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(onPlay).toHaveBeenCalledWith('spotify:album:album1');
  });

  it('does not navigate when play button is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to navigationPath when card body is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByTestId('card-body'));
    expect(mockNavigate).toHaveBeenCalledWith('/album/album1');
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npx vitest run src/components/features/home/RecentlyPlayedCard.test.tsx
```

Expected: Fails — module not found.

- [ ] **Step 3: Implement `RecentlyPlayedCard`**

Create `src/components/features/home/RecentlyPlayedCard.tsx`:

```tsx
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type RecentItem = {
  id: string;
  name: string;
  imageUrl?: string;
  type: 'album' | 'artist';
  uri: string;
  navigationPath: string;
  subtitle: string;
};

interface RecentlyPlayedCardProps {
  item: RecentItem;
  onPlay: (uri: string) => void;
}

export function RecentlyPlayedCard({ item, onPlay }: Readonly<RecentlyPlayedCardProps>) {
  const navigate = useNavigate();
  const initials = item.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors group overflow-hidden cursor-pointer">
      {/* Image / initials fallback */}
      <div className="w-16 h-16 shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-16 h-16 object-cover"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-accent/20 text-accent font-bold text-lg">
            {initials}
          </div>
        )}
      </div>

      {/* Text */}
      <div
        data-testid="card-body"
        className="flex-1 px-3 min-w-0"
        onClick={() => navigate(item.navigationPath)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(item.navigationPath); }}
        role="link"
        tabIndex={0}
      >
        <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
        <p className="text-text-muted text-xs truncate">{item.subtitle}</p>
      </div>

      {/* Play button */}
      <div className="pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          aria-label={`Play ${item.name}`}
          onClick={(e) => { e.stopPropagation(); onPlay(item.uri); }}
          className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Play className="w-4 h-4 text-black fill-black ml-0.5" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
npx vitest run src/components/features/home/RecentlyPlayedCard.test.tsx
```

Expected: All 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/home/RecentlyPlayedCard.tsx src/components/features/home/RecentlyPlayedCard.test.tsx
git commit -m "feat: add RecentlyPlayedCard pill component"
```

---

## Task 4: Create `RecentlyPlayedSection` component

**Files:**
- Create: `src/components/features/home/RecentlyPlayedSection.tsx`
- Create: `src/components/features/home/RecentlyPlayedSection.test.tsx`

This component owns the derivation logic: iterating the hook response to build `RecentItem[]` (max 8), then rendering the grid.

- [ ] **Step 1: Write the failing tests**

Create `src/components/features/home/RecentlyPlayedSection.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { RecentlyPlayedSection } from './RecentlyPlayedSection';

// Mock hooks
vi.mock('../../../hooks/useSpotifyQueries', () => ({
  useRecentlyPlayed: vi.fn(),
}));

vi.mock('../../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: vi.fn(() => ({
    play: { mutate: vi.fn() },
  })),
}));

import { useRecentlyPlayed } from '../../../hooks/useSpotifyQueries';

const makeTrack = (id: string, albumId: string, artistId: string) => ({
  track: {
    id,
    name: `Track ${id}`,
    uri: `spotify:track:${id}`,
    artists: [{
      id: artistId,
      name: `Artist ${artistId}`,
      type: 'artist' as const,
      href: '',
      uri: `spotify:artist:${artistId}`,
      external_urls: { spotify: '' },
    }],
    album: {
      id: albumId,
      name: `Album ${albumId}`,
      uri: `spotify:album:${albumId}`,
      images: [{ url: `https://img/${albumId}.jpg` }],
      album_type: 'album' as const,
      total_tracks: 10,
      href: '',
      release_date: '2024-01-01',
      release_date_precision: 'day' as const,
      type: 'album' as const,
      external_urls: { spotify: '' },
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
    type: 'track' as const,
  },
  played_at: '2024-01-01T00:00:00Z',
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc },
    createElement(MemoryRouter, null, children)
  );
}

describe('RecentlyPlayedSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders skeleton pills while loading (no section title)', () => {
    vi.mocked(useRecentlyPlayed).mockReturnValue({ isLoading: true, data: undefined } as never);
    const { container } = render(<RecentlyPlayedSection />, { wrapper });
    expect(screen.queryByText('Recently Played')).not.toBeInTheDocument();
    expect(container.firstChild).toBeTruthy(); // skeleton grid is rendered
  });

  it('renders nothing when data is undefined (error state)', () => {
    vi.mocked(useRecentlyPlayed).mockReturnValue({ isLoading: false, data: undefined } as never);
    const { container } = render(<RecentlyPlayedSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when data is empty', () => {
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items: [], cursors: {}, href: '', limit: 20 },
    } as never);
    const { container } = render(<RecentlyPlayedSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders section title and cards when data is present', () => {
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items: [makeTrack('t1', 'a1', 'ar1')], cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    expect(screen.getByText('Recently Played')).toBeInTheDocument();
    expect(screen.getByText('Album a1')).toBeInTheDocument();
    expect(screen.getByText('Artist ar1')).toBeInTheDocument();
  });

  it('deduplicates albums across tracks', () => {
    const items = [
      makeTrack('t1', 'same-album', 'ar1'),
      makeTrack('t2', 'same-album', 'ar2'),
    ];
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items, cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    // 'Album same-album' should appear only once
    expect(screen.getAllByText('Album same-album')).toHaveLength(1);
  });

  it('deduplicates artists across tracks', () => {
    const items = [
      makeTrack('t1', 'al1', 'same-artist'),
      makeTrack('t2', 'al2', 'same-artist'),
    ];
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items, cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    expect(screen.getAllByText('Artist same-artist')).toHaveLength(1);
  });

  it('caps output at 8 items', () => {
    // 6 unique tracks, each with unique album+artist → up to 12 items, capped at 8
    const items = Array.from({ length: 6 }, (_, i) =>
      makeTrack(`t${i}`, `al${i}`, `ar${i}`)
    );
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items, cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    const playButtons = screen.getAllByRole('button', { name: /play/i });
    expect(playButtons).toHaveLength(8);
  });

  it('still emits artist when track.album is absent', () => {
    const trackNoAlbum = makeTrack('t1', 'al1', 'ar1');
    (trackNoAlbum.track as { album?: unknown }).album = undefined;
    vi.mocked(useRecentlyPlayed).mockReturnValue({
      isLoading: false,
      data: { items: [trackNoAlbum], cursors: {}, href: '', limit: 20 },
    } as never);
    render(<RecentlyPlayedSection />, { wrapper });
    expect(screen.getByText('Artist ar1')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npx vitest run src/components/features/home/RecentlyPlayedSection.test.tsx
```

Expected: Fails — module not found.

- [ ] **Step 3: Implement `RecentlyPlayedSection`**

Create `src/components/features/home/RecentlyPlayedSection.tsx`:

```tsx
import type { Track } from '../../../types/spotify';
import { useRecentlyPlayed } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { Skeleton } from '../../ui/skeleton';
import { HomeSection } from './HomeSection';
import { RecentlyPlayedCard } from './RecentlyPlayedCard';
import type { RecentItem } from './RecentlyPlayedCard';

function deriveItems(
  items: Array<{ track: Track }>,
  max = 8
): RecentItem[] {
  const seen = new Set<string>();
  const result: RecentItem[] = [];

  for (const { track } of items) {
    if (result.length >= max) break;

    if (track.album && !seen.has(`album:${track.album.id}`)) {
      seen.add(`album:${track.album.id}`);
      result.push({
        id: track.album.id,
        name: track.album.name,
        imageUrl: track.album.images[1]?.url ?? track.album.images[0]?.url,
        type: 'album',
        uri: track.album.uri,
        navigationPath: `/album/${track.album.id}`,
        subtitle: track.artists.map((a) => a.name).join(', '),
      });
    }

    if (result.length >= max) break;

    const artist = track.artists[0];
    if (artist && !seen.has(`artist:${artist.id}`)) {
      seen.add(`artist:${artist.id}`);
      result.push({
        id: artist.id,
        name: artist.name,
        imageUrl: undefined,
        type: 'artist',
        uri: artist.uri,
        navigationPath: `/artist/${artist.id}`,
        subtitle: 'Artist',
      });
    }
  }

  return result;
}

export function RecentlyPlayedSection() {
  const { data, isLoading } = useRecentlyPlayed(20);
  const { play } = usePlaybackControls();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.items?.length) return null;

  const items = deriveItems(data.items);
  if (!items.length) return null;

  return (
    <HomeSection title="Recently Played">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((item) => (
          <RecentlyPlayedCard
            key={item.id}
            item={item}
            onPlay={(uri) => play.mutate({ context_uri: uri })}
          />
        ))}
      </div>
    </HomeSection>
  );
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
npx vitest run src/components/features/home/RecentlyPlayedSection.test.tsx
```

Expected: All 8 tests pass.

- [ ] **Step 5: Run type check**

```bash
npm run build 2>&1 | grep -E "error TS"
```

Expected: No TypeScript errors in the new files.

- [ ] **Step 6: Commit**

```bash
git add src/components/features/home/RecentlyPlayedSection.tsx src/components/features/home/RecentlyPlayedSection.test.tsx
git commit -m "feat: add RecentlyPlayedSection with derivation logic"
```

---

## Task 5: Wire `RecentlyPlayedSection` into Dashboard

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Update the PLAYER fallthrough in `MainPanel`**

In `src/pages/Dashboard.tsx`, find the `MainPanel` function. The current PLAYER fallthrough is:

```tsx
return (
  <div className="flex flex-col items-center justify-center h-full gap-3">
    <p className="text-text-muted text-sm">
      Open Spotify on a device to start playing
    </p>
  </div>
);
```

Replace it with:

```tsx
return (
  <div className="p-4 flex flex-col gap-6">
    <RecentlyPlayedSection />
  </div>
);
```

Also add the import at the top of the file:

```tsx
import { RecentlyPlayedSection } from "../components/features/home/RecentlyPlayedSection";
```

The `outlet` guard and BROWSE branch are **not changed**.

- [ ] **Step 2: Update `Dashboard.test.tsx` to include `useRecentlyPlayed` in the mock**

In `src/pages/tests/Dashboard.test.tsx`, the `vi.mock('../../hooks/useSpotifyQueries', ...)` block currently does not include `useRecentlyPlayed`. After wiring `RecentlyPlayedSection` into the Dashboard, the test will crash with "useRecentlyPlayed is not a function" unless the mock is extended.

Add one line to the existing mock object:

```ts
vi.mock('../../hooks/useSpotifyQueries', () => ({
  useCurrentPlayback: () => ({ data: null, isLoading: false }),
  useCurrentlyPlaying: () => ({ data: null, isLoading: false }),
  useUserPlaylists: () => ({ data: null, isLoading: false }),
  useCurrentUserProfile: () => ({ data: null, isLoading: false }),
  useSavedAlbums: () => ({ data: null, isLoading: false }),
  useFollowedArtists: () => ({ data: null, isLoading: false }),
  useRecentlyPlayed: () => ({ isLoading: false, data: undefined }), // add this
}));
```

- [ ] **Step 3: Run the full test suite to check for regressions**

```bash
npx vitest run
```

Expected: All existing tests still pass. New tests all pass.

- [ ] **Step 4: Run type check and lint**

```bash
npm run build 2>&1 | grep -E "error TS"
npm run lint 2>&1 | grep -E "error|warning"
```

Expected: No new errors.

- [ ] **Step 5: Manually verify in the browser**

```bash
npm run dev
```

- Log in and navigate to the dashboard home (no active route / PLAYER state)
- Confirm "Recently Played" section appears with pill cards
- Confirm album art shows for albums; initials circle shows for artists
- Hover a card — play button should fade in
- Click play button — playback should start for that context
- Click card body — should navigate to `/album/:id` or `/artist/:id`
- While loading — confirm 8 skeleton pills appear

- [ ] **Step 6: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/tests/Dashboard.test.tsx
git commit -m "feat: wire RecentlyPlayedSection into Dashboard home view"
```

---

## Final: Coverage check

- [ ] **Run coverage and confirm threshold is met**

```bash
npm run coverage
```

Expected: Lines/branches/functions/statements all ≥ 60%. If any drop below, add targeted tests to the failing component.
