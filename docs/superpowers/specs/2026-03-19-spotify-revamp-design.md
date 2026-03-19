# Spotify Client Revamp — Design Spec

**Date:** 2026-03-19
**Project:** react-typescript-spotify
**Goal:** Transform into a production-quality, portfolio-worthy Spotify client

---

## Overview

A full end-to-end refactor of the existing React/TypeScript Spotify client. The work is organized into 5 sequential phases, each independently buildable and testable. No functionality is broken during the process.

---

## Phase 1: Architecture & Foundation

### Folder Structure

Migrate from the current ad-hoc layout to a standard, scalable structure:

```
src/
├── app/
│   ├── App.tsx               # QueryClient defined outside component
│   ├── main.tsx
│   └── routes.tsx
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── layout/               # Header, Sidebar, Footer/PlayerBar
│   └── features/             # Player, Search, Playlist, Track, DeviceSelector
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Profile.tsx
├── hooks/
├── lib/
│   ├── api/                  # SpotifyApiClient + all domain services
│   ├── auth/                 # PKCE auth service
│   └── utils/                # tokenUtils, helpers
├── stores/                   # Zustand (UI state only)
├── types/                    # Centralized TypeScript types
└── context/                  # AuthContext + AuthProvider
```

### File Migration Map

| Current Path | New Path |
|---|---|
| `src/main.tsx` | `src/app/main.tsx` |
| `src/App.tsx` | `src/app/App.tsx` |
| `src/routes/index.tsx` | `src/app/routes.tsx` |
| `src/api/auth/service/auth.service.ts` | `src/lib/auth/auth.service.ts` |
| `src/api/spotify/base.service.ts` | `src/lib/api/base.service.ts` |
| `src/api/spotify/album.service.ts` | `src/lib/api/album.service.ts` |
| `src/api/spotify/artist.service.ts` | `src/lib/api/artist.service.ts` |
| `src/api/spotify/browse.service.ts` | `src/lib/api/browse.service.ts` |
| `src/api/spotify/playback.service.ts` | `src/lib/api/playback.service.ts` |
| `src/api/spotify/playlist.service.ts` | `src/lib/api/playlist.service.ts` |
| `src/api/spotify/search.service.ts` | `src/lib/api/search.service.ts` |
| `src/api/spotify/track.service.ts` | `src/lib/api/track.service.ts` |
| `src/api/spotify/index.ts` | `src/lib/api/index.ts` |
| `src/api/spotify/hooks/useSpotifyQueries.ts` | `src/hooks/useSpotifyQueries.ts` |
| `src/api/spotify/hooks/useSpotifyMutations.ts` | `src/hooks/useSpotifyMutations.ts` |
| `src/api/user/service/user.service.ts` | `src/lib/api/user.service.ts` |
| `src/api/user/hooks/useProfileQuery.ts` | `src/hooks/useProfileQuery.ts` |
| `src/api/user/hooks/user-query-keys.ts` | `src/hooks/user-query-keys.ts` |
| `src/utils/tokenUtils.ts` | `src/lib/utils/tokenUtils.ts` |
| `src/data-objects/interface/` | `src/types/` |
| `src/data-objects/enum/index.ts` | `src/types/enums.ts` |
| `src/hooks/useAuthToken.ts` | `src/hooks/useAuthToken.ts` (stays) |
| `src/hooks/useSpotifyPlayer.ts` | `src/hooks/useSpotifyPlayer.ts` (stays) |
| `src/context/AuthContext.tsx` | `src/context/AuthContext.tsx` (stays) |
| `src/context/AuthProvider.tsx` | `src/context/AuthProvider.tsx` (stays) |
| `src/stores/useContentStore.ts` | `src/stores/useContentStore.ts` (stays) |
| `src/pages/Settings.tsx` | `src/pages/Settings.tsx` (stays — implement in Phase 4 with dark/light toggle) |
| `src/pages/tests/Settings.test.tsx` | `src/pages/tests/Settings.test.tsx` (stays — update if component changes) |

**Deleted (dead code):**
- `src/components/AuthDebugger.tsx`
- `src/components/SpotifyApiDebugger.tsx`
- `src/components/SpotifyApiTest.tsx`
- `src/components/SpotifyPlayerNew.tsx`

### Key Changes

- `QueryClient` moved outside `App` component body (fixes cache-destroying re-render bug)
- `data-objects/` renamed to `types/` (standard naming convention)
- `api/` reorganized into `lib/api/` and `lib/auth/`
- Dead files deleted (see above)
- `ProtectedRoute` timeout (1s magic number) replaced with `AuthContext.isLoading` derived state

### Dependencies

**Remove (npm uninstall):**
- `daisyui`
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- `react-icons`
- `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/free-regular-svg-icons`, `@fortawesome/free-brands-svg-icons`, `@fortawesome/react-fontawesome`
- `react-country-flag` (not used in refactored UI — remove)

**Add via shadcn/ui CLI:**

shadcn/ui is not a regular npm package — it writes component source files into the repo. Installation is a two-step process:

1. Initialize: `npx shadcn@latest init` (configures Tailwind, sets up `components/ui/`)
2. Add components individually:
   ```
   npx shadcn@latest add button card skeleton input dropdown-menu slider avatar badge tooltip scroll-area separator
   ```
   Note: the CLI package is `shadcn` (not the deprecated `shadcn-ui`).

**Add (npm install):**
- `lucide-react` (ships with shadcn/ui, but install explicitly)
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

**Update:**
- Tailwind CSS to latest stable (`npm install -D tailwindcss@latest`)

---

## Phase 2: Auth + API Layer

### Auth Cleanup

- Remove all 102 `console.log` statements from: `auth.service.ts`, `AuthProvider.tsx`, `tokenUtils.ts`, `useAuthToken.ts`
- Add startup env validation in `src/app/App.tsx` or `src/lib/auth/auth.service.ts`:
  ```ts
  if (!import.meta.env.VITE_CLIENT_ID) throw new Error('VITE_CLIENT_ID is required')
  if (!import.meta.env.VITE_REDIRECT_URI) throw new Error('VITE_REDIRECT_URI is required')
  ```
- `ProtectedRoute`: replace `setTimeout(() => setIsLoading(false), 1000)` with `const { isLoading } = useAuth()`
- PKCE flow logic is correct — keep it, only clean surrounding code

### API Layer

- Migrate `user.service.ts` from raw `fetch` to `SpotifyApiClient` (gains 401 interceptor + auto-refresh)
- Add `useSpotifyApi()` hook (see contract below)
- Remove repetitive `const { accessToken } = useAuthToken()` pattern from every query/mutation hook — centralize in `useSpotifyApi()`
- Keep `useSpotifyQueries.ts` and `useSpotifyMutations.ts` structure — clean internals only

### `useSpotifyApi()` Contract

```ts
// src/hooks/useSpotifyApi.ts
function useSpotifyApi(): SpotifyApi | null

// Returns:
// - SpotifyApi instance when authenticated
// - null when unauthenticated or token unavailable

// Usage in query hooks:
const api = useSpotifyApi()
useQuery({
  queryKey: ['playlists'],
  queryFn: () => api!.playlists.getUserPlaylists(),
  enabled: api !== null,  // skips query when unauthenticated
})
```

### TypeScript Strictness — Migration Order

1. Remove all `any` types first — replace with proper interfaces or `unknown` + type guards
2. Replace unsafe `error as { message?: string }` casts with proper error type guards:
   ```ts
   function isApiError(e: unknown): e is { message: string } {
     return typeof e === 'object' && e !== null && 'message' in e
   }
   ```
3. Centralize Spotify entity types:
   - `src/types/spotify.ts` — Artist, Album, Track, Playlist, Device, SearchResult
   - `src/types/auth.ts` — TokenResponse, AuthContextType
   - `src/types/playback.ts` — PlaybackState, CurrentlyPlaying
4. `strict: true` is **already enabled** in `tsconfig.app.json` — do not modify the flag. The Phase 5 gate is: resolve all pre-existing strict-mode type errors (implicit `any`, strictNullChecks violations) that currently exist in the codebase before claiming Phase 2 complete.

---

## Phase 3: UI/UX Design System

### Design Tokens

```css
/* src/index.css — CSS custom properties */
--color-bg:           #0a0a0a;
--color-surface:      #1a1a1a;
--color-surface-hover:#242424;
--color-accent:       #1ed760;
--color-accent-muted: #158a3e;
--color-text:         #ffffff;
--color-text-muted:   #a3a3a3;
--color-border:       #2a2a2a;
```

Font: Inter (replace Outfit import in `App.css`).

### Layout

**Desktop (≥1024px):**
```
┌─────────────────────────────────────────────┐
│  Header (search + profile)             fixed │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Main Content                    │
│ 240px    │  (flex-1, scrollable)            │
│ fixed    │                                  │
│          │                                  │
├──────────┴──────────────────────────────────┤
│  Player Bar                            fixed │
└─────────────────────────────────────────────┘
```

**Tablet (768px–1023px):** Sidebar collapses to icon-only mode (48px wide). Main content takes remaining width.

**Mobile (<768px):**
- Sidebar hidden, replaced by bottom tab bar with 4 tabs:
  - **Home** (House icon) → Dashboard / main content
  - **Search** (Search icon) → Search view
  - **Library** (Library icon) → Playlists view
  - **Profile** (User icon) → Profile page
- Player bar becomes a mini-player strip (album art + title + play/pause only, 64px tall)
- Header shows logo + avatar only (no search bar — search accessible via tab)

### shadcn/ui Components to Install

`button`, `card`, `skeleton`, `input`, `dropdown-menu`, `slider`, `avatar`, `badge`, `tooltip`, `scroll-area`, `separator`

### Icon Library

Replace all icon libraries with Lucide React. Remove: `@mui/icons-material`, `react-icons`, `@fortawesome/*`.

Lucide icon mapping for existing controls:
- Play → `Play`
- Pause → `Pause`
- Next → `SkipForward`
- Previous → `SkipBack`
- Volume → `Volume2` / `VolumeX`
- Shuffle → `Shuffle`
- Repeat → `Repeat`
- Search → `Search`
- Home → `House`
- Library → `Library`
- User → `User`
- Settings → `Settings`
- Logout → `LogOut`

### Components to Rebuild

| Component | Description |
|---|---|
| `layout/Header` | Search input (wired), profile avatar dropdown |
| `layout/Sidebar` | Real playlist data, collapsible, active state |
| `layout/PlayerBar` | Sticky bottom, progress slider, controls, volume |
| `layout/MobileTabBar` | Bottom nav for mobile with 4 tabs |
| `features/Player` | Split SpotifyPlayer (296 lines) into focused sub-components |
| `features/Search` | Functional search with debounce, result grid |
| `features/TrackList` | Reusable track rows with hover/active states |
| `features/NowPlaying` | Replaces ExpandContent with live album/track data |
| `ui/ErrorState` | Shared error component with retry button |
| `ui/EmptyState` | Shared empty state component |

---

## Phase 4: Feature Wiring

Connect all hardcoded content to real API data:

| Feature | Current State | Target State |
|---|---|---|
| Sidebar playlists | 5 hardcoded objects | `usePlaylistsQuery` — real user playlists |
| Profile page | Hardcoded "Post Malone" | `useProfileQuery` — real user data |
| AccountBar avatar | Hardcoded image path | Real user avatar from profile API |
| SearchBar | Unconnected input | Debounced (300ms) search → `useSearchQuery` |
| ExpandContent | Static album | `useCurrentlyPlaying` — live track info |
| Dashboard routing | `useContentStore` unused | Store drives main panel view switching |

---

## Phase 5: Polish + Quality

### UX
- Loading skeletons on all data-fetching components (use shadcn/ui `Skeleton`)
- `<ErrorState message onRetry />` shared component on all query error states
- `<EmptyState />` for empty playlists, search with no results

### Dark/Light Mode
- Default: dark (matches design tokens above)
- Toggle: settings dropdown in `AccountBar`
- Persistence: `localStorage.setItem('theme', 'dark' | 'light')`
- System preference: read `prefers-color-scheme` on first load if no saved preference
- **Implementation — Tailwind class strategy:**
  1. Add `darkMode: 'class'` to `tailwind.config.ts`
  2. Toggle `class="dark"` on `<html>` element when theme changes
  3. Use Tailwind `dark:` variants in component classes (e.g., `bg-white dark:bg-[#0a0a0a]`)
  4. CSS custom properties in `index.css` define base tokens; `dark:` classes override as needed
  - Do NOT use `data-theme` attribute (DaisyUI pattern — removed in Phase 1)

### Accessibility
- `aria-label` on all icon-only buttons (play, pause, next, skip, volume, shuffle, repeat)
- Keyboard navigation for player controls (Space = play/pause, Arrow keys = seek)
- Visible focus rings (Tailwind `focus-visible:ring-2 focus-visible:ring-accent` pattern)

### Performance
- `React.lazy` + `Suspense` for heavy views (Search, Browse)
- `useMemo`/`useCallback` only where measurable re-render cost exists
- Playback polling: 1s refetch interval only when `playbackState.is_playing === true`

### Testing — Files Requiring Mock Path Updates

The following test files import from paths that will change and must be updated:

| Test File | Imports That Change |
|---|---|
| `src/api/auth/service/tests/auth.service.test.ts` | → `src/lib/auth/auth.service.ts` |
| `src/api/spotify/tests/base.service.test.ts` | → `src/lib/api/base.service.ts` |
| `src/api/spotify/tests/album.service.test.ts` | → `src/lib/api/album.service.ts` |
| `src/api/spotify/tests/artist.service.test.ts` | → `src/lib/api/artist.service.ts` |
| `src/api/spotify/tests/browse.service.test.ts` | → `src/lib/api/browse.service.ts` |
| `src/api/spotify/tests/playlist.service.test.ts` | → `src/lib/api/playlist.service.ts` (keep this one) |
| `src/api/spotify/playlist.service.test.ts` | Delete — duplicate of the above; consolidate into `tests/` subdirectory |
| `src/api/spotify/tests/search.service.test.ts` | → `src/lib/api/search.service.ts` |
| `src/api/spotify/tests/track.service.test.ts` | → `src/lib/api/track.service.ts` |
| `src/api/spotify/playback.service.test.ts` | → `src/lib/api/playback.service.ts` |
| `src/hooks/tests/useAuthToken.test.ts` | → `src/lib/utils/tokenUtils.ts` (if imported) |
| `src/utils/tests/tokenUtils.test.ts` | → `src/lib/utils/tokenUtils.ts` |

**New tests to add:**
- `src/hooks/tests/useSpotifyApi.test.ts` — authenticated/unauthenticated behavior
- `src/components/ui/tests/ErrorState.test.tsx` — renders message, calls onRetry

**strict mode is already on** — the Phase 5 gate is: zero type errors under the existing `strict: true` setting after all refactoring is complete.

---

## What Is NOT Changing

- PKCE OAuth flow logic (correct as-is)
- React Query for all server state
- Zustand for UI state
- Vitest + React Testing Library setup
- Conventional Commits + Husky hooks
- Vite build system

---

## Success Criteria

- [ ] Zero `any` types in TypeScript
- [ ] Zero console.logs in production code
- [ ] Zero TypeScript errors under existing `strict: true` setting
- [ ] All 21 existing test files pass (243 individual test cases) plus 2 new test files
- [ ] Mobile layout works on 375px viewport with bottom tab bar
- [ ] Auth flow works end-to-end (login → token → refresh → logout)
- [ ] Sidebar shows real user playlists
- [ ] Player controls work (play, pause, next, previous, seek, volume)
- [ ] Search returns and displays results
- [ ] Profile shows real user data
- [ ] Dark/light mode toggle works and persists
- [ ] Build passes with `npm run build`
- [ ] Coverage threshold maintained (60%)
