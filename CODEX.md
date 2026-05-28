# CODEX.md

This file gives Codex-specific working guidance for the moyemap repository.

## Project Snapshot

MoyeMap is a Korean map-first discovery service for social parties, solo bars, guesthouse parties, and networking events. The product goal is fast comparison by location, price, schedule, and vibe, then conversion through an external reservation or inquiry link.

The current app is a Next.js 16 App Router project using React 19, TypeScript, Tailwind CSS v4, lucide-react, and the Naver Cloud Map SDK loaded from a script in `src/app/layout.tsx`.

## Commands

- `yarn dev`: start local dev server on `localhost:3000`
- `yarn build`: production build
- `yarn lint`: run ESLint

## Repository Map

- `src/app/layout.tsx`: root layout, metadata, Naver Map script loading, global header
- `src/app/page.tsx`: main map/list/filter experience
- `src/app/party/[id]/page.tsx`: detail route, static params, metadata
- `src/app/party/[id]/PartyDetailContent.tsx`: party detail UI
- `src/components/Header.tsx`: brand header and theme toggle
- `src/components/NaverMap.tsx`: Naver map lifecycle, markers, info windows, map/list sync
- `src/components/QuickFilters.tsx`: filter chips
- `src/components/PartyListPanel.tsx`: sorted list panel
- `src/components/PartyCard.tsx`: repeated party card
- `src/components/ThemeProvider.tsx`: light/dark theme state
- `src/data/mockParties.ts`: demo party data
- `src/types/party.ts`: core product types
- `src/types/naver-maps.d.ts`: minimal Naver Maps declarations

## Product Rules

- User-facing copy must be Korean.
- Currency must use Korean Won, formatted with `toLocaleString()`.
- Preserve the map-first UX: desktop should prioritize sidebar + map, mobile should prioritize map/list switching and bottom sheet ergonomics.
- External conversion is core. Do not bury reservation/inquiry CTAs.
- MVP does not include login, internal payment, host admin, or user-generated reviews.

## UI/UX Direction

- Favor dense, scannable information over marketing-page composition.
- For cards, prioritize title, date/time, price, location, category, and one or two decision-making attributes.
- Keep category colors distinct and consistent across chips, cards, markers, and detail pages.
- Use lucide-react icons for interface controls where available.
- Avoid adding explanatory in-app text about how the UI works; make controls self-evident.
- Mobile bottom sheet work should be tested at small viewport widths because it is a primary flow.
- Do not let map overlays, sticky CTAs, or bottom sheets cover essential controls or content.
- Keep card border radii moderate unless preserving existing local style requires otherwise.

## Current Product Gaps To Respect

- Local `Party` type does not include schedule/time/age/gender-ratio fields, while the deployed site appears to expose some of those values. Before adding UX around those fields, update `src/types/party.ts`, mock data, cards, filters, and detail pages together.
- PRD mentions schedule filters. Local `QuickFilters.tsx` currently has category, price, and region filters only.
- `robots.ts` and `sitemap.ts` currently use `https://moyemap.com`; the visible current service URL is `https://moyemap.lomeone.com/`.
- `NaverMap` has an `onBoundsChange` prop and a "이 지역에서 다시 검색" button, but current local behavior only hides the button unless the parent connects bounds to filtering or API calls.
- Source URLs are dummy `example.com` links in local mock data.

## Engineering Guidelines

- Prefer the existing component style and Tailwind token names from `globals.css`.
- Keep changes scoped. This is a small app, so avoid introducing global state libraries or data-fetching abstractions until real API integration requires them.
- When editing map behavior, be careful with the Naver Maps imperative lifecycle. Clean up markers, info windows, global callbacks, and map instances.
- Avoid raw string manipulation for structured product data. Update types first, then mock data and UI.
- The React Compiler is enabled; keep component code straightforward and avoid unnecessary memoization unless it solves a real issue.
- Treat `mockParties.ts` as demo data, not a permanent domain source.

## Validation Checklist

Before finishing UI or product-flow changes:

- Run `yarn lint` when feasible.
- Run `yarn build` for route, type, and Next.js integration changes.
- Verify Korean copy and Won formatting.
- Check desktop layout with sidebar + map.
- Check mobile layout with map/list toggle and bottom sheet.
- Check detail page CTA and image slider.
- Confirm missing `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` has a usable fallback message.

## Suggested Next Work

1. Align deployed and local data shape by adding date, time, age range, and optional gender-ratio fields if they are part of the intended MVP.
2. Add schedule filters: `오늘`, `내일`, `이번 주말`.
3. Update sitemap and robots base URL to the active domain or an environment-driven site URL.
4. Connect map bounds changes to real filtering or future API query parameters.
5. Add analytics events for marker click, card click, detail view, and outbound CTA click.
