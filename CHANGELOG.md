# Changelog

All notable changes to CryptoTraderPro are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.5.0] — 2026-05-16

### Added
- **Global Search Modal** (`Cmd+K` / `Ctrl+K`) — fuzzy search across all 100 coins, keyboard navigation (↑↓ Enter Esc), auto-close on selection, navigate to `/coin/[id]`
- **Keyboard Shortcuts** — `D` dashboard · `W` watchlist · `P` portfolio · `A` alerts · `?` help overlay · `Esc` dismiss; `useKeyboardShortcuts` hook
- **ErrorBoundary** component — catches render errors gracefully, shows retry button, dark/light aware
- **Rate-limit retry** — Axios interceptor retries on HTTP 429 with exponential backoff (1s → 2s → 4s, max 3 retries)
- **`src/app/sitemap.ts`** — Next.js dynamic sitemap for SEO (home + top 100 coin pages)
- **EGLDCard** wired into main dashboard KPI area
- **CHANGELOG.md** entries for all previous versions

### Changed
- `package.json` bumped to `0.5.0`
- README fully rewritten with badges, feature table, stack table, shortcuts, deployment docs

---

## [0.4.0] — 2026-05-16

### Added
- **Coin detail page** `src/app/coin/[id]/page.tsx` — price hero, 8-metric stats grid, OHLC chart with range selector, price alert form, description
- **`alertStore`** (Zustand + persist) — add/remove/markTriggered/clearAll
- **`useAlertWatcher`** — browser Notification API, permission request, session dedup
- **`useEGLD`** hook — zero extra API calls (reuses markets cache)
- **`EGLDCard`** component with MultiversX SVG logo and sparkline
- **`AlertsPanel`** component — active/triggered lists with remove
- **`/alerts` page** — full alerts manager
- **`vitest.config.ts`** — path alias `@/`, jsdom, globals, coverage v8
- **`src/test/setup.ts`** — `crypto.randomUUID` polyfill, console.warn silence

---

## [0.3.0] — 2026-05-16

### Added
- **Sorting** — click any column header (Price, 24h%, Market Cap, Volume) asc/desc
- **Pagination** — 25 rows/page with Prev/Next + page indicator
- **CandlestickChart** (`lightweight-charts` v4) with ResizeObserver
- **React Query provider** — `QueryClientProvider` + `useMarketsQuery` hook, stale 60s
- **Zod schemas** — `CoinSchema`, `MarketsResponseSchema`, `OHLCResponseSchema`, `GlobalSchema`
- **Unit tests** — `formatters.test.ts` + `schemas.test.ts`
- **CHANGELOG.md**

---

## [0.2.0] — 2026-05-16

### Added
- All empty folders populated: API layer, hooks, Zustand stores, UI components
- Portfolio page, Watchlist page
- `SparklineChart`, `CoinRow`, `KPICard`, `Header`, `LiveTicker`
- `useCoinGecko`, `useWatchlist`, `useTheme` hooks
- `portfolioStore`, `watchlistStore` with Zustand persist
- `formatters.ts`, `EmptyState`, `Skeleton`, `Badge`

---

## [0.1.0] — 2026-05-15

### Added
- Initial Next.js 15 + TypeScript + TailwindCSS scaffold
- Live ticker bar, market table (top 100), dark/light mode
- GitHub Actions workflow for GitHub Pages
- PWA manifest, favicon SVG, OG metadata
