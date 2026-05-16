# Changelog

All notable changes to CryptoTraderPro are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.3.0] — 2026-05-16

### Added
- **Sorting** — click any column header (Price, 24h %, Market Cap, Volume) to sort asc/desc
- **Pagination** — 25 rows per page with Prev/Next controls and page indicator
- **OHLC Candlestick Chart** — `CandlestickChart` component using `lightweight-charts` v4
- **React Query provider** — `QueryClientProvider` wrapping the app; `useMarketsQuery` hook with stale-time 60s
- **Zod schemas** — `src/lib/schemas.ts` validates all CoinGecko API responses at runtime
- **Unit tests** — `formatters.test.ts` + `schemas.test.ts` with Vitest
- **CHANGELOG.md** — this file
- **nav links** in Header — Dashboard / Watchlist / Portfolio

### Changed
- `package.json` bumped to `0.3.0`
- `page.tsx` uses `SortField`/`SortDir` state; pagination slice
- `Header.tsx` extended with nav links

### Fixed
- `manifest.json` scope/start_url corrected for GitHub Pages `basePath`

---

## [0.2.0] — 2026-05-16

### Added
- All empty folders populated: API layer, hooks, Zustand stores, UI components, Portfolio page, Watchlist page
- `SparklineChart`, `CoinRow`, `KPICard`, `Header`, `LiveTicker` components
- `useCoinGecko`, `useWatchlist`, `useTheme` hooks
- `portfolioStore`, `watchlistStore` with Zustand persist
- `formatters.ts` shared number/date utilities
- `EmptyState`, `Skeleton`, `Badge` UI primitives

---

## [0.1.0] — 2026-05-15

### Added
- Initial Next.js 15 + TypeScript + TailwindCSS scaffold
- Live ticker bar, market table (top 100), dark/light mode
- GitHub Actions workflow for GitHub Pages deployment
- PWA manifest, favicon SVG, OG metadata
