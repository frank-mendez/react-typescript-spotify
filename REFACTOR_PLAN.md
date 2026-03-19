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
