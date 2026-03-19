# Architecture

## Folder Structure

```
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
```

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
