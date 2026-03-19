# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Type-check + production build
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run coverage     # Run tests with coverage report (60% threshold enforced)
```

Run a single test file:
```bash
npx vitest run src/api/spotify/tests/album.service.test.ts
```

## Environment Setup

Create `.env` in the project root:
```
VITE_CLIENT_ID=your_spotify_client_id
VITE_REDIRECT_URI=http://localhost:5173/
```

Read env vars via `import.meta.env` (e.g., `import.meta.env.VITE_CLIENT_ID`).

## Architecture

**Entry point**: `src/main.tsx` → `src/App.tsx` wraps the app in `QueryClientProvider` → `AuthProvider` → `RouterProvider`.

**Routing**: Defined in `src/routes/index.tsx` via `createBrowserRouter`. Protected routes use `<ProtectedRoute>` which checks auth state from `AuthContext`.

**Auth flow (PKCE)**:
- `src/api/auth/service/auth.service.ts` — PKCE OAuth 2.0 flow
- `src/context/AuthContext.tsx` + `AuthProvider` — global auth state
- `src/hooks/useAuthToken.ts` — hook to read current access token
- `src/utils/tokenUtils.ts` — `getValidAccessToken()` handles token refresh; do not duplicate this logic
- localStorage keys: `access_token`, `refresh_token`, `expires_in`, `expires`

**API layer** (`src/api/`):
- `src/api/spotify/base.service.ts` — `SpotifyApiClient` class; use this for all Spotify API requests, never call axios directly. Has a 401 interceptor that auto-refreshes tokens.
- `src/api/spotify/index.ts` — `SpotifyApi` facade aggregating all services (albums, artists, browse, playback, playlists, search, tracks)
- Individual services: `album.service.ts`, `artist.service.ts`, `browse.service.ts`, `playback.service.ts`, `playlist.service.ts`, `search.service.ts`, `track.service.ts`
- Playback endpoints return `null` for `204` responses — follow this pattern
- `src/api/user/` — user profile service and hooks

**React Query hooks** (`src/api/spotify/hooks/`):
- `useSpotifyQueries.ts` — all read queries (search, playback, playlists, artists, albums, etc.)
- `useSpotifyMutations.ts` — all write mutations
- Pattern: create a service method first, then expose it through a hook

**State management**:
- `src/context/` — React Context for auth state (global, session-scoped)
- `src/stores/useContentStore.ts` — Zustand for UI state (which content panel is active)

**Types**: `src/data-objects/interface/` for interfaces, `src/data-objects/enum/` for enums. Reuse these; don't duplicate.

**Styling**: Tailwind CSS + DaisyUI utility classes. Avoid inline styles.

## Commits

Follows Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.) enforced by commitlint + Husky pre-commit hooks.

## Testing

- Framework: Vitest + React Testing Library, jsdom environment
- Setup file: `tests/setup.ts`
- Test placement: co-located as `**/*.test.{ts,tsx}` or in `**/tests/` subdirectories
- Coverage minimum: 60% lines/branches/functions/statements
