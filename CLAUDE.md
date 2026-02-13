# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

India AI Summit 2026 — a React + TypeScript + Vite conference session browser. Users can filter, search, and save sessions to a personal schedule, and export saved sessions as a `.ics` calendar file. The UI uses a bento grid layout with glassmorphism styling.

## Commands

```bash
pnpm dev          # Start dev server (auto-installs deps)
pnpm build        # Dev build with source-identifier plugin enabled
pnpm build:prod   # Production build (BUILD_MODE=prod disables source identifiers)
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
pnpm clean        # Remove node_modules and lock file
```

No test framework is configured — there are no tests to run.

## Architecture

### Data Flow

1. `useSessions()` fetches static JSON from `/public/data/sessions.json`
2. `inferTopic()` in `src/types/session.ts` assigns topics via keyword matching on title/description
3. `useFilteredSessions(sessions, filters, searchQuery, speakerQuery, partnerQuery)` applies search + multi-dimensional filters (topic, date, time, location, knowledge partner, speaker) using `useMemo`. The `speakerQuery`/`partnerQuery` params enable live-as-you-type filtering — typed text is combined with selected tags into one filter list using partial case-insensitive matching
4. `useSchedule()` persists saved sessions to localStorage under key `ai-summit-schedule`
5. `downloadICS()` in `src/lib/calendar.ts` generates and downloads a `.ics` file from saved sessions

### Key Files

- **`src/App.tsx`** (~690 lines) — monolithic main component containing the full page layout, filter sidebar (with typeahead inputs for speakers/partners), session grid, schedule panel with .ics export button. Stats cards (Sessions, Speakers, Venues) are reactive to `filteredSessions`
- **`src/hooks/useSessions.ts`** — three hooks: `useSessions`, `useFilteredSessions` (accepts `speakerQuery`/`partnerQuery` for live text filtering), `useSchedule`
- **`src/types/session.ts`** — `Session` and `FilterState` interfaces (`FilterState` includes `speakers: string[]`), `TOPICS`/`TIME_SLOTS` constants, `inferTopic()` function
- **`src/lib/calendar.ts`** — `generateICS()` and `downloadICS()` for .ics calendar file export (no external libraries; parses date formats like `"16 Feb 2026"` + `"9:30 AM"` or time ranges like `"11:30 AM - 1:00 PM"`)
- **`src/components/`** — small reusable components: `SessionCard`, `SessionModal`, `ScheduleSidebar`, `SearchBar`, `FilterChip`, `ErrorBoundary`

### Styling

- Tailwind CSS v3 with custom glassmorphism utility classes in `src/index.css`: `glass-card`, `glass-card-hover`, `glass-nav`, `glass-modal`, `accent-gradient`, `tag-purple`, `tag-cyan`, `tag-blue`
- Font: Poppins (primary), system fallback
- shadcn/ui is configured (`components.json`, new-york style, zinc base) but components in `src/components/` are hand-written, not generated from shadcn

### Build & TypeScript

- Vite with `@vitejs/plugin-react` (Babel/Fast Refresh) and `vite-plugin-source-identifier` (dev-only `data-matrix` attributes)
- Path alias: `@/` → `src/`
- TypeScript strict mode is **off** (`tsconfig.app.json`); `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` are all disabled
- ESLint disables `@typescript-eslint/no-unused-vars` and `@typescript-eslint/no-explicit-any`

### Filtering

- **Topic, Date, Venue, Time Slot**: chip/button toggle filters
- **Knowledge Partners & Speakers**: typeahead text inputs with autocomplete dropdown (opens upward via `bottom-full` to avoid z-index overlap with stats cards below). Sessions filter live as you type — typed text and selected suggestion tags are combined. Matching is partial and case-insensitive (e.g. typing `"Deshpande"` matches `"Dr Anand Deshpande, Persistent Systems, Pune"`)
- **Stats cards** (Sessions, Speakers, Venues) update reactively based on `filteredSessions`; Saved count remains independent
- Speaker names in data often include org info (e.g. `"Name, Organization"`) — partial matching handles this

### Dependencies of Note

Many Radix UI primitives and shadcn-adjacent packages (react-hook-form, zod, recharts, react-router-dom, embla-carousel, etc.) are installed but largely unused — they came from the shadcn/ui scaffold. The app primarily uses Lucide React for icons and Tailwind for styling.
