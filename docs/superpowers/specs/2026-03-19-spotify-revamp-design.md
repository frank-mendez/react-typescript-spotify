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

### Key Changes

- `QueryClient` moved outside `App` component body (fixes cache-destroying re-render bug)
- `data-objects/` renamed to `types/` (standard naming convention)
- `api/` reorganized into `lib/api/` and `lib/auth/`
- Dead files deleted: `AuthDebugger.tsx`, `SpotifyApiDebugger.tsx`, `SpotifyApiTest.tsx`, `SpotifyPlayerNew.tsx`
- `ProtectedRoute` timeout (1s magic number) replaced with `AuthContext.isLoading` derived state

### Dependencies

- **Remove:** DaisyUI, MUI (`@mui/material`, `@mui/icons-material`), FontAwesome, react-icons
- **Add:** shadcn/ui, Lucide icons (ships with shadcn/ui), `class-variance-authority`, `clsx`, `tailwind-merge`
- **Update:** Tailwind CSS to latest stable

---

## Phase 2: Auth + API Layer

### Auth Cleanup

- Remove all 102 `console.log` statements from auth service, AuthProvider, tokenUtils, useAuthToken
- Add startup env validation: throw descriptive error if `VITE_CLIENT_ID` or `VITE_REDIRECT_URI` missing
- `ProtectedRoute`: derive `isLoading` from `AuthContext` instead of `setTimeout(..., 1000)`
- PKCE flow itself is correct — keep logic, clean surrounding code

### API Layer

- Migrate `user.service.ts` from raw `fetch` to `SpotifyApiClient` (gains 401 interceptor + auto-refresh)
- Add `useSpotifyApi()` hook: validates auth once, returns configured API instance or null
- Remove repetitive `const { accessToken } = useAuthToken()` pattern duplicated across all query/mutation hooks
- Keep `useSpotifyQueries.ts` and `useSpotifyMutations.ts` structure — just clean internals

### TypeScript Strictness

- Remove all `any` types — replace with proper interfaces or `unknown` + type guards
- Replace unsafe `error as { message?: string }` casts with proper error type guards
- Enable `strict: true` in `tsconfig.json`
- Centralize Spotify entity types:
  - `src/types/spotify.ts` — Artist, Album, Track, Playlist, Device, SearchResult
  - `src/types/auth.ts` — TokenResponse, AuthContextType
  - `src/types/playback.ts` — PlaybackState, CurrentlyPlaying

---

## Phase 3: UI/UX Design System

### Design Tokens

```
Background:    #0a0a0a
Surface:       #1a1a1a
Surface-hover: #242424
Accent:        #1ed760
Accent-muted:  #158a3e
Text-primary:  #ffffff
Text-muted:    #a3a3a3
Border:        #2a2a2a
```

Font: Inter (already imported via App.css → Outfit — swap to Inter).

### Layout

**Desktop:**
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

**Mobile:** Sidebar collapses to bottom tab navigation. Player bar becomes mini-player strip. Header shows logo + avatar only.

**Tablet:** Sidebar shows icon-only (collapsed) mode. Main content full width.

### shadcn/ui Components to Install

`Button`, `Card`, `Skeleton`, `Input`, `DropdownMenu`, `Slider`, `Avatar`, `Badge`, `Tooltip`, `ScrollArea`, `Separator`

### Icon Library

Replace all icon libraries with Lucide React (ships with shadcn/ui). Remove: `@mui/icons-material`, `react-icons`, `@fortawesome/*`.

### Components to Rebuild

| Component | Description |
|---|---|
| `layout/Header` | Search input (wired), profile avatar dropdown |
| `layout/Sidebar` | Real playlist data, collapsible, active state |
| `layout/PlayerBar` | Sticky bottom, progress slider, controls, volume |
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
| SearchBar | Unconnected input | Debounced search → `useSearchQuery` |
| ExpandContent | Static album | `useCurrentlyPlaying` — live track info |
| Dashboard routing | `useContentStore` unused | Store drives main panel view |

---

## Phase 5: Polish + Quality

### UX
- Loading skeletons on all data-fetching components (use shadcn/ui `Skeleton`)
- `<ErrorState message onRetry />` shared component on all query error states
- `<EmptyState />` for empty playlists, search with no results
- Dark/light mode via CSS variables + `data-theme` on `<html>`

### Accessibility
- `aria-label` on all icon-only buttons (play, pause, next, skip, volume)
- Keyboard navigation for player controls
- Visible focus rings (Tailwind `focus-visible:ring` pattern)

### Performance
- `React.lazy` + `Suspense` for heavy views (Search, Browse)
- `useMemo`/`useCallback` only where measurable re-render cost exists
- Playback polling strategy: 1s refetch only when music is actively playing

### Testing
- Keep all 21 existing tests passing through refactor
- Update mocks to match new file paths and interfaces
- Add tests for new `useSpotifyApi()` hook and `ErrorState` component

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
- [ ] All 21 existing tests pass
- [ ] Mobile layout works on 375px viewport
- [ ] Auth flow works end-to-end (login → token → refresh → logout)
- [ ] Sidebar shows real user playlists
- [ ] Player controls work (play, pause, next, previous, seek, volume)
- [ ] Search returns and displays results
- [ ] Profile shows real user data
- [ ] Build passes with `npm run build`
- [ ] Coverage threshold maintained (60%)
