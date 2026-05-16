# Changelog

All notable changes to CryptoTraderPro are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.6.0] — 2026-05-16

### Added
- **Binance WebSocket feed** — `useBinanceWS` hook subscribes to Binance `24hrMiniTicker` combined stream for 20 coins (including EGLD). Real-time prices without polling. Auto-reconnects with 2s backoff. Symbol map: CoinGecko id → Binance symbol.
- **Backtesting engine** — `useBacktest` hook with three strategies:
  - `Buy & Hold` — single position from start to end
  - `SMA Cross` — Fast SMA(9) vs Slow SMA(21) crossover
  - `RSI Oversold` — buy RSI<30, sell RSI>70
  - Metrics: Total Return %, Win Rate %, Max Drawdown %, Sharpe Ratio, trade log table
- **BacktestPanel** component on coin detail page — strategy + range selector, stats grid, scrollable trades table
- **Portfolio CSV export** — `src/lib/exportCsv.ts` with proper CSV escaping; Download button in portfolio header triggers `portfolio-YYYY-MM-DD.csv`
- **Header fully wired** — `useKeyboardShortcuts` + `SearchModal` + help overlay (`?` key / keyboard icon) all wired in `Header.tsx`; active nav link highlighting; alert badge counter; bell icon in actions
- `portfolioStore.ts` — typed with `PortfolioEntry` interface, exported

### Changed
- `package.json` bumped to `0.6.0`
- Coin detail page updated: default range `30d`, backtest toggle button, `BacktestPanel` section
- Portfolio page: added export CSV button, enriched rows with `currentValue`, live price from markets query

---

## [0.5.0] — 2026-05-16

### Added
- Global Search Modal (`Cmd+K`), keyboard shortcuts (`useKeyboardShortcuts`), ErrorBoundary, rate-limit retry (Axios 429), `sitemap.ts`, README fully rewritten

---

## [0.4.0] — 2026-05-16

### Added
- Coin detail page, alertStore, useAlertWatcher, useEGLD, EGLDCard, AlertsPanel, alerts page, vitest.config.ts, test setup

---

## [0.3.0] — 2026-05-16

### Added
- Sorting, pagination (25/page), CandlestickChart, React Query provider, Zod schemas, unit tests, CHANGELOG

---

## [0.2.0] — 2026-05-16

### Added
- All empty folders populated, portfolio/watchlist pages, all components and hooks

---

## [0.1.0] — 2026-05-15

### Added
- Initial Next.js 15 scaffold, live ticker, market table, dark/light mode, GitHub Actions deploy
