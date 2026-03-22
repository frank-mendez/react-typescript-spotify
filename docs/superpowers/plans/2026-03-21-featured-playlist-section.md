# Featured Playlist Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Featured Playlists" horizontal scroll section to the home dashboard, below the existing "Made For You" section, by extracting a shared `PlaylistCard` component and implementing the new section using the existing `useFeaturedPlaylists` hook.

**Architecture:** Extract the private `PlaylistCard` from `MadeForYouSection.tsx` into its own file so both sections can share it. Create `FeaturedPlaylistSection.tsx` mirroring the scroll/play/pause pattern of `MadeForYouSection`, using `useFeaturedPlaylists(20)` and a static title. Wire the new section into `MainPanel.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest + React Testing Library, TanStack Query v5, Zustand, React Router v6, lucide-react

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/features/home/PlaylistCard.tsx` | Create | Exported shared card component |
| `src/components/features/home/PlaylistCard.test.tsx` | Create | Unit tests for PlaylistCard |
| `src/components/features/home/MadeForYouSection.tsx` | Modify | Remove inline PlaylistCard, import from ./PlaylistCard |
| `src/components/features/home/FeaturedPlaylistSection.tsx` | Create | New section using useFeaturedPlaylists |
| `src/components/features/home/FeaturedPlaylistSection.test.tsx` | Create | Tests for FeaturedPlaylistSection |
| `src/components/layout/MainPanel.tsx` | Modify | Add FeaturedPlaylistSection below MadeForYouSection |

---

## Task 1: Extract PlaylistCard into its own file

**Files:**
- Create: `src/components/features/home/PlaylistCard.tsx`
- Modify: `src/components/features/home/MadeForYouSection.tsx`

- [ ] **Step 1: Create `PlaylistCard.tsx` with the extracted component**

Create `src/components/features/home/PlaylistCard.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import type { Playlist } from '../../../types/spotify';

export interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (uri: string) => void;
  onPause: () => void;
  isActive: boolean;
  isPlaying: boolean;
}

export function PlaylistCard({ playlist, onPlay, onPause, isActive, isPlaying }: Readonly<PlaylistCardProps>) {
  const navigate = useNavigate();
  const image = playlist.images?.[0]?.url;
  const initials = playlist.name.slice(0, 2).toUpperCase();

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && isPlaying) {
      onPause();
    } else {
      onPlay(playlist.uri);
    }
  };

  return (
    <button
      data-testid="playlist-card"
      className="flex flex-col gap-2 w-40 shrink-0 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="relative w-40 h-40 rounded-md overflow-hidden bg-surface-hover">
        {image ? (
          <img
            src={image}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/20 text-accent font-bold text-2xl">
            {initials}
          </div>
        )}

        {/* Play/Pause button — bottom right corner */}
        <button
          aria-label={isActive && isPlaying ? `Pause ${playlist.name}` : `Play ${playlist.name}`}
          onClick={handlePlayPause}
          className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}
        >
          {isActive && isPlaying ? (
            <>
              <span className="group-hover:hidden flex items-end gap-[2px] h-4">
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar1" />
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar2" />
                <span className="w-[3px] bg-black rounded-sm animate-eq-bar3" />
              </span>
              <Pause className="hidden group-hover:flex w-4 h-4 text-black fill-black" />
            </>
          ) : (
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          )}
        </button>
      </div>

      <div className="px-0.5">
        <p className="text-text-primary text-sm font-semibold truncate">{playlist.name}</p>
        {playlist.description && (
          <p className="text-text-muted text-xs truncate mt-0.5">{playlist.description}</p>
        )}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Update `MadeForYouSection.tsx` — remove inline definition, import from new file**

In `src/components/features/home/MadeForYouSection.tsx`:
- Delete lines 13–82 (the `PlaylistCardProps` interface and the `PlaylistCard` function)
- Add this import after the existing imports:
  ```tsx
  import { PlaylistCard } from './PlaylistCard';
  ```
- All other code remains exactly the same.

- [ ] **Step 3: Verify the app builds with no TypeScript errors**

```bash
npm run build
```
Expected: build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/home/PlaylistCard.tsx src/components/features/home/MadeForYouSection.tsx
git commit -m "refactor: extract PlaylistCard into shared component"
```

---

## Task 2: Write and pass PlaylistCard tests

**Files:**
- Create: `src/components/features/home/PlaylistCard.test.tsx`

- [ ] **Step 1: Write the tests**

Create `src/components/features/home/PlaylistCard.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { PlaylistCard } from './PlaylistCard';
import type { PlaylistCardProps } from './PlaylistCard';
import type { Playlist } from '../../../types/spotify';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const makePlaylist = (overrides?: Partial<Playlist>): Playlist => ({
  id: 'pl1',
  name: 'My Playlist',
  description: 'A test playlist',
  uri: 'spotify:playlist:pl1',
  images: [{ url: 'https://img/pl1.jpg' }],
  owner: {
    id: 'user1',
    display_name: 'User 1',
    type: 'user',
    href: '',
    uri: '',
    external_urls: { spotify: '' },
  },
  followers: { total: 0 },
  tracks: { href: '', total: 10 },
  collaborative: false,
  public: true,
  snapshot_id: 'snap1',
  type: 'playlist',
  href: '',
  external_urls: { spotify: '' },
  ...overrides,
});

function renderCard(props: Partial<PlaylistCardProps> = {}) {
  const defaults: PlaylistCardProps = {
    playlist: makePlaylist(),
    onPlay: vi.fn(),
    onPause: vi.fn(),
    isActive: false,
    isPlaying: false,
  };
  return render(
    <MemoryRouter>
      <PlaylistCard {...defaults} {...props} />
    </MemoryRouter>
  );
}

describe('PlaylistCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the playlist name', () => {
    renderCard();
    expect(screen.getByText('My Playlist')).toBeInTheDocument();
  });

  it('renders the description when present', () => {
    renderCard();
    expect(screen.getByText('A test playlist')).toBeInTheDocument();
  });

  it('renders the playlist image when present', () => {
    renderCard();
    const img = screen.getByAltText('My Playlist');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://img/pl1.jpg');
  });

  it('renders initials fallback when no image', () => {
    renderCard({ playlist: makePlaylist({ images: [] }) });
    expect(screen.getByText('MY')).toBeInTheDocument();
    expect(screen.queryByAltText('My Playlist')).not.toBeInTheDocument();
  });

  it('shows a Play button when not active', () => {
    renderCard({ isActive: false, isPlaying: false });
    expect(screen.getByRole('button', { name: /play My Playlist/i })).toBeInTheDocument();
  });

  it('shows a Pause button label when active and playing', () => {
    renderCard({ isActive: true, isPlaying: true });
    expect(screen.getByRole('button', { name: /pause My Playlist/i })).toBeInTheDocument();
  });

  it('calls onPlay with the playlist uri when clicked while not active', () => {
    const onPlay = vi.fn();
    renderCard({ onPlay, isActive: false, isPlaying: false });
    fireEvent.click(screen.getByRole('button', { name: /play My Playlist/i }));
    expect(onPlay).toHaveBeenCalledWith('spotify:playlist:pl1');
  });

  it('calls onPause when clicked while active and playing', () => {
    const onPause = vi.fn();
    renderCard({ onPause, isActive: true, isPlaying: true });
    fireEvent.click(screen.getByRole('button', { name: /pause My Playlist/i }));
    expect(onPause).toHaveBeenCalled();
  });

  it('navigates to /playlist/:id when the card is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByTestId('playlist-card'));
    expect(mockNavigate).toHaveBeenCalledWith('/playlist/pl1');
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx vitest run src/components/features/home/PlaylistCard.test.tsx
```
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/home/PlaylistCard.test.tsx
git commit -m "test: add PlaylistCard unit tests"
```

---

## Task 3: Create FeaturedPlaylistSection with tests (TDD)

**Files:**
- Create: `src/components/features/home/FeaturedPlaylistSection.test.tsx`
- Create: `src/components/features/home/FeaturedPlaylistSection.tsx`

- [ ] **Step 1: Write the failing tests first**

Create `src/components/features/home/FeaturedPlaylistSection.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { FeaturedPlaylistSection } from './FeaturedPlaylistSection';

vi.mock('../../../hooks/useSpotifyQueries', () => ({
  useFeaturedPlaylists: vi.fn(),
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

import { useFeaturedPlaylists } from '../../../hooks/useSpotifyQueries';

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

describe('FeaturedPlaylistSection', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders skeleton cards while loading', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({ isLoading: true, isError: false, data: undefined } as never);
    const { container } = render(<FeaturedPlaylistSection />, { wrapper });
    // Section title is still shown during loading
    expect(screen.getByText('Featured Playlists')).toBeInTheDocument();
    // Skeleton elements are present (not real playlist cards)
    expect(screen.queryByAltText(/Playlist/)).not.toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('returns null when data is empty', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { playlists: { items: [], href: '', limit: 20, offset: 0, total: 0 } },
    } as never);
    const { container } = render(<FeaturedPlaylistSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when isError is true', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({ isLoading: false, isError: true, data: undefined } as never);
    const { container } = render(<FeaturedPlaylistSection />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders section heading and playlist cards when data is present', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        message: 'Featured playlists for you',
        playlists: {
          items: [makePlaylist('p1'), makePlaylist('p2')],
          href: '', limit: 20, offset: 0, total: 2,
        },
      },
    } as never);
    render(<FeaturedPlaylistSection />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Featured Playlists' })).toBeInTheDocument();
    expect(screen.getByText('Playlist p1')).toBeInTheDocument();
    expect(screen.getByText('Playlist p2')).toBeInTheDocument();
  });

  it('uses the static title "Featured Playlists" (not the API message field)', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        message: 'Some dynamic API message',
        playlists: {
          items: [makePlaylist('p1')],
          href: '', limit: 20, offset: 0, total: 1,
        },
      },
    } as never);
    render(<FeaturedPlaylistSection />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Featured Playlists' })).toBeInTheDocument();
    expect(screen.queryByText('Some dynamic API message')).not.toBeInTheDocument();
  });

  it('shows the right scroll arrow when content overflows', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        playlists: {
          items: [makePlaylist('p1'), makePlaylist('p2')],
          href: '', limit: 20, offset: 0, total: 2,
        },
      },
    } as never);
    render(<FeaturedPlaylistSection />, { wrapper });
    // Simulate overflow by overriding scroll container dimensions
    const scrollContainer = screen.getByTestId('scroll-container') as HTMLElement;
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 700, writable: true, configurable: true });
      fireEvent.scroll(scrollContainer);
    }
    // Right arrow should be visible when scrollLeft(0) + clientWidth(300) < scrollWidth(700)
    expect(screen.getByRole('button', { name: 'Scroll right' })).toBeInTheDocument();
  });

  it('shows the left scroll arrow when scrolled right', () => {
    vi.mocked(useFeaturedPlaylists).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        playlists: {
          items: [makePlaylist('p1'), makePlaylist('p2')],
          href: '', limit: 20, offset: 0, total: 2,
        },
      },
    } as never);
    render(<FeaturedPlaylistSection />, { wrapper });
    const scrollContainer = screen.getByTestId('scroll-container') as HTMLElement;
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 200, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 700, writable: true, configurable: true });
      fireEvent.scroll(scrollContainer);
    }
    expect(screen.getByRole('button', { name: 'Scroll left' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests — they should fail (component does not exist yet)**

```bash
npx vitest run src/components/features/home/FeaturedPlaylistSection.test.tsx
```
Expected: FAIL — `Cannot find module './FeaturedPlaylistSection'`

- [ ] **Step 3: Implement `FeaturedPlaylistSection.tsx`**

Create `src/components/features/home/FeaturedPlaylistSection.tsx`:

```tsx
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeaturedPlaylists, useCurrentPlayback } from '../../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../../hooks/useSpotifyMutations';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import { HomeSection } from './HomeSection';
import { Skeleton } from '../../ui/skeleton';
import { PlaylistCard } from './PlaylistCard';

const CARD_WIDTH = 168;

export function FeaturedPlaylistSection() {
  const { data, isLoading, isError } = useFeaturedPlaylists(20);
  const { data: playback } = useCurrentPlayback();
  const { play, pause } = usePlaybackControls();
  const { deviceId } = usePlayerStore();

  const activeContextUri = playback?.context?.uri ?? null;
  const isPlaybackActive = playback?.is_playing ?? false;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
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
      <HomeSection title="Featured Playlists">
        <div className="flex gap-4">
          {['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map((k) => (
            <div key={k} className="flex flex-col gap-2 w-40 shrink-0">
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
    <HomeSection title="Featured Playlists">
      <div className="relative overflow-hidden">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-16 z-10 flex items-center justify-start bg-gradient-to-r from-surface to-transparent pointer-events-none">
            <button
              aria-label="Scroll left"
              onClick={() => scroll('left')}
              className="pointer-events-auto ml-1 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          data-testid="scroll-container"
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onPlay={(uri) => play.mutate({ context_uri: uri, device_id: deviceId ?? undefined })}
              onPause={() => pause.mutate(deviceId ?? undefined)}
              isActive={activeContextUri === playlist.uri}
              isPlaying={activeContextUri === playlist.uri && isPlaybackActive}
            />
          ))}
        </div>

        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 w-16 z-10 flex items-center justify-end bg-gradient-to-l from-surface to-transparent pointer-events-none">
            <button
              aria-label="Scroll right"
              onClick={() => scroll('right')}
              className="pointer-events-auto mr-1 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        )}
      </div>
    </HomeSection>
  );
}
```

- [ ] **Step 4: Run the tests — they should pass now**

```bash
npx vitest run src/components/features/home/FeaturedPlaylistSection.test.tsx
```
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/home/FeaturedPlaylistSection.tsx src/components/features/home/FeaturedPlaylistSection.test.tsx
git commit -m "feat: add FeaturedPlaylistSection component"
```

---

## Task 4: Wire FeaturedPlaylistSection into MainPanel

**Files:**
- Modify: `src/components/layout/MainPanel.tsx`

- [ ] **Step 1: Update `MainPanel.tsx`**

In `src/components/layout/MainPanel.tsx`, add the import and render the new section:

```diff
 import { MadeForYouSection } from "../features/home/MadeForYouSection";
+import { FeaturedPlaylistSection } from "../features/home/FeaturedPlaylistSection";

 // ...inside the return JSX:
       <MadeForYouSection />
+      <FeaturedPlaylistSection />
```

The full updated `return` block should look like:

```tsx
return (
  <>
    <NavHeader active={activeFilter} onChange={setActiveFilter} />
    <div className="p-4 flex flex-col gap-6">
      <RecentlyPlayedSection />
      <MadeForYouSection />
      <FeaturedPlaylistSection />
    </div>
  </>
);
```

- [ ] **Step 2: Run all tests to verify nothing is broken**

```bash
npx vitest run
```
Expected: All tests pass. Coverage remains above 60%.

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/MainPanel.tsx
git commit -m "feat: add Featured Playlists section to home dashboard"
```
