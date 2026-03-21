# Search-Based Playlist Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace deprecated Spotify browse/user-playlist API calls in the "Made For You" and "Featured Playlists" home sections with Search API calls (`q=for me` and `q=featured`, `type=playlist`).

**Architecture:** Add `useMadeForYouPlaylists` hook and update `useFeaturedPlaylists` hook in `useSpotifyQueries.ts` to call `api.search.search(query, ["playlist"], { limit })`. Update `MadeForYouSection.tsx` to use the new hook and change data access from `data.items` → `data.playlists?.items` and drop the `useCurrentUserProfile` dependency (title becomes static `"Made For You"`). `FeaturedPlaylistSection.tsx` needs no changes because `useFeaturedPlaylists` keeps the same signature and `data.playlists?.items` already matches `SearchResult.playlists`. Note: `useUserPlaylists` is intentionally kept — `Sidebar.tsx` depends on it and is unrelated to this change.

**Note on `useFeaturedPlaylists` signature:** The existing hook has `(limit = 20, offset = 0)`. The search API used here does not support an offset in the same way, so the `offset` parameter is dropped — confirmed that no call site passes a second argument (both `FeaturedPlaylistSection.tsx` and `Dashboard.test.tsx` only pass `limit`).

**Tech Stack:** React 18, TypeScript, TanStack Query v5, Vitest + React Testing Library

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/useSpotifyQueries.ts` | Modify | Add `useMadeForYouPlaylists`; update `useFeaturedPlaylists` to use search, drop `offset` param |
| `src/hooks/tests/useSpotifyQueries.test.ts` | Modify | Add tests for both new/updated hooks |
| `src/components/features/home/MadeForYouSection.tsx` | Modify | Swap hook + data access + static title |
| `src/components/features/home/MadeForYouSection.test.tsx` | Create | Unit tests for updated MadeForYouSection |
| `src/components/features/home/FeaturedPlaylistSection.test.tsx` | No change | Already uses correct `data.playlists.items` shape — verify passes as-is |
| `src/pages/tests/Dashboard.test.tsx` | Modify | Add `useMadeForYouPlaylists` mock; remove unused `useUserPlaylists` mock |

---

## Task 1: Update hooks — add `useMadeForYouPlaylists`, update `useFeaturedPlaylists`

**Files:**
- Modify: `src/hooks/useSpotifyQueries.ts`
- Modify: `src/hooks/tests/useSpotifyQueries.test.ts`

Both hooks call `requireApi(api).search.search(q, ["playlist"], { limit })` and return `SearchResult` (`{ playlists?: PaginatedResponse<Playlist> }`). The `mockApi` object in the test file needs a `search` key added alongside the existing keys.

Note: `createWrapper()` in the existing test file creates a fresh `QueryClient` per call (it's a factory function, not a module-level instance), so there is no query cache bleed between tests.

- [ ] **Step 1: Write the failing tests**

Open `src/hooks/tests/useSpotifyQueries.test.ts`.

1. Add `search` to the `mockApi` object (alongside `playlists`, `albums`, `artists`, `playback`):

```ts
search: {
  search: vi.fn(),
},
```

2. Update the import at the top to include the new and updated hooks:

```ts
import {
  usePlaylist,
  useAlbumTracks,
  useArtistAlbums,
  useRecentlyPlayed,
  useMadeForYouPlaylists,
  useFeaturedPlaylists,
} from '../useSpotifyQueries';
```

3. Append these two describe blocks at the end of the file:

```ts
describe('useMadeForYouPlaylists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('calls search with "for me" and playlist type', async () => {
    const mockResult = { playlists: { items: [{ id: 'p1' }], total: 1 } };
    mockApi.search.search.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useMadeForYouPlaylists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.search.search).toHaveBeenCalledWith('for me', ['playlist'], { limit: 20 });
    expect(result.current.data).toEqual(mockResult);
  });

  it('respects custom limit', async () => {
    const mockResult = { playlists: { items: [], total: 0 } };
    mockApi.search.search.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useMadeForYouPlaylists(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.search.search).toHaveBeenCalledWith('for me', ['playlist'], { limit: 10 });
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => useMadeForYouPlaylists(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.search.search).not.toHaveBeenCalled();
  });
});

describe('useFeaturedPlaylists (search-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotifyApi).mockReturnValue(mockApi as never);
  });

  it('calls search with "featured" and playlist type', async () => {
    const mockResult = { playlists: { items: [{ id: 'p2' }], total: 1 } };
    mockApi.search.search.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFeaturedPlaylists(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.search.search).toHaveBeenCalledWith('featured', ['playlist'], { limit: 20 });
    expect(result.current.data).toEqual(mockResult);
  });

  it('respects custom limit', async () => {
    const mockResult = { playlists: { items: [], total: 0 } };
    mockApi.search.search.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useFeaturedPlaylists(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.search.search).toHaveBeenCalledWith('featured', ['playlist'], { limit: 10 });
  });

  it('is disabled when api is null', () => {
    vi.mocked(useSpotifyApi).mockReturnValue(null);

    const { result } = renderHook(() => useFeaturedPlaylists(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.search.search).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run src/hooks/tests/useSpotifyQueries.test.ts
```
Expected: FAIL — `useMadeForYouPlaylists is not exported` and `useFeaturedPlaylists` calls wrong method.

- [ ] **Step 3: Update `useSpotifyQueries.ts`**

Replace the existing `useFeaturedPlaylists` block (drops `offset` param — no callers use it):

```ts
export const useFeaturedPlaylists = (limit = 20) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ['spotify', 'search', 'featured-playlists', limit],
    queryFn: () =>
      requireApi(api).search.search('featured', ['playlist'], { limit }),
    enabled: api !== null,
    staleTime: 10 * 60 * 1000,
  });
};
```

Add `useMadeForYouPlaylists` directly after it:

```ts
export const useMadeForYouPlaylists = (limit = 20) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ['spotify', 'search', 'made-for-you', limit],
    queryFn: () =>
      requireApi(api).search.search('for me', ['playlist'], { limit }),
    enabled: api !== null,
    staleTime: 10 * 60 * 1000,
  });
};
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/hooks/tests/useSpotifyQueries.test.ts
```
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpotifyQueries.ts src/hooks/tests/useSpotifyQueries.test.ts
git commit -m "feat: replace deprecated browse/playlist hooks with search-based queries"
```

---

## Task 2: Update `MadeForYouSection.tsx` to use `useMadeForYouPlaylists`

**Files:**
- Create: `src/components/features/home/MadeForYouSection.test.tsx`
- Modify: `src/components/features/home/MadeForYouSection.tsx`

Key changes in the component:
- Remove `useUserPlaylists` and `useCurrentUserProfile` imports/calls (`useUserPlaylists` is still used by `Sidebar.tsx` — do not delete it from `useSpotifyQueries.ts`)
- Import and call `useMadeForYouPlaylists` instead
- Change data access from `data?.items` → `data?.playlists?.items`
- Add `isError` from the hook and return `null` on error
- Title becomes the static string `"Made For You"` (drop profile dependency)
- Add `data-testid="scroll-container"` to the scroll div (needed by tests)

- [ ] **Step 1: Write the failing tests**

Create `src/components/features/home/MadeForYouSection.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { MadeForYouSection } from './MadeForYouSection';

vi.mock('../../../hooks/useSpotifyQueries', () => ({
  useMadeForYouPlaylists: vi.fn(),
  useCurrentPlayback: vi.fn(() => ({ data: null })),
}));

vi.mock('../../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: vi.fn(() => ({
    play: { mutate: vi.fn() },
    pause: { mutate: vi.fn() },
  })),
}));

vi.mock('../../../stores/usePlayerStore', () => ({
  usePlayerStore: vi.fn(() => ({ deviceId: 'test-device' })),
}));

import { useMadeForYouPlaylists } from '../../../hooks/useSpotifyQueries';

const makePlaylist = (id: string) => ({
  id,
  name: `Playlist ${id}`,
  description: '',
  uri: `spotify:playlist:${id}`,
  images: [{ url: `https://img/${id}.jpg` }],
  owner: { id: 'spotify', display_name: 'Spotify', type: 'user' as const, href: '', uri: '', external_urls: { spotify: '' } },
  followers: { total: 0 },
  tracks: { href: '', total: 5 },
  collaborative: false,
  public: true,
  snapshot_id: 'snap',
  type: 'playlist' as const,
  href: '',
  external_urls: { spotify: '' },
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc },
    createElement(MemoryRouter, null, children)
  );
}

describe('MadeForYouSection', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders skeleton while loading', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({ isLoading: true, isError: false, data: undefined } as never);
    const { container } = render(<MadeForYouSection />, { wrapper });
    expect(screen.getByText('Made For You')).toBeInTheDocument();
    expect(screen.queryByAltText(/Playlist/)).not.toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('returns null when data has no playlists', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { playlists: { items: [], total: 0 } },
    } as never);
    const { container } = render(<MadeForYouSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when isError is true', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({ isLoading: false, isError: true, data: undefined } as never);
    const { container } = render(<MadeForYouSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders heading and playlist cards when data is present', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        playlists: {
          items: [makePlaylist('p1'), makePlaylist('p2')],
          total: 2,
        },
      },
    } as never);
    render(<MadeForYouSection />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Made For You' })).toBeInTheDocument();
    expect(screen.getByText('Playlist p1')).toBeInTheDocument();
    expect(screen.getByText('Playlist p2')).toBeInTheDocument();
  });

  it('shows right scroll arrow when content overflows', () => {
    vi.mocked(useMadeForYouPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { playlists: { items: [makePlaylist('p1'), makePlaylist('p2')], total: 2 } },
    } as never);
    render(<MadeForYouSection />, { wrapper });
    const scrollContainer = screen.getByTestId('scroll-container') as HTMLElement;
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, writable: true, configurable: true });
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true, configurable: true });
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 700, writable: true, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(screen.getByRole('button', { name: 'Scroll right' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run src/components/features/home/MadeForYouSection.test.tsx
```
Expected: FAIL — component uses wrong hook / data path.

- [ ] **Step 3: Update `MadeForYouSection.tsx`**

Replace the file contents:

```tsx
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMadeForYouPlaylists, useCurrentPlayback } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import { HomeSection } from './HomeSection';
import { Skeleton } from '../../ui/skeleton';
import { PlaylistCard } from './PlaylistCard';

const CARD_WIDTH = 168;
const SKELETON_COUNT = 8;

function ScrollArrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  const isLeft = dir === 'left';
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  return (
    <div
      className={`absolute ${isLeft ? 'left' : 'right'}-0 top-0 bottom-2 w-16 z-10 flex items-center ${isLeft ? 'justify-start' : 'justify-end'} ${isLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-surface to-transparent pointer-events-none`}
    >
      <button
        aria-label={`Scroll ${dir}`}
        onClick={onClick}
        className={`pointer-events-auto ${isLeft ? 'ml-1' : 'mr-1'} w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
      >
        <Icon className="w-5 h-5 text-text-primary" />
      </button>
    </div>
  );
}

export function MadeForYouSection() {
  const { data, isLoading, isError } = useMadeForYouPlaylists(20);
  const { data: playback } = useCurrentPlayback();
  const { play, pause } = usePlaybackControls();
  const { deviceId } = usePlayerStore();

  const activeContextUri = playback?.context?.uri ?? null;
  const isPlaybackActive = playback?.is_playing ?? false;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateArrows = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    updateArrows();
    el.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [data]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -CARD_WIDTH * 2 : CARD_WIDTH * 2, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <HomeSection title="Made For You">
        <div className="flex gap-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 w-40 shrink-0">
              <Skeleton className="w-40 h-40 rounded-md" />
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </HomeSection>
    );
  }

  const playlists = data?.playlists?.items ?? [];
  if (isError || !playlists.length) return null;

  return (
    <HomeSection title="Made For You">
      <div className="relative overflow-hidden">
        {canScrollLeft && <ScrollArrow dir="left" onClick={() => scroll('left')} />}

        <div
          ref={scrollRef}
          data-testid="scroll-container"
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {playlists.map((playlist) => {
            const isActive = activeContextUri === playlist.uri;
            return (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onPlay={(uri) => play.mutate({ context_uri: uri, device_id: deviceId ?? undefined })}
                onPause={() => pause.mutate(deviceId ?? undefined)}
                isActive={isActive}
                isPlaying={isActive && isPlaybackActive}
              />
            );
          })}
        </div>

        {canScrollRight && <ScrollArrow dir="right" onClick={() => scroll('right')} />}
      </div>
    </HomeSection>
  );
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/components/features/home/MadeForYouSection.test.tsx
```
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/home/MadeForYouSection.tsx src/components/features/home/MadeForYouSection.test.tsx
git commit -m "feat: migrate MadeForYouSection to search-based playlists"
```

---

## Task 3: Fix Dashboard test mock + verify no regressions

**Files:**
- Modify: `src/pages/tests/Dashboard.test.tsx`

`Dashboard` renders `MadeForYouSection`, which now calls `useMadeForYouPlaylists`. The existing mock factory for `useSpotifyQueries` in `Dashboard.test.tsx` does not include that hook — Vitest will throw at runtime. Fix it by **adding** `useMadeForYouPlaylists`. Do **not** remove `useUserPlaylists` — `Dashboard` also renders `Sidebar` (without its own mock), and `Sidebar` calls `useUserPlaylists(50)` directly. Removing it would cause a runtime throw on destructuring.

`FeaturedPlaylistSection.test.tsx` requires **no changes** — it already mocks `useFeaturedPlaylists` at the component level with the same `{ playlists: { items: [...] } }` shape that `SearchResult` returns.

- [ ] **Step 1: Update `Dashboard.test.tsx`**

In `src/pages/tests/Dashboard.test.tsx`, update the `vi.mock('../../hooks/useSpotifyQueries', ...)` factory.

**Only add** `useMadeForYouPlaylists` — do not remove any existing entries. `useUserPlaylists` must stay because `Sidebar` (rendered inside `Dashboard`) calls it and there is no separate Sidebar mock.

The final mock factory should look like:

```ts
vi.mock('../../hooks/useSpotifyQueries', () => ({
  useCurrentPlayback: () => ({ data: null, isLoading: false }),
  useCurrentlyPlaying: () => ({ data: null, isLoading: false }),
  useUserPlaylists: () => ({ data: null, isLoading: false }),
  useCurrentUserProfile: () => ({ data: null, isLoading: false }),
  useSavedAlbums: () => ({ data: null, isLoading: false }),
  useFollowedArtists: () => ({ data: null, isLoading: false }),
  useRecentlyPlayed: () => ({ isLoading: false, data: undefined }),
  useFeaturedPlaylists: () => ({ isLoading: false, isError: false, data: undefined }),
  useMadeForYouPlaylists: () => ({ isLoading: false, isError: false, data: undefined }),
}));
```

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 3: Build**

```bash
npm run build
```
Expected: Clean build with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/tests/Dashboard.test.tsx
git commit -m "test: update Dashboard mock for search-based playlist hooks"
```
