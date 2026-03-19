You are a senior staff-level software engineer and UI/UX expert.

Your task is to fully revamp and modernize this project:
https://github.com/frank-mendez/react-typescript-spotify

Do NOT make superficial changes. Perform a deep, end-to-end refactor.

---

## 🎯 OBJECTIVES

Transform this into a production-quality, portfolio-worthy Spotify client that demonstrates:

- Clean architecture
- Strong TypeScript practices
- Modern React patterns
- Excellent UX/UI (desktop + mobile)
- Secure and correct Spotify auth flow

---

## 🧠 CODEBASE AUDIT FIRST

1. Analyze the entire codebase before making changes
2. Identify:
   - Dead code / unused components / unused hooks
   - Duplicate logic
   - Poor state management patterns
   - Anti-patterns in React (prop drilling, unnecessary re-renders, etc.)
   - Weak TypeScript usage (any types, missing types)
3. Document issues BEFORE refactoring (create a `REFACTOR_PLAN.md`)

---

## 🧹 REFACTOR REQUIREMENTS

### Architecture

- Restructure into a scalable folder architecture:
  - /app or /pages
  - /components (ui, layout, feature-based)
  - /lib (api, utils)
  - /hooks
  - /types
  - /services (Spotify API layer)
- Separate business logic from UI

### TypeScript

- Remove ALL `any`
- Add strict typing for:
  - API responses
  - hooks
  - components
- Create centralized types for Spotify entities

---

## 🔐 AUTH FLOW (CRITICAL)

Fix and modernize Spotify authentication:

- Implement Authorization Code Flow with PKCE
- Handle:
  - Access token
  - Refresh token
  - Token expiration
- Store tokens securely (avoid unsafe localStorage usage if possible)
- Add proper error handling and retry logic
- Create a clean `auth service`

---

## 🎨 UI/UX REVAMP

### Design System

- Use:
  - Tailwind CSS (latest version)
  - shadcn/ui components
- Create consistent:
  - spacing
  - typography
  - color system (Spotify-inspired but not copy-paste)

### Layout

- Responsive design:
  - Mobile-first
  - Tablet
  - Desktop
- Add:
  - Sidebar navigation
  - Sticky player bar
  - Clean header

### Components

- Rebuild:
  - Player UI
  - Playlist view
  - Track list
  - Search
- Use reusable, composable components

### UX Improvements

- Loading skeletons
- Empty states
- Error states
- Smooth transitions (optional: framer-motion)

---

## ⚙️ STATE MANAGEMENT

- Replace messy state with:
  - React Query (TanStack Query) for API data
  - Local state only where necessary
- Avoid unnecessary global state

---

## 🚀 PERFORMANCE

- Optimize re-renders
- Memoize where appropriate
- Lazy load heavy components
- Optimize API calls

---

## 🧪 CODE QUALITY

- Add:
  - ESLint (strict)
  - Prettier
- Fix all lint issues
- Ensure consistent naming conventions

---

## 📦 DEPENDENCIES

- Update:
  - React (latest stable)
  - Tailwind (latest)
- Add:
  - shadcn/ui
  - @tanstack/react-query
  - axios or fetch wrapper

---

## 📄 DELIVERABLES

1. Fully refactored codebase
2. `REFACTOR_PLAN.md` (before changes)
3. `ARCHITECTURE.md` explaining:
   - folder structure
   - data flow
4. Clean commit structure (group related changes)

---

## ⚠️ RULES

- Do not break functionality
- Prefer clarity over cleverness
- Remove anything unnecessary
- Keep code readable and maintainable
- Think like a tech lead reviewing this for production

---

## 🧠 BONUS (if time permits)

- Add dark/light mode
- Add recently played
- Add playback controls polish
- Add basic testing setup

---

Act like you are preparing this project to impress a CTO and senior engineers reviewing a GitHub portfolio.

Start with analysis, then refactor step-by-step.
