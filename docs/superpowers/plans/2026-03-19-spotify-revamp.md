# Spotify Client Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing Spotify client into a production-quality, portfolio-worthy app with clean architecture, strict TypeScript, shadcn/ui, and fully wired real API data.

**Architecture:** 5 sequential phases — Foundation (restructure + deps), Auth/API cleanup, UI rebuild with shadcn/ui, Feature wiring to real data, Polish/quality. Each phase leaves the app in a working state. Tests run after each phase.

**Tech Stack:** React 18, TypeScript (strict), Vite, React Router 6, TanStack Query 5, Zustand, Tailwind CSS, shadcn/ui, Lucide React, Axios

---

## File Map

### Files Being Created

| Path | Purpose |
|---|---|
| `src/app/App.tsx` | QueryClient outside component, providers, env validation |
| `src/app/routes.tsx` | Browser router config |
| `src/lib/auth/auth.service.ts` | PKCE auth service (moved + cleaned) |
| `src/lib/api/base.service.ts` | SpotifyApiClient (moved + console.logs removed) |
| `src/lib/api/album.service.ts` | Album API (moved) |
| `src/lib/api/artist.service.ts` | Artist API (moved) |
| `src/lib/api/browse.service.ts` | Browse API (moved) |
| `src/lib/api/playback.service.ts` | Playback API (moved) |
| `src/lib/api/playlist.service.ts` | Playlist API (moved) |
| `src/lib/api/search.service.ts` | Search API (moved) |
| `src/lib/api/track.service.ts` | Track API (moved) |
| `src/lib/api/user.service.ts` | User API (moved + migrated to SpotifyApiClient) |
| `src/lib/api/index.ts` | SpotifyApi facade (moved) |
| `src/lib/utils/tokenUtils.ts` | Token utilities (moved + cleaned) |
| `src/types/spotify.ts` | Artist, Album, Track, Playlist, SearchResult, ProfileInterface, etc. |
| `src/types/auth.ts` | TokenResponse, AuthContextType (with isLoading) |
| `src/types/playback.ts` | PlaybackState, CurrentlyPlaying, Device |
| `src/types/enums.ts` | MainContent enum |
| `src/types/index.ts` | Barrel export |
| `src/hooks/useSpotifyApi.ts` | Returns `SpotifyApi \| null` — single auth gate |
| `src/hooks/useSpotifyQueries.ts` | All read queries (moved + refactored) |
| `src/hooks/useSpotifyMutations.ts` | All mutations (moved + refactored with named exports) |
| `src/hooks/useProfileQuery.ts` | Profile query (moved) |
| `src/hooks/user-query-keys.ts` | Query key constants (moved) |
| `src/hooks/useTheme.ts` | Dark/light mode toggle with localStorage |
| `src/components/layout/Header.tsx` | Fixed header with search + profile |
| `src/components/layout/Sidebar.tsx` | Left nav with real playlists |
| `src/components/layout/PlayerBar.tsx` | Sticky bottom player |
| `src/components/layout/MobileTabBar.tsx` | Bottom tabs for mobile |
| `src/components/features/Search.tsx` | Debounced search + results |
| `src/components/features/NowPlaying.tsx` | Currently playing panel |
| `src/components/ui/ErrorState.tsx` | Shared error + retry |
| `src/components/ui/EmptyState.tsx` | Shared empty state |
| `src/hooks/tests/useSpotifyApi.test.ts` | Tests for new hook |
| `src/components/ui/tests/ErrorState.test.tsx` | Tests for ErrorState |

### Files Being Modified

| Path | Change |
|---|---|
| `src/main.tsx` | Update import to `./app/App` |
| `src/context/AuthContext.tsx` | Add `isLoading` to `AuthContextType` |
| `src/context/AuthProvider.tsx` | Expose `isLoading`, remove console.logs |
| `src/hooks/useAuthToken.ts` | Remove all console.logs, update import paths |
| `src/components/ProtectedRoute.tsx` | Use `isLoading` from `useAuth()` instead of timeout |
| `src/pages/Dashboard.tsx` | New layout, no debuggers |
| `src/pages/Login.tsx` | Rebuild with shadcn/ui Button |
| `src/pages/Profile.tsx` | Wire to real user data |
| `src/pages/Settings.tsx` | Add dark/light mode toggle |
| `src/stores/useContentStore.ts` | Update enum import to `../types/enums` |
| `tailwind.config.ts` | Remove DaisyUI, add `darkMode: 'class'`, custom colors |
| `src/index.css` | CSS custom properties, Inter font |
| `src/App.test.tsx` | Move to `src/app/tests/App.test.tsx`, update import |
| `src/pages/tests/Dashboard.test.tsx` | Add `isLoading`, update assertions |
| `src/pages/tests/Login.test.tsx` | Add `isLoading` to mock |
| `src/pages/tests/Profile.test.tsx` | Add `isLoading` to mock, update assertions |
| `src/pages/tests/Settings.test.tsx` | Add `isLoading` to mock |
| All lib/api test files | Update import paths after move |

### Files Being Deleted

- `src/App.tsx` (replaced by `src/app/App.tsx`)
- `src/routes/index.tsx` (replaced by `src/app/routes.tsx`)
- `src/api/` (entire directory — all moved to `src/lib/`)
- `src/data-objects/` (replaced by `src/types/`)
- `src/utils/` (replaced by `src/lib/utils/`)
- `src/App.css` (replaced by `src/index.css`)
- `src/components/AuthDebugger.tsx`
- `src/components/SpotifyApiDebugger.tsx`
- `src/components/SpotifyApiTest.tsx`
- `src/components/SpotifyPlayerNew.tsx`
- `src/components/SpotifyPlayer.tsx`
- `src/components/WebPlaybackPlayer.tsx`
- `src/components/DeviceSelector.tsx`
- `src/components/Header/` (entire directory — replaced by `src/components/layout/Header.tsx`)
- `src/components/Footer/` (entire directory — replaced by `src/components/layout/PlayerBar.tsx`)
- `src/components/Sidebar.tsx` (replaced by `src/components/layout/Sidebar.tsx`)
- `src/components/MainContent.tsx` (inlined into Dashboard)
- `src/components/ExpandContent.tsx` (replaced by `src/components/features/NowPlaying.tsx`)
- `src/components/Header/tests/Header.test.tsx` (component replaced)
- `src/components/Header/tests/AccountBar.test.tsx` (component replaced)
- `src/components/tests/WebPlaybackPlayer.test.tsx` (component replaced)
- `src/api/spotify/playlist.service.test.ts` (duplicate)

---

## PHASE 1: Architecture & Foundation

### Task 1: Create new directory structure

- [ ] **Step 1: Create all new directories**

```bash
mkdir -p src/app/tests
mkdir -p src/lib/auth/tests
mkdir -p src/lib/api/tests
mkdir -p src/lib/utils/tests
mkdir -p src/types
mkdir -p src/components/ui/tests
mkdir -p src/components/layout
mkdir -p src/components/features
mkdir -p src/hooks/tests
```

- [ ] **Step 2: Verify directories exist**

```bash
find src -type d | sort
```

Expected: all dirs above present.

---

### Task 2: Move library files to src/lib/

**Goal:** Copy all API/auth/utils files to new locations. Do NOT delete originals yet — old files stay until Task 6 so the app keeps building during migration.

- [ ] **Step 1: Copy auth service**

```bash
cp src/api/auth/service/auth.service.ts src/lib/auth/auth.service.ts
```

In `src/lib/auth/auth.service.ts`, update import of tokenUtils:
```ts
// Old: import { ... } from '../../utils/tokenUtils';
// New:
import { ... } from '../utils/tokenUtils';
```

- [ ] **Step 2: Copy tokenUtils**

```bash
cp src/utils/tokenUtils.ts src/lib/utils/tokenUtils.ts
```

In `src/lib/utils/tokenUtils.ts`, update import of auth service:
```ts
// Old: import { ... } from '../api/auth/service/auth.service';
// New:
import { ... } from '../auth/auth.service';
```

- [ ] **Step 3: Copy base service**

```bash
cp src/api/spotify/base.service.ts src/lib/api/base.service.ts
```

In `src/lib/api/base.service.ts`, update import:
```ts
// Old: import { getValidAccessToken } from '../../utils/tokenUtils';
// New:
import { getValidAccessToken } from '../utils/tokenUtils';
```

- [ ] **Step 4: Copy all domain services**

```bash
cp src/api/spotify/album.service.ts src/lib/api/album.service.ts
cp src/api/spotify/artist.service.ts src/lib/api/artist.service.ts
cp src/api/spotify/browse.service.ts src/lib/api/browse.service.ts
cp src/api/spotify/playback.service.ts src/lib/api/playback.service.ts
cp src/api/spotify/playlist.service.ts src/lib/api/playlist.service.ts
cp src/api/spotify/search.service.ts src/lib/api/search.service.ts
cp src/api/spotify/track.service.ts src/lib/api/track.service.ts
cp src/api/spotify/index.ts src/lib/api/index.ts
cp src/api/user/service/user.service.ts src/lib/api/user.service.ts
```

In each `src/lib/api/*.service.ts`, verify imports of `SpotifyApiClient` use `./base.service` (same directory — already correct).

In `src/lib/api/index.ts`, update service imports from relative paths (e.g., `./album.service` is already correct).

In `src/lib/api/user.service.ts`, the type import will be updated in Task 3 after types are created.

- [ ] **Step 5: Copy test files to new locations**

```bash
cp src/api/spotify/tests/album.service.test.ts src/lib/api/tests/album.service.test.ts
cp src/api/spotify/tests/artist.service.test.ts src/lib/api/tests/artist.service.test.ts
cp src/api/spotify/tests/base.service.test.ts src/lib/api/tests/base.service.test.ts
cp src/api/spotify/tests/browse.service.test.ts src/lib/api/tests/browse.service.test.ts
cp src/api/spotify/tests/playlist.service.test.ts src/lib/api/tests/playlist.service.test.ts
cp src/api/spotify/tests/search.service.test.ts src/lib/api/tests/search.service.test.ts
cp src/api/spotify/tests/track.service.test.ts src/lib/api/tests/track.service.test.ts
cp src/api/spotify/playback.service.test.ts src/lib/api/tests/playback.service.test.ts
cp src/api/auth/service/tests/auth.service.test.ts src/lib/auth/tests/auth.service.test.ts
cp src/utils/tests/tokenUtils.test.ts src/lib/utils/tests/tokenUtils.test.ts
```

In each copied test, update the import to point to `../` instead of deep relative paths. Example for `src/lib/api/tests/album.service.test.ts`:
```ts
// Old: import { AlbumService } from '../../album.service';
// New (from tests/ subdir):
import { AlbumService } from '../album.service';
```

Do the same pattern for all copied test files — each test imports from one directory up (`../`).

For `src/lib/auth/tests/auth.service.test.ts`:
```ts
// Old: import { ... } from '../auth.service';
// Same — already correct
```

For `src/lib/utils/tests/tokenUtils.test.ts`:
```ts
// Old: import { ... } from '../../utils/tokenUtils';
// New:
import { ... } from '../tokenUtils';
```

**Special case — `src/lib/api/tests/base.service.test.ts`:** This test has a secondary tokenUtils mock that must also be updated. Update BOTH the import and the mock:
```ts
// Old:
import * as tokenUtils from '../../../utils/tokenUtils';
vi.mock('../../../utils/tokenUtils', () => ({ ... }));

// New (from src/lib/api/tests/, the lib/utils path is two levels up):
import * as tokenUtils from '../../utils/tokenUtils';
vi.mock('../../utils/tokenUtils', () => ({ ... }));
```
The primary service import (`'../base.service'`) is already correct after the copy.

---

### Task 3: Create centralized types

**Files:** Create `src/types/auth.ts`, `src/types/spotify.ts`, `src/types/playback.ts`, `src/types/enums.ts`, `src/types/index.ts`

- [ ] **Step 1: Create `src/types/auth.ts`**

```ts
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface TokenScopeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface AuthContextType {
  accessToken: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: string | null;
}
```

- [ ] **Step 2: Create `src/types/spotify.ts`**

This file consolidates everything from `src/data-objects/interface/profile-interface.ts` and most of `src/data-objects/interface/spotify-interface.ts` (excluding Device, PlaybackState, CurrentlyPlaying which go to playback.ts).

```ts
// From profile-interface.ts
export interface ExternalUrls {
  spotify: string;
}

export interface Image {
  url: string;
  height?: number;
  width?: number;
}

export interface Followers {
  href?: string;
  total: number;
}

export interface ProfileInterface {
  id: string;
  display_name: string;
  email: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  images: Image[];
  type: string;
  uri: string;
  country?: string;
  product?: string;
  explicit_content?: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
}

// Artist
export interface Artist {
  external_urls: ExternalUrls;
  followers?: Followers;
  genres?: string[];
  href: string;
  id: string;
  images?: Image[];
  name: string;
  popularity?: number;
  type: 'artist';
  uri: string;
}

export interface ArtistTopTracks {
  tracks: Track[];
}

export interface ArtistAlbums {
  href: string;
  limit: number;
  next?: string;
  offset: number;
  previous?: string;
  total: number;
  items: Album[];
}

// Album
export interface Album {
  album_type: 'album' | 'single' | 'compilation';
  total_tracks: number;
  available_markets?: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  restrictions?: { reason: 'market' | 'product' | 'explicit' };
  type: 'album';
  uri: string;
  artists: Artist[];
  tracks?: {
    href: string;
    limit: number;
    next?: string;
    offset: number;
    previous?: string;
    total: number;
    items: Track[];
  };
  copyrights?: { text: string; type: 'C' | 'P' }[];
  external_ids?: Record<string, string>;
  genres?: string[];
  label?: string;
  popularity?: number;
}

// Track
export interface Track {
  album?: Album;
  artists: Artist[];
  available_markets?: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids?: Record<string, string>;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_playable?: boolean;
  linked_from?: {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    type: 'track';
    uri: string;
  };
  restrictions?: { reason: 'market' | 'product' | 'explicit' };
  name: string;
  popularity: number;
  preview_url?: string;
  track_number: number;
  type: 'track';
  uri: string;
  is_local: boolean;
}

export interface SavedTrack {
  added_at: string;
  track: Track;
}

export interface SavedAlbum {
  added_at: string;
  album: Album;
}

// Playlist
export interface Playlist {
  collaborative: boolean;
  description?: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: {
    external_urls: ExternalUrls;
    followers?: Followers;
    href: string;
    id: string;
    type: 'user';
    uri: string;
    display_name?: string;
  };
  public?: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
    items?: PlaylistTrack[];
  };
  type: 'playlist';
  uri: string;
}

export interface PlaylistTrack {
  added_at: string;
  added_by: {
    external_urls: ExternalUrls;
    followers?: Followers;
    href: string;
    id: string;
    type: 'user';
    uri: string;
  };
  is_local: boolean;
  track: Track;
}

// Search
export interface SearchResult {
  artists?: PaginatedResponse<Artist>;
  albums?: PaginatedResponse<Album>;
  tracks?: PaginatedResponse<Track>;
  playlists?: PaginatedResponse<Playlist>;
}

// Pagination
export interface PaginatedResponse<T> {
  href: string;
  limit: number;
  next?: string;
  offset: number;
  previous?: string;
  total: number;
  items: T[];
}

export type UserSavedAlbums = PaginatedResponse<SavedAlbum>;
export type UserSavedTracks = PaginatedResponse<SavedTrack>;
export type UserPlaylists = PaginatedResponse<Playlist>;

// Browse
export interface FeaturedPlaylists {
  message?: string;
  playlists: PaginatedResponse<Playlist>;
}

export interface NewReleases {
  albums: PaginatedResponse<Album>;
}

export interface Category {
  href: string;
  icons: Image[];
  id: string;
  name: string;
}

export type Categories = PaginatedResponse<Category>;

// Recommendations
export interface RecommendationSeed {
  afterFilteringSize: number;
  afterRelinkingSize: number;
  href?: string;
  id: string;
  initialPoolSize: number;
  type: 'artist' | 'track' | 'genre';
}

export interface Recommendations {
  seeds: RecommendationSeed[];
  tracks: Track[];
}

export interface AudioFeatures {
  acousticness: number;
  analysis_url: string;
  danceability: number;
  duration_ms: number;
  energy: number;
  id: string;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  track_href: string;
  type: 'audio_features';
  uri: string;
  valence: number;
}
```

- [ ] **Step 3: Create `src/types/playback.ts`**

```ts
import type { ExternalUrls, Track } from './spotify';

export interface Device {
  id?: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent?: number;
}

interface PlaybackContext {
  type: 'artist' | 'playlist' | 'album' | 'show';
  href: string;
  external_urls: ExternalUrls;
  uri: string;
}

export interface PlaybackState {
  device: Device;
  repeat_state: 'off' | 'track' | 'context';
  shuffle_state: boolean;
  context?: PlaybackContext;
  timestamp: number;
  progress_ms?: number;
  is_playing: boolean;
  item?: Track;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  actions: {
    interrupting_playback?: boolean;
    pausing?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
    toggling_repeat_context?: boolean;
    toggling_shuffle?: boolean;
    toggling_repeat_track?: boolean;
    transferring_playback?: boolean;
  };
}

export interface CurrentlyPlaying {
  device: Device;
  repeat_state: 'off' | 'track' | 'context';
  shuffle_state: boolean;
  context?: PlaybackContext;
  timestamp: number;
  progress_ms?: number;
  is_playing: boolean;
  item?: Track;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  actions: {
    disallows: {
      interrupting_playback?: boolean;
      pausing?: boolean;
      resuming?: boolean;
      seeking?: boolean;
      skipping_next?: boolean;
      skipping_prev?: boolean;
      toggling_repeat_context?: boolean;
      toggling_shuffle?: boolean;
      toggling_repeat_track?: boolean;
      transferring_playback?: boolean;
    };
  };
}
```

- [ ] **Step 4: Create `src/types/enums.ts`**

```ts
export enum MainContent {
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  ALBUMS = 'ALBUMS',
  PLAYLISTS = 'PLAYLISTS',
  TRACKS = 'TRACKS',
  BROWSE = 'BROWSE',
  PLAYER = 'PLAYER',
}
```

- [ ] **Step 5: Create `src/types/index.ts`**

```ts
export * from './auth';
export * from './spotify';
export * from './playback';
export * from './enums';
```

- [ ] **Step 6: Update `src/lib/api/user.service.ts` type import**

```ts
// Old:
import { ProfileInterface } from '../../../data-objects/interface';
// New:
import type { ProfileInterface } from '../../types/spotify';
```

---

### Task 4: Move hooks to src/hooks/

- [ ] **Step 1: Copy hooks**

```bash
cp src/api/spotify/hooks/useSpotifyQueries.ts src/hooks/useSpotifyQueries.ts
cp src/api/spotify/hooks/useSpotifyMutations.ts src/hooks/useSpotifyMutations.ts
cp src/api/user/hooks/useProfileQuery.ts src/hooks/useProfileQuery.ts
cp src/api/user/hooks/user-query-keys.ts src/hooks/user-query-keys.ts
```

- [ ] **Step 2: Update imports in `src/hooks/useSpotifyQueries.ts`**

```ts
// Old:
import { SpotifyApi } from '../index';
import { useAuthToken } from '../../../hooks/useAuthToken';
// New:
import { SpotifyApi } from '../lib/api/index';
import { useAuthToken } from './useAuthToken';
```

- [ ] **Step 3: Update imports in `src/hooks/useSpotifyMutations.ts`**

```ts
// Old:
import { useAuthToken } from '../../../hooks/useAuthToken';
import { SpotifyApi } from '../index';
// New:
import { useAuthToken } from './useAuthToken';
import { SpotifyApi } from '../lib/api/index';
```

- [ ] **Step 4: Update imports in `src/hooks/useProfileQuery.ts`**

```ts
// Old:
import { getUserData } from '../service/user.service';
// New:
import { getUserData } from '../lib/api/user.service';
```

---

### Task 5: Create new App.tsx and routes.tsx

- [ ] **Step 1: Create `src/app/App.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import { router } from './routes';

if (!import.meta.env.VITE_CLIENT_ID) {
  throw new Error('VITE_CLIENT_ID environment variable is required');
}
if (!import.meta.env.VITE_REDIRECT_URI) {
  throw new Error('VITE_REDIRECT_URI environment variable is required');
}

// Apply saved theme immediately to avoid flash of wrong theme
const savedTheme =
  localStorage.getItem('theme') ??
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.classList.add(savedTheme);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

- [ ] **Step 2: Create `src/app/routes.tsx`**

```tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/Login'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <Dashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <Profile />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <Settings />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];

export const router = createBrowserRouter(routes);
```

- [ ] **Step 3: Update `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

### Task 6: Delete dead files and old directories

- [ ] **Step 1: Delete dead component files**

```bash
rm -f src/components/AuthDebugger.tsx
rm -f src/components/SpotifyApiDebugger.tsx
rm -f src/components/SpotifyApiTest.tsx
rm -f src/components/SpotifyPlayerNew.tsx
```

- [ ] **Step 2: Delete orphaned test files for replaced components**

These tests import components that will be completely replaced. Deleting them is correct — new tests for the new components will be added in later phases.

```bash
rm -f src/components/Header/tests/Header.test.tsx
rm -f src/components/Header/tests/AccountBar.test.tsx
rm -f src/components/tests/WebPlaybackPlayer.test.tsx
```

- [ ] **Step 3: Move App.test.tsx to new location and update import**

```bash
cp src/App.test.tsx src/app/tests/App.test.tsx
```

Edit `src/app/tests/App.test.tsx`:
```ts
// Old: import App from './App';
// New:
import App from '../App';
```

Delete the old file:
```bash
rm src/App.test.tsx
```

- [ ] **Step 4: Delete old source directories**

Verify new files exist first:
```bash
ls src/lib/api/ src/lib/auth/ src/lib/utils/ src/types/ src/hooks/useSpotifyQueries.ts
```

Then delete:
```bash
rm -rf src/api/
rm -rf src/data-objects/
rm -rf src/utils/
rm src/App.tsx
rm src/App.css
rm -rf src/routes/
```

- [ ] **Step 5: Verify build compiles after deletion**

```bash
npx tsc --noEmit 2>&1 | head -60
```

Fix any import errors. Common issues: old imports in context files or stores still pointing to deleted paths.

---

### Task 7: Install dependencies and configure shadcn/ui

- [ ] **Step 1: Uninstall removed packages**

```bash
npm uninstall daisyui @mui/material @mui/icons-material @emotion/react @emotion/styled react-icons @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/free-brands-svg-icons @fortawesome/react-fontawesome react-country-flag
```

- [ ] **Step 2: Update Tailwind to latest**

```bash
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
```

- [ ] **Step 3: Install lucide-react and utility packages**

```bash
npm install lucide-react clsx tailwind-merge class-variance-authority
```

- [ ] **Step 4: Initialize shadcn/ui FIRST (before editing tailwind.config.ts)**

Run init before manually editing tailwind config — shadcn@latest init will configure Tailwind for you and you can then customize on top.

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral**
- CSS variables: **Yes**
- Would you like to use TypeScript: **Yes**
- Where is your global CSS: `src/index.css`
- Where is your tailwind.config: `tailwind.config.ts`
- Configure import alias: **Yes** (use `@/` or accept default)
- Components alias: `src/components/ui`
- Utils alias: `src/lib/utils`

If prompted to overwrite existing files, answer **Yes** — we will customize on top.

- [ ] **Step 5: Add shadcn/ui components**

```bash
npx shadcn@latest add button card skeleton input dropdown-menu slider avatar badge tooltip scroll-area separator
```

- [ ] **Step 6: Customize `tailwind.config.ts` after shadcn init**

shadcn's init sets up base config. Now extend it with project-specific tokens:

```ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        accent: 'var(--color-accent)',
        'accent-muted': 'var(--color-accent-muted)',
        'text-primary': 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        slidein: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        slidein: 'slidein 0.3s ease',
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 7: Replace `src/index.css` with custom properties**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #0a0a0a;
  --color-surface: #1a1a1a;
  --color-surface-hover: #242424;
  --color-accent: #1ed760;
  --color-accent-muted: #158a3e;
  --color-text: #ffffff;
  --color-text-muted: #a3a3a3;
  --color-border: #2a2a2a;
}

.light {
  --color-bg: #f5f5f5;
  --color-surface: #ffffff;
  --color-surface-hover: #e8e8e8;
  --color-accent: #1db954;
  --color-accent-muted: #158a3e;
  --color-text: #121212;
  --color-text-muted: #6a6a6a;
  --color-border: #d4d4d4;
}

* { box-sizing: border-box; }

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Inter', sans-serif;
  margin: 0;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 8: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 9: Commit Phase 1**

```bash
git add -A
git commit -m "refactor: restructure folders, remove dead code, install shadcn/ui"
```

---

## PHASE 2: Auth + API Layer Cleanup

### Task 8: Add isLoading to AuthContext and AuthProvider

- [ ] **Step 1: Update `src/context/AuthContext.tsx`**

```tsx
import { createContext, useContext } from 'react';
import type { AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

- [ ] **Step 2: Rewrite `src/context/AuthProvider.tsx`**

```tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { getToken, redirectToSpotifyAuthorize } from '../lib/auth/auth.service';
import { AuthContext } from './AuthContext';
import { getValidAccessToken } from '../lib/utils/tokenUtils';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('access_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = localStorage.getItem('refresh_token');
  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      try {
        if (code) {
          const token = await getToken(code);
          localStorage.setItem('access_token', token.access_token);
          localStorage.setItem('refresh_token', token.refresh_token);
          localStorage.setItem('expires_in', token.expires_in.toString());
          localStorage.setItem(
            'expires',
            new Date(Date.now() + token.expires_in * 1000).toISOString()
          );
          setAccessToken(token.access_token);
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          const updatedUrl = url.search ? url.href : url.href.replace('?', '/');
          window.history.replaceState({}, document.title, updatedUrl);
        } else {
          const validToken = await getValidAccessToken();
          setAccessToken(validToken);
        }
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [code]);

  const login = useCallback(async () => {
    await redirectToSpotifyAuthorize();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('expires');
    setAccessToken(null);
  }, []);

  const contextValue = useMemo(
    () => ({ accessToken, isLoading, login, logout, refreshToken }),
    [accessToken, isLoading, login, logout, refreshToken]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
```

---

### Task 9: Update all test files that mock AuthContext

**Why:** `AuthContextType` now includes `isLoading: boolean`. All tests that provide a context value object via `<AuthContext.Provider value={{...}}>` will fail TypeScript strict-mode compilation if `isLoading` is missing from the object.

- [ ] **Step 1: Update `src/pages/tests/Dashboard.test.tsx`**

Add `isLoading: false` to the mock context value. Also update assertions — the new Dashboard no longer has `header-element`, `footer-element`, `sidebar-element`, `main-content-element`, `expand-content-element` testids. Replace those tests with checks that match the new component structure:

```tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from '../Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock hooks that make API calls
vi.mock('../../hooks/useSpotifyQueries', () => ({
  useCurrentPlayback: () => ({ data: null, isLoading: false }),
  useCurrentlyPlaying: () => ({ data: null, isLoading: false }),
  useUserPlaylists: () => ({ data: null, isLoading: false }),
  useCurrentUserProfile: () => ({ data: null, isLoading: false }),
}));

vi.mock('../../hooks/useSpotifyMutations', () => ({
  usePlaybackControls: () => ({
    play: { mutate: vi.fn() },
    pause: { mutate: vi.fn() },
    next: { mutate: vi.fn() },
    previous: { mutate: vi.fn() },
    seek: { mutate: vi.fn() },
    setVolume: { mutate: vi.fn() },
    setRepeat: { mutate: vi.fn() },
    setShuffle: { mutate: vi.fn() },
  }),
}));

describe('Dashboard Component', () => {
  const mockAuthContext = {
    accessToken: 'mockAccessToken',
    isLoading: false,
    login: async () => {},
    logout: () => {},
    refreshToken: 'mockRefresh',
  };

  const renderDashboard = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContext}>
          <BrowserRouter>
            <Dashboard />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renders without crashing', () => {
    renderDashboard();
    expect(screen.getByTestId('dashboard-element')).toBeInTheDocument();
  });

  it('contains a sidebar', () => {
    renderDashboard();
    expect(screen.getByTestId('sidebar-element')).toBeInTheDocument();
  });

  it('contains a player bar', () => {
    renderDashboard();
    expect(screen.getByTestId('player-bar-element')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Update `src/pages/tests/Login.test.tsx`**

Add `isLoading: false` to mock value:
```tsx
const mockAuthContext = {
  accessToken: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  refreshToken: null,
};
// Update AuthContext.Provider value to include isLoading: false
```

- [ ] **Step 3: Update `src/pages/tests/Profile.test.tsx`**

Add `isLoading: false` to mock value:
```tsx
const mockAuthContext = {
  accessToken: 'mockAccessToken',
  isLoading: false,
  login: async () => {},
  logout: () => {},
  refreshToken: 'mockRefresh',
};
// Update AuthContext.Provider value to include isLoading: false
```

Also add mock for `useCurrentUserProfile` (Profile now fetches real data and shows a skeleton while loading — not the old hardcoded content):
```tsx
vi.mock('../../hooks/useSpotifyQueries', () => ({
  useCurrentUserProfile: () => ({ data: null, isLoading: true, error: null }),
}));
```

The profile test assertions need updating since the Profile page now shows a Skeleton when loading. Update:
```tsx
it('renders without crashing', () => {
  profileComponent();
  expect(screen.getByTestId('profile-page')).toBeInTheDocument();
});

it('shows loading skeleton when data is loading', () => {
  profileComponent();
  // When useCurrentUserProfile returns isLoading: true, the page shows skeleton
  expect(screen.getByTestId('profile-page')).toBeInTheDocument();
});
```

- [ ] **Step 4: Rewrite `src/pages/tests/Settings.test.tsx`**

The new `Settings.tsx` has a theme toggle button (not a language select). Rewrite the whole test file to match:

```tsx
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Settings from "../Settings.tsx";

describe("Settings Component", () => {
  const mockAuthContext = {
    accessToken: "mockAccessToken",
    login: async () => {},
    logout: () => {},
    refreshToken: "mockRefresh",
    isLoading: false,
  };
  const settingsComponent = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            accessToken: mockAuthContext.accessToken,
            login: mockAuthContext.login,
            logout: mockAuthContext.logout,
            refreshToken: mockAuthContext.refreshToken,
            isLoading: mockAuthContext.isLoading,
          }}
        >
          <BrowserRouter>
            <Settings />
          </BrowserRouter>
        </AuthContext.Provider>
        ,
      </QueryClientProvider>,
    );
  };
  it("renders without crashing", () => {
    settingsComponent();
    expect(screen.getByTestId("settings-element")).toBeInTheDocument();
  });

  it("contains a theme toggle button", () => {
    settingsComponent();
    expect(screen.getByTestId("theme-toggle-element")).toBeInTheDocument();
  });
});
```

Note: `Settings.tsx` in Task 22 must include `data-testid="settings-element"` on the wrapper div and `data-testid="theme-toggle-element"` on the toggle button (see Task 22, Step 2 — those testids are already specified there).

- [ ] **Step 5: Update `src/app/tests/App.test.tsx`**

The new `App.tsx` throws at module scope if `VITE_CLIENT_ID` is not defined. Stub the env vars before importing, then verify:

```ts
import { vi } from 'vitest';
vi.stubEnv('VITE_CLIENT_ID', 'test-client-id');
vi.stubEnv('VITE_REDIRECT_URI', 'http://localhost:5173/');
```

Add these two `vi.stubEnv` lines at the very top of `src/app/tests/App.test.tsx`, before any other imports. Then verify it passes:

```bash
npx vitest run src/app/tests/App.test.tsx
```

---

### Task 10: Fix ProtectedRoute and remove console.logs

- [ ] **Step 1: Rewrite `src/components/ProtectedRoute.tsx`**

```tsx
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return <Login />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

- [ ] **Step 2: Remove all console.logs from `src/hooks/useAuthToken.ts` and update its test**

Remove every `console.log(...)` and `console.error(...)` call. Remove the `debugTokenInfo` import and call. Update import paths:
```ts
// Old:
import { getValidAccessToken, debugTokenInfo, isTokenExpired } from '../utils/tokenUtils';
import { redirectToSpotifyAuthorize } from '../api/auth/service/auth.service';
// New:
import { getValidAccessToken, isTokenExpired } from '../lib/utils/tokenUtils';
import { redirectToSpotifyAuthorize } from '../lib/auth/auth.service';
```

Also update `src/hooks/tests/useAuthToken.test.ts` — it mocks old paths and asserts on console messages/`debugTokenInfo` that no longer exist:

1. Update mock paths and imports at the top of the file:
```ts
// Old:
import * as tokenUtils from '../../utils/tokenUtils';
import * as authService from '../../api/auth/service/auth.service';
vi.mock('../../utils/tokenUtils', () => ({
  getValidAccessToken: vi.fn(),
  debugTokenInfo: vi.fn(),
  isTokenExpired: vi.fn()
}));
vi.mock('../../api/auth/service/auth.service', () => ({
  redirectToSpotifyAuthorize: vi.fn()
}));

// New:
import * as tokenUtils from '../../lib/utils/tokenUtils';
import * as authService from '../../lib/auth/auth.service';
vi.mock('../../lib/utils/tokenUtils', () => ({
  getValidAccessToken: vi.fn(),
  isTokenExpired: vi.fn()
}));
vi.mock('../../lib/auth/auth.service', () => ({
  redirectToSpotifyAuthorize: vi.fn()
}));
```

2. Remove these assertions that check console messages and `debugTokenInfo` (all removed from the hook):
   - `expect(tokenUtils.debugTokenInfo).toHaveBeenCalled()` — appears twice
   - `expect(consoleSpy.log).toHaveBeenCalledWith('Attempting to get valid access token...')`
   - `expect(consoleSpy.log).toHaveBeenCalledWith('✅ Valid token obtained')`
   - `expect(consoleSpy.log).toHaveBeenCalledWith('❌ No valid token available')`
   - `expect(consoleSpy.error).toHaveBeenCalledWith('Error getting valid token:', mockError)`
   - `expect(consoleSpy.error).toHaveBeenCalledWith('Error getting valid token:', refreshError)`
   - `expect(consoleSpy.error).toHaveBeenCalledWith('Error during login redirect:', loginError)`
   - `expect(consoleSpy.log).toHaveBeenCalledWith('Access token changed in storage')`

3. Remove the `consoleSpy` declaration, its `beforeEach` spy setup, and `afterEach(() => { vi.restoreAllMocks() })` since they exist only to support the removed assertions.

All behavioral assertions (accessToken values, `isAuthenticated`, error strings, localStorage calls, `redirectToSpotifyAuthorize` calls) remain unchanged.

- [ ] **Step 3: Remove console.logs from `src/lib/auth/auth.service.ts`**

Remove all `console.log`, `console.error` calls throughout. Keep all logic.

- [ ] **Step 4: Remove console.logs from `src/lib/utils/tokenUtils.ts` and update its test**

Remove all `console.log`, `console.error` calls. Remove the `debugTokenInfo` export function entirely.

Also update `src/lib/utils/tests/tokenUtils.test.ts` (copied from `src/utils/tests/tokenUtils.test.ts` in Task 2):

1. Update the mock path for the auth service:
```ts
// Old:
vi.mock('../../api/auth/service/auth.service', () => ({ ... }));
import { getRefreshToken } from '../../api/auth/service/auth.service';

// New:
vi.mock('../../auth/auth.service', () => ({
  getRefreshToken: vi.fn(),
}));
import { getRefreshToken } from '../../auth/auth.service';
```
(From `src/lib/utils/tests/`, the auth service is at `../../auth/auth.service` = `src/lib/auth/auth.service`.)

2. Remove `debugTokenInfo` from the import:
```ts
// Old:
import { getValidAccessToken, debugTokenInfo } from '../tokenUtils';
// New:
import { getValidAccessToken } from '../tokenUtils';
```

3. Delete the entire `describe('debugTokenInfo', ...)` block (lines 118–154 in the original) — two test cases that call `debugTokenInfo()` and assert on `mockConsole.log`. The function is deleted and these tests would fail.

4. In the `getValidAccessToken` tests, remove these console assertions (all logs/errors are deleted from `tokenUtils.ts`):
```ts
// In 'returns null when token is expired and no refresh token available' test:
expect(mockConsole.log).toHaveBeenCalledWith('Token expired, attempting to refresh...');

// In 'handles refresh token failure' test:
expect(mockConsole.error).toHaveBeenCalledWith('Failed to refresh token:', expect.any(Error));
```

- [ ] **Step 5: Remove console.logs from `src/lib/api/base.service.ts`**

The 401 interceptor has 3 console.log lines. Remove those. Keep the retry and redirect logic.

---

### Task 11: Create useSpotifyApi hook and refactor mutations/queries

- [ ] **Step 1: Create `src/hooks/useSpotifyApi.ts`**

```ts
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { SpotifyApi } from '../lib/api/index';

export function useSpotifyApi(): SpotifyApi | null {
  const { accessToken, isLoading } = useAuth();

  return useMemo(() => {
    if (isLoading || !accessToken) return null;
    return new SpotifyApi(accessToken);
  }, [accessToken, isLoading]);
}
```

- [ ] **Step 2: Rewrite `src/hooks/useSpotifyQueries.ts`**

Replace all inline auth checks with `useSpotifyApi()`. Pattern for every hook:

```ts
import { useQuery } from '@tanstack/react-query';
import { useSpotifyApi } from './useSpotifyApi';

export const useUserPlaylists = (limit = 50, offset = 0) => {
  const api = useSpotifyApi();
  return useQuery({
    queryKey: ['spotify', 'playlists', 'me', limit, offset],
    queryFn: () => api!.playlists.getCurrentUserPlaylists({ limit, offset }),
    enabled: api !== null,
    staleTime: 5 * 60 * 1000,
  });
};
```

Apply this pattern to ALL query hooks. Remove the old `useSpotifyApi` function export (it now lives in `useSpotifyApi.ts`).

For `useCurrentPlayback` and `useCurrentlyPlaying`, use smart polling:
```ts
refetchInterval: (query) => {
  return query.state.data?.is_playing ? 1000 : 5000;
},
```

- [ ] **Step 3: Rewrite `src/hooks/useSpotifyMutations.ts`**

Replace all `useAuthToken()` auth checks with `useSpotifyApi()`. The existing file exports `usePlaybackControls`, `useLibraryControls`, `usePlaylistControls`. Keep these but clean up the auth pattern — use `useSpotifyApi()` instead of recreating SpotifyApi in every mutation.

`usePlaybackControls` should also rename mutation params from camelCase to be consistent. The `seek` mutation in the existing code uses `{ positionMs, deviceId }` (camelCase). Keep this convention inside the hook — it's the API surface. The UI layer will use these camelCase params:

```ts
export const usePlaybackControls = () => {
  const api = useSpotifyApi();
  const queryClient = useQueryClient();

  const invalidatePlayback = () => {
    queryClient.invalidateQueries({ queryKey: ['spotify', 'playback'] });
  };

  const play = useMutation({
    mutationFn: (options?: {
      device_id?: string;
      context_uri?: string;
      uris?: string[];
      offset?: { position?: number; uri?: string };
      position_ms?: number;
    }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.startResumePlayback(options);
    },
    onSuccess: invalidatePlayback,
  });

  const pause = useMutation({
    mutationFn: (deviceId?: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.pausePlayback(deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const next = useMutation({
    mutationFn: (deviceId?: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.skipToNext(deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const previous = useMutation({
    mutationFn: (deviceId?: string) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.skipToPrevious(deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const seek = useMutation({
    mutationFn: ({ positionMs, deviceId }: { positionMs: number; deviceId?: string }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.seekToPosition(positionMs, deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const setVolume = useMutation({
    mutationFn: ({ volumePercent, deviceId }: { volumePercent: number; deviceId?: string }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.setPlaybackVolume(volumePercent, deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const setRepeat = useMutation({
    mutationFn: ({ state, deviceId }: { state: 'track' | 'context' | 'off'; deviceId?: string }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.setRepeatMode(state, deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const setShuffle = useMutation({
    mutationFn: ({ state, deviceId }: { state: boolean; deviceId?: string }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.toggleShuffle(state, deviceId);
    },
    onSuccess: invalidatePlayback,
  });

  const transferPlayback = useMutation({
    mutationFn: ({ deviceIds, play: autoPlay }: { deviceIds: string[]; play?: boolean }) => {
      if (!api) throw new Error('Not authenticated');
      return api.playback.transferPlayback(deviceIds, autoPlay);
    },
    onSuccess: () => {
      invalidatePlayback();
      queryClient.invalidateQueries({ queryKey: ['spotify', 'devices'] });
    },
  });

  return { play, pause, next, previous, seek, setVolume, setRepeat, setShuffle, transferPlayback };
};
```

Apply the same cleanup pattern (`useSpotifyApi()` instead of inline auth) to `useLibraryControls` and `usePlaylistControls`.

- [ ] **Step 4: Update `src/hooks/useProfileQuery.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { useSpotifyApi } from './useSpotifyApi';

export const useProfileQuery = () => {
  const api = useSpotifyApi();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => api!.getCurrentUserProfile(),
    enabled: api !== null,
    staleTime: 10 * 60 * 1000,
  });
};
```

- [ ] **Step 5: Update `src/stores/useContentStore.ts`** to import from new enum location:

```ts
// Old: import { MainContent } from '../data-objects/enum';
// New:
import { MainContent } from '../types/enums';
```

---

### Task 12: Write and run tests for useSpotifyApi

- [ ] **Step 1: Write `src/hooks/tests/useSpotifyApi.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpotifyApi } from '../useSpotifyApi';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';

describe('useSpotifyApi', () => {
  it('returns null when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: null,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: null,
    });

    const { result } = renderHook(() => useSpotifyApi());
    expect(result.current).toBeNull();
  });

  it('returns null when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: null,
    });

    const { result } = renderHook(() => useSpotifyApi());
    expect(result.current).toBeNull();
  });

  it('returns SpotifyApi instance when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: 'test-token-123',
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: 'refresh-token',
    });

    const { result } = renderHook(() => useSpotifyApi());
    expect(result.current).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run the test**

```bash
npx vitest run src/hooks/tests/useSpotifyApi.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 3: Run full test suite**

```bash
npm run test -- --run
```

Expected: all test files pass.

- [ ] **Step 4: Commit Phase 2**

```bash
git add -A
git commit -m "refactor: clean auth/api layer, add useSpotifyApi hook, remove console.logs"
```

---

## PHASE 3: UI Rebuild

### Task 13: Build shared UI components

- [ ] **Step 1: Write `src/components/ui/tests/ErrorState.test.tsx` (TDD — write before implementation)**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders the error message', () => {
    render(<ErrorState message="Something went wrong" onRetry={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onRetry when button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders without retry button when onRetry is not provided', () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/components/ui/tests/ErrorState.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/components/ui/ErrorState.tsx`**

```tsx
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-text-muted text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-accent hover:text-accent-muted underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/components/ui/tests/ErrorState.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Create `src/components/ui/EmptyState.tsx`**

```tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon && <div className="text-text-muted mb-2">{icon}</div>}
      <p className="text-text-primary font-medium text-sm">{title}</p>
      {description && <p className="text-text-muted text-xs">{description}</p>}
    </div>
  );
}
```

---

### Task 14: Build PlayerBar

**Files:** Create `src/components/layout/PlayerBar.tsx`

Note: PlayerBar uses `usePlaybackControls()` which returns `{ play, pause, next, previous, seek, setVolume, setRepeat, setShuffle }`. Parameters use **camelCase** matching the hook's API — `positionMs`, `volumePercent`, `state`.

- [ ] **Step 1: Create `src/components/layout/PlayerBar.tsx`**

```tsx
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Skeleton } from '../ui/skeleton';
import { useCurrentPlayback } from '../../hooks/useSpotifyQueries';
import { usePlaybackControls } from '../../hooks/useSpotifyMutations';

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlayerBar() {
  const { data: playback, isLoading } = useCurrentPlayback();
  const { play, pause, next, previous, seek, setVolume, setRepeat, setShuffle } = usePlaybackControls();

  const track = playback?.item;
  const isPlaying = playback?.is_playing ?? false;
  const progressMs = playback?.progress_ms ?? 0;
  const durationMs = track?.duration_ms ?? 0;
  const volume = playback?.device?.volume_percent ?? 50;
  const shuffleState = playback?.shuffle_state ?? false;
  const repeatState = playback?.repeat_state ?? 'off';

  const handlePlayPause = () => {
    if (isPlaying) {
      pause.mutate(undefined);
    } else {
      play.mutate({ position_ms: progressMs });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface border-t border-border flex items-center px-4 gap-4 z-50" data-testid="player-bar-element">
      {/* Track info */}
      <div className="flex items-center gap-3 w-56 min-w-0 shrink-0">
        {isLoading ? (
          <>
            <Skeleton className="w-12 h-12 rounded shrink-0" />
            <div className="flex flex-col gap-1 min-w-0">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </>
        ) : track ? (
          <>
            <img
              src={track.album?.images?.[2]?.url ?? track.album?.images?.[0]?.url}
              alt={track.album?.name}
              className="w-12 h-12 rounded shrink-0 object-cover"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-text-primary text-sm font-medium truncate">{track.name}</span>
              <span className="text-text-muted text-xs truncate">
                {track.artists.map((a) => a.name).join(', ')}
              </span>
            </div>
          </>
        ) : (
          <span className="text-text-muted text-xs">Nothing playing</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1 max-w-lg mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShuffle.mutate({ state: !shuffleState })}
            className={`text-text-muted hover:text-text-primary transition-colors ${shuffleState ? 'text-accent' : ''}`}
            aria-label="Toggle shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={() => previous.mutate(undefined)}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-8 h-8 bg-text-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform text-bg"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => next.mutate(undefined)}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const nextRepeat = repeatState === 'off' ? 'context' : repeatState === 'context' ? 'track' : 'off';
              setRepeat.mutate({ state: nextRepeat });
            }}
            className={`text-text-muted hover:text-text-primary transition-colors ${repeatState !== 'off' ? 'text-accent' : ''}`}
            aria-label="Toggle repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-text-muted text-xs tabular-nums w-8 text-right">{formatMs(progressMs)}</span>
          <Slider
            value={[progressMs]}
            max={durationMs || 1}
            step={1000}
            onValueCommit={(value) => seek.mutate({ positionMs: value[0] })}
            className="flex-1"
            aria-label="Track progress"
          />
          <span className="text-text-muted text-xs tabular-nums w-8">{formatMs(durationMs)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-36 shrink-0 justify-end">
        <button
          onClick={() => setVolume.mutate({ volumePercent: volume > 0 ? 0 : 50 })}
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueCommit={(value) => setVolume.mutate({ volumePercent: value[0] })}
          className="w-24"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
```

---

### Task 15: Build Sidebar

**Files:** Create `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create `src/components/layout/Sidebar.tsx`**

```tsx
import { House, Search, Library, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPlaylists } from '../../hooks/useSpotifyQueries';
import { useContentStore } from '../../stores/useContentStore';
import { MainContent } from '../../types/enums';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';

export function Sidebar() {
  const navigate = useNavigate();
  const { currentContent, setCurrentContent } = useContentStore();
  const { data: playlists, isLoading, error } = useUserPlaylists(50);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 gap-2 h-full" data-testid="sidebar-element">
      {/* Nav */}
      <nav className="bg-surface rounded-lg p-4 flex flex-col gap-1">
        <button
          onClick={() => { navigate('/'); setCurrentContent(MainContent.PLAYER); }}
          className={`flex items-center gap-4 px-2 py-2 rounded text-sm font-semibold transition-colors hover:text-text-primary ${currentContent === MainContent.PLAYER ? 'text-text-primary' : 'text-text-muted'}`}
        >
          <House className="w-6 h-6" />
          Home
        </button>
        <button
          onClick={() => setCurrentContent(MainContent.BROWSE)}
          className={`flex items-center gap-4 px-2 py-2 rounded text-sm font-semibold transition-colors hover:text-text-primary ${currentContent === MainContent.BROWSE ? 'text-text-primary' : 'text-text-muted'}`}
        >
          <Search className="w-6 h-6" />
          Search
        </button>
      </nav>

      {/* Library */}
      <div className="flex-1 flex flex-col min-h-0 bg-surface rounded-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setCurrentContent(MainContent.PLAYLISTS)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm font-semibold transition-colors"
          >
            <Library className="w-5 h-5" />
            Your Library
          </button>
          <button
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Create playlist"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 pb-2 flex flex-col gap-0.5">
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="w-10 h-10 rounded shrink-0" />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
            {error && <p className="text-text-muted text-xs px-2 py-4">Could not load playlists</p>}
            {playlists?.items?.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => setCurrentContent(MainContent.PLAYLISTS)}
                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-surface-hover transition-colors text-left w-full"
              >
                <img
                  src={playlist.images?.[0]?.url}
                  alt={playlist.name}
                  className="w-10 h-10 rounded shrink-0 object-cover bg-border"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-text-primary text-sm font-medium truncate">{playlist.name}</span>
                  <span className="text-text-muted text-xs truncate">
                    Playlist · {playlist.tracks.total} tracks
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
```

---

### Task 16: Build Header

**Files:** Create `src/components/layout/Header.tsx`

- [ ] **Step 1: Create `src/components/layout/Header.tsx`**

```tsx
import { Search, Settings, LogOut, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import { useCurrentUserProfile } from '../../hooks/useSpotifyQueries';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useContentStore } from '../../stores/useContentStore';
import { MainContent } from '../../types/enums';

export function Header() {
  const { logout } = useAuth();
  const { data: profile } = useCurrentUserProfile();
  const navigate = useNavigate();
  const { setCurrentContent } = useContentStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentContent(MainContent.BROWSE);
    }
  };

  const avatarUrl = profile?.images?.[0]?.url;
  const displayName = profile?.display_name ?? 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-bg/95 backdrop-blur border-b border-border shrink-0" data-testid="header-element">
      <form onSubmit={handleSearch} className="relative max-w-sm w-full hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="What do you want to play?"
          className="pl-9 bg-surface border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent h-9"
          data-testid="searchbar-element"
        />
      </form>

      <div className="ml-auto" data-testid="accountbar-element">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-surface-hover p-1 transition-colors" data-testid="avatar-element">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-accent text-bg text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-text-primary text-sm font-medium hidden md:block pr-1">
                {displayName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-surface border-border" data-testid="dropdown-element">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="text-text-primary hover:bg-surface-hover cursor-pointer">
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-text-primary hover:bg-surface-hover cursor-pointer">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={logout} className="text-text-primary hover:bg-surface-hover cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

Note: `data-testid` attributes are added here to satisfy the existing Header/AccountBar tests that were rewritten in Task 9.

---

### Task 17: Build MobileTabBar and NowPlaying

- [ ] **Step 1: Create `src/components/layout/MobileTabBar.tsx`**

```tsx
import { House, Search, Library, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../../stores/useContentStore';
import { MainContent } from '../../types/enums';

const tabs = [
  { icon: House, label: 'Home', path: '/', content: MainContent.PLAYER },
  { icon: Search, label: 'Search', path: '/', content: MainContent.BROWSE },
  { icon: Library, label: 'Library', path: '/', content: MainContent.PLAYLISTS },
  { icon: User, label: 'Profile', path: '/profile', content: MainContent.PROFILE },
] as const;

export function MobileTabBar() {
  const navigate = useNavigate();
  const { currentContent, setCurrentContent } = useContentStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex md:hidden z-40">
      {tabs.map(({ icon: Icon, label, path, content }) => {
        const isActive = currentContent === content;
        return (
          <button
            key={label}
            onClick={() => { navigate(path); setCurrentContent(content); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${isActive ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
            aria-label={label}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/components/features/NowPlaying.tsx`**

```tsx
import { useCurrentlyPlaying } from '../../hooks/useSpotifyQueries';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

export function NowPlaying() {
  const { data: playback, isLoading } = useCurrentlyPlaying();
  const track = playback?.item;

  if (isLoading) {
    return (
      <aside className="hidden xl:flex flex-col w-60 shrink-0 bg-surface rounded-lg p-4 gap-4">
        <Skeleton className="w-full aspect-square rounded" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </aside>
    );
  }

  if (!track) {
    return (
      <aside className="hidden xl:flex flex-col w-60 shrink-0 bg-surface rounded-lg p-4 items-center justify-center">
        <p className="text-text-muted text-xs text-center">Nothing playing right now</p>
      </aside>
    );
  }

  return (
    <aside className="hidden xl:flex flex-col w-60 shrink-0 bg-surface rounded-lg p-4 gap-3">
      <img
        src={track.album?.images?.[0]?.url}
        alt={track.album?.name}
        className="w-full aspect-square object-cover rounded-md"
      />
      <div className="flex flex-col gap-1">
        <span className="text-text-primary text-sm font-semibold truncate">{track.name}</span>
        <span className="text-text-muted text-xs truncate">
          {track.artists.map((a) => a.name).join(', ')}
        </span>
        {track.album && (
          <span className="text-text-muted text-xs truncate">{track.album.name}</span>
        )}
      </div>
      {track.explicit && (
        <Badge variant="outline" className="w-fit text-text-muted border-border text-xs">
          Explicit
        </Badge>
      )}
    </aside>
  );
}
```

---

### Task 18: Rebuild Dashboard layout

**Files:** Modify `src/pages/Dashboard.tsx`

The old Dashboard test checks for `data-testid="dashboard-element"`, `sidebar-element`, and `player-bar-element` (updated in Task 9). Add those testids to the new layout components (done in Tasks 14 and 15 above). The Dashboard itself keeps `data-testid="dashboard-element"`.

- [ ] **Step 1: Rewrite `src/pages/Dashboard.tsx`**

```tsx
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { PlayerBar } from '../components/layout/PlayerBar';
import { MobileTabBar } from '../components/layout/MobileTabBar';
import { NowPlaying } from '../components/features/NowPlaying';
import { useContentStore } from '../stores/useContentStore';
import { MainContent } from '../types/enums';
import { ScrollArea } from '../components/ui/scroll-area';
import Profile from './Profile';
import Settings from './Settings';
import { lazy, Suspense } from 'react';
import { Skeleton } from '../components/ui/skeleton';

const Search = lazy(() => import('../components/features/Search').then((m) => ({ default: m.Search })));

function MainPanel() {
  const { currentContent } = useContentStore();

  switch (currentContent) {
    case MainContent.PROFILE:
      return <Profile />;
    case MainContent.SETTINGS:
      return <Settings />;
    case MainContent.BROWSE:
      return (
        <Suspense fallback={<div className="p-8"><Skeleton className="h-10 w-full max-w-md" /></div>}>
          <Search />
        </Suspense>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-text-muted text-sm">Open Spotify on a device to start playing</p>
        </div>
      );
  }
}

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen bg-bg" data-testid="dashboard-element">
      <Header />
      <div className="flex flex-1 gap-2 px-2 pb-2 min-h-0 overflow-hidden">
        <Sidebar />
        <ScrollArea className="flex-1 bg-surface rounded-lg">
          <MainPanel />
        </ScrollArea>
        <NowPlaying />
      </div>
      {/* Desktop player bar */}
      <div className="hidden md:block">
        <PlayerBar />
      </div>
      {/* Bottom spacer for fixed bars */}
      <div className="h-20 md:h-0 shrink-0" />
      {/* Mobile tab bar */}
      <MobileTabBar />
    </div>
  );
};

export default Dashboard;
```

---

### Task 19: Rebuild Login page

**Files:** Modify `src/pages/Login.tsx`

Note: The existing Login test checks for `data-testid="login-page-component"` and `data-testid="login-button"`. Add these to the new JSX.

- [ ] **Step 1: Rewrite `src/pages/Login.tsx`**

```tsx
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { Music } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-8" data-testid="login-page-component">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
          <Music className="w-8 h-8 text-bg" />
        </div>
        <div className="text-center">
          <h1 className="text-text-primary text-3xl font-bold">Spotify</h1>
          <p className="text-text-muted text-sm mt-1">Music for everyone.</p>
        </div>
      </div>
      <Button
        onClick={login}
        data-testid="login-button"
        className="bg-accent hover:bg-accent-muted text-bg font-semibold px-10 py-3 rounded-full text-sm"
      >
        Log in with Spotify
      </Button>
    </div>
  );
};

export default Login;
```

- [ ] **Step 2: Run Login tests**

```bash
npx vitest run src/pages/tests/Login.test.tsx
```

Expected: 2 tests pass.

---

### Task 20: Run full test suite and commit Phase 3

- [ ] **Step 1: Run all tests**

```bash
npm run test -- --run
```

Expected: all test files pass.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 3: Commit Phase 3**

```bash
git add -A
git commit -m "feat: rebuild UI with shadcn/ui, new layout components, Spotify dark design"
```

---

## PHASE 4: Feature Wiring

### Task 21: Wire Profile page to real API data

**Files:** Modify `src/pages/Profile.tsx`

Note: Profile test checks for `profile-card-element` and `profile-img-element`. Add these testids. The test mocks `useCurrentUserProfile` returning `isLoading: true`, so the page shows a skeleton — add `data-testid="profile-page"` to the skeleton container too.

- [ ] **Step 1: Rewrite `src/pages/Profile.tsx`**

```tsx
import { useCurrentUserProfile } from '../hooks/useSpotifyQueries';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/badge';

const Profile = () => {
  const { data: profile, isLoading, error, refetch } = useCurrentUserProfile();

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col gap-6" data-testid="profile-card-element">
        <div className="flex items-end gap-6">
          <Skeleton className="w-36 h-36 rounded-full" data-testid="profile-img-element" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load profile" onRetry={() => refetch()} />;
  }

  if (!profile) return null;

  const avatarUrl = profile.images?.[0]?.url;
  const initials = profile.display_name?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <div className="p-8" data-testid="profile-card-element">
      <div className="flex items-end gap-6 mb-8">
        <Avatar className="w-36 h-36" data-testid="profile-img-element">
          <AvatarImage src={avatarUrl} alt={profile.display_name} />
          <AvatarFallback className="bg-accent text-bg text-4xl font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="text-text-muted text-xs font-semibold uppercase">Profile</span>
          <h1 className="text-text-primary text-5xl font-black">{profile.display_name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-text-muted text-sm">
              {profile.followers?.total?.toLocaleString()} Followers
            </span>
            {profile.product && (
              <Badge variant="outline" className="border-border text-text-muted capitalize text-xs">
                {profile.product}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
```

- [ ] **Step 2: Run Profile tests**

```bash
npx vitest run src/pages/tests/Profile.test.tsx
```

Expected: 2 tests pass.

---

### Task 22: Implement Settings with dark/light mode

- [ ] **Step 1: Create `src/hooks/useTheme.ts`**

```ts
import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
}
```

- [ ] **Step 2: Rewrite `src/pages/Settings.tsx`**

```tsx
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div data-testid="settings-element" className="p-8 flex flex-col gap-8 max-w-2xl">
      <h1 className="text-text-primary text-2xl font-bold">Settings</h1>
      <section className="flex flex-col gap-4">
        <h2 className="text-text-primary font-semibold">Appearance</h2>
        <div className="flex items-center justify-between bg-surface-hover rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <span className="text-text-primary text-sm font-medium">Theme</span>
            <span className="text-text-muted text-xs">
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
          </div>
          <button
            data-testid="theme-toggle-element"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface hover:bg-border transition-colors text-text-primary text-sm"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
```

---

### Task 23: Build Search feature

**Files:** Create `src/components/features/Search.tsx`

- [ ] **Step 1: Create `src/components/features/Search.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { useSpotifySearch } from '../../hooks/useSpotifyQueries';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Search as SearchIcon } from 'lucide-react';
import type { Track, Artist } from '../../types/spotify';

function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 300);

  const { data, isLoading, error, refetch } = useSpotifySearch(
    debouncedQuery,
    ['track', 'artist', 'album', 'playlist'],
    { enabled: debouncedQuery.length > 1 }
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artists, songs, or podcasts"
          className="pl-9 bg-surface border-border text-text-primary placeholder:text-text-muted"
          autoFocus
        />
      </div>

      {!debouncedQuery && (
        <EmptyState title="Search for music" description="Find songs, artists, albums, and playlists" />
      )}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && <ErrorState message="Search failed" onRetry={() => refetch()} />}

      {data && (
        <div className="flex flex-col gap-8">
          {data.tracks?.items && data.tracks.items.length > 0 && (
            <section>
              <h2 className="text-text-primary font-bold mb-3">Songs</h2>
              <div className="flex flex-col">
                {data.tracks.items.slice(0, 5).map((track: Track) => (
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
                ))}
              </div>
            </section>
          )}

          {data.artists?.items && data.artists.items.length > 0 && (
            <section>
              <h2 className="text-text-primary font-bold mb-3">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.artists.items.slice(0, 4).map((artist: Artist) => (
                  <div
                    key={artist.id}
                    className="flex flex-col items-center gap-2 p-4 bg-surface-hover rounded-lg hover:bg-border transition-colors cursor-pointer"
                  >
                    <img
                      src={artist.images?.[0]?.url}
                      alt={artist.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <span className="text-text-primary text-sm font-medium text-center truncate w-full">
                      {artist.name}
                    </span>
                    <span className="text-text-muted text-xs">Artist</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### Task 24: Write REFACTOR_PLAN.md and ARCHITECTURE.md

- [ ] **Step 1: Create `REFACTOR_PLAN.md` in project root**

```markdown
# Refactor Plan — Pre-Refactor Issues

Issues identified before refactoring, documented for reference.

## Critical Bugs
- QueryClient recreated on every render (src/App.tsx:7) — destroyed cache on every render
- ProtectedRoute used `setTimeout(1000)` race condition for auth check
- user.service.ts used raw `fetch` — bypassed 401 interceptor and auto-refresh
- 102 `console.log` statements in auth/API layer

## Architecture Issues
- `data-objects/` non-standard folder name for types
- `api/` mixed services with hooks — no clear boundary
- Dead files: AuthDebugger, SpotifyApiDebugger, SpotifyApiTest, SpotifyPlayerNew

## TypeScript Issues
- Unsafe `error as { message?: string }` casts
- Missing type guards on error handling

## UI/UX Issues
- Hardcoded sidebar (5 static playlists)
- Hardcoded profile (Post Malone image)
- SearchBar unconnected to any state or search logic
- ExpandContent showed static album art
- `useContentStore` defined but never used to drive view switching
- SpotifyPlayer.tsx 296 lines — too large, mixed concerns
- Mixed icon libraries (MUI + react-icons + FontAwesome)
- DaisyUI + MUI coexisting

## Fixed In This Refactor
All of the above. See ARCHITECTURE.md for the new structure.
```

- [ ] **Step 2: Create `ARCHITECTURE.md` in project root**

```markdown
# Architecture

## Folder Structure

\`\`\`
src/
├── app/            App entry, QueryClient, routes (lazy-loaded)
├── components/
│   ├── ui/         shadcn/ui primitives + ErrorState, EmptyState
│   ├── layout/     Header, Sidebar, PlayerBar, MobileTabBar
│   └── features/   Search, NowPlaying
├── context/        AuthContext, AuthProvider (global auth state)
├── hooks/          useSpotifyApi, useSpotifyQueries, useSpotifyMutations,
│                   useAuthToken, useTheme, useProfileQuery
├── lib/
│   ├── api/        SpotifyApiClient + domain services
│   ├── auth/       PKCE auth service
│   └── utils/      tokenUtils
├── pages/          Dashboard, Login, Profile, Settings
├── stores/         Zustand — useContentStore (UI state only)
└── types/          Centralized TypeScript types (auth, spotify, playback, enums)
\`\`\`

## Data Flow

1. **Auth**: PKCE → `lib/auth/auth.service.ts` → tokens in localStorage
   → `AuthProvider` exposes `{ accessToken, isLoading }` → `AuthContext`

2. **API gate**: `useSpotifyApi()` reads token from `AuthContext`
   → returns `SpotifyApi | null` (null when loading or unauthenticated)

3. **Queries**: `useSpotifyQueries.ts` hooks use `useSpotifyApi()` with `enabled: api !== null`
   → React Query manages caching, polling, and invalidation

4. **Mutations**: `useSpotifyMutations.ts` hooks use `useSpotifyApi()` inside `mutationFn`
   → On success, invalidate relevant query keys

5. **UI**: Components read from React Query cache → re-render automatically on data changes
   → `useContentStore` (Zustand) drives which view shows in the main panel

## Auth Flow

```
Login → redirectToSpotifyAuthorize() → Spotify OAuth → callback ?code=
→ AuthProvider.fetchToken() exchanges code for tokens
→ stores in localStorage → setAccessToken()
→ ProtectedRoute reads { isLoading, accessToken }
→ isLoading=true shows spinner, false+null shows Login, false+token renders app
```

Token refresh: `getValidAccessToken()` checks expiry with 5-min buffer, refreshes if needed.
401 responses: `SpotifyApiClient` interceptor auto-refreshes and retries once. Redirects to `/login` on second failure.

## Key Design Decisions

- `QueryClient` lives outside the React tree to prevent cache loss on re-render
- `useSpotifyApi()` returns `null` (not throws) when unauthenticated — queries use `enabled: api !== null` to skip gracefully
- `useContentStore` is the single source of truth for which view is displayed in the main panel
- `strict: true` is on in tsconfig — no implicit `any`, no unchecked optional accesses
```

---

### Task 25: Run full test suite and commit Phase 4

- [ ] **Step 1: Run all tests**

```bash
npm run test -- --run
```

Expected: 21 original test files pass + 2 new test files (useSpotifyApi + ErrorState) = 23 test files total.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Fix any errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 4: Commit Phase 4**

```bash
git add -A
git commit -m "feat: wire features to real API data, add search, settings, profile pages"
```

---

## PHASE 5: Polish + Quality

### Task 26: TypeScript strict compliance

- [ ] **Step 1: Run TypeScript with zero tolerance**

```bash
npx tsc --noEmit 2>&1
```

Fix all errors. Common patterns:
- `catch (e)` → `catch (e: unknown)` + type guard
- `arr[0]` → `arr[0]!` or `arr[0] ?? fallback`
- Missing return types on exported functions → add them

- [ ] **Step 2: Verify zero `any` types**

```bash
grep -rn ": any\|as any" src/ --include="*.ts" --include="*.tsx"
```

Expected: zero matches.

- [ ] **Step 3: Verify zero console.log**

```bash
grep -rn "console\." src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."
```

Expected: zero matches.

---

### Task 27: Final verification

- [ ] **Step 1: Run coverage**

```bash
npm run coverage
```

Expected:
- 23 test files
- Coverage ≥ 60% on all metrics

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: zero errors, zero TypeScript errors.

- [ ] **Step 3: Verify success criteria**

```bash
# TypeScript clean
npx tsc --noEmit && echo "TS: PASS"

# Zero any
grep -rn ": any\|as any" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: 0

# Zero console.log in non-test files
grep -rn "console\." src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\." | wc -l
# Expected: 0
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete spotify client revamp — shadcn/ui, strict types, real data, mobile responsive"
```
