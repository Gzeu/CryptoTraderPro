# CryptoTraderPro

<div align="center">

![Version](https://img.shields.io/badge/version-0.8.0-01696f?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-000?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2-22c55e?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square)
[![Deploy](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/deploy.yml/badge.svg)](https://github.com/Gzeu/CryptoTraderPro/actions)

**Professional cryptocurrency trading dashboard.**  
Real-time WebSocket prices · Portfolio P&L · Price Alerts · MultiversX/EGLD native support · Binance WS singleton · CryptoPanic news feed.

[🔗 Live Demo](https://gzeu.github.io/CryptoTraderPro) · [📋 Changelog](./CHANGELOG.md) · [🐛 Issues](https://github.com/Gzeu/CryptoTraderPro/issues)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 📊 **Market Dashboard** | Top 50 coins live, sortable by Price / 24h% / MCap / Volume |
| ⚡ **Binance WebSocket** | Singleton `priceFeed` — batched subscriptions, exponential reconnect |
| 💼 **Portfolio Tracker** | Add positions with buy price, live P&L per row, pie chart, CSV export |
| 🔔 **Price Alerts** | Above/below thresholds → browser `Notification API`, persisted Zustand |
| ⭐ **Watchlist** | Star any coin, live prices via WS, persistent `/watchlist` page |
| 🔍 **Global Search** | `Cmd+K` modal — live filter, keyboard nav `↑↓↵Esc` |
| ⌨️ **Keyboard Shortcuts** | `D` dashboard · `W` watchlist · `P` portfolio · `A` alerts · `?` help |
| 📰 **Crypto News** | CryptoPanic feed per coin, paginated, vote counts |
| 📈 **TradingView Charts** | Embedded Advanced Chart per coin (SSR-safe dynamic import) |
| ↔️ **Compare** | Side-by-side dual-chart overlay, normalized to 100% |
| 🧪 **Backtest** | SMA crossover strategy on Binance OHLC klines, equity curve |
| 🌐 **EGLD Dashboard** | MultiversX economics, staking APR, validators, live EGLDUSDT price |
| 🌗 **Dark / Light Mode** | `prefers-color-scheme` default + manual `data-theme` toggle |
| 🛡️ **Error Boundary** | React class ErrorBoundary — catch + retry UI, no raw stack traces |
| 🗺️ **SEO Sitemap** | Dynamic `sitemap.ts` — home + portfolio + watchlist + top-15 coins |

---

## 🛠 Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js App Router | 14 |
| Language | TypeScript | 5.6 |
| Styling | TailwindCSS | 3.4 |
| Server state | @tanstack/react-query | 5 |
| Client state | Zustand + persist | 4.5 |
| Charts | Recharts | 2 |
| HTTP | Axios + retry interceptor | 1.7 |
| Icons | Lucide React | latest |
| Data | CoinGecko API v3 | free / Pro |
| News | CryptoPanic API v1 | free |
| Live prices | Binance WebSocket | public |
| EGLD | MultiversX API | public |

---

## 🚀 Getting Started

```bash
# Install
npm install

# Configure environment (copy and fill in)
cp .env.example .env.local

# Dev server
npm run dev         # http://localhost:3000

# Type check + lint
npm run type-check
npm run lint

# Build
npm run build
```

---

## 🔑 Environment Variables (`.env.local`)

```bash
# CoinGecko (free tier works without key; Pro removes 429 rate limit)
COINGECKO_API_KEY=                          # optional
NEXT_PUBLIC_COINGECKO_BASE=https://api.coingecko.com/api/v3

# CryptoPanic — news feed per currency
CRYPTOPANIC_API_KEY=                        # REQUIRED — https://cryptopanic.com/developers/api/
NEXT_PUBLIC_CRYPTOPANIC_BASE=https://cryptopanic.com/api/v1

# MultiversX (EGLD dashboard)
MULTIVERSX_API_URL=https://api.multiversx.com
NEXT_PUBLIC_MULTIVERSX_EXPLORER=https://explorer.multiversx.com

# Binance WebSocket (public, no auth)
NEXT_PUBLIC_BINANCE_WS_BASE=wss://stream.binance.com:9443
NEXT_PUBLIC_BINANCE_REST_BASE=https://api.binance.com/api/v3

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CryptoTraderPro
```

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: ThemeProvider, QueryClient, ErrorBoundary, Header
│   ├── providers.tsx             # ReactQueryDevtools + QueryClientProvider
│   ├── globals.css               # CSS variables: Nexus palette light/dark, fluid type scale
│   ├── page.tsx                  # /  → Dashboard: top coins table, global stats, search modal
│   ├── sitemap.ts                # Dynamic sitemap (home + portfolio + watchlist + top-15 coins)
│   ├── error.tsx                 # Global error boundary page
│   ├── not-found.tsx             # 404 page
│   │
│   ├── portfolio/page.tsx        # /portfolio → table + pie chart, Binance WS live prices
│   ├── watchlist/page.tsx        # /watchlist  → live prices per coin card
│   ├── alerts/page.tsx           # /alerts     → threshold triggers + Notification API
│   ├── compare/page.tsx          # /compare    → side-by-side dual-chart, normalized %
│   ├── backtest/page.tsx         # /backtest   → SMA crossover, equity curve, metrics
│   ├── egld/page.tsx             # /egld       → MultiversX EGLD dedicated dashboard
│   │
│   ├── coin/[id]/page.tsx        # /coin/[id]  → TradingView chart, stats, news, live price
│   │
│   └── api/                      # Route Handlers — server-side proxy (hides API keys)
│       ├── coins/route.ts        # GET /api/coins
│       ├── coin/[id]/route.ts    # GET /api/coin/[id]
│       ├── chart/[id]/route.ts   # GET /api/chart/[id]?days=
│       ├── news/route.ts         # GET /api/news?currency=
│       ├── global/route.ts       # GET /api/global
│       ├── search/route.ts       # GET /api/search?q=
│       ├── egld/route.ts         # GET /api/egld (MultiversX aggregated)
│       └── alerts/check/route.ts # POST /api/alerts/check
│
├── components/
│   ├── Header.tsx                # Sticky nav: logo, links, theme toggle, Cmd+K
│   ├── SearchModal.tsx           # Cmd+K modal: live filter + keyboard nav
│   ├── ErrorBoundary.tsx         # React class ErrorBoundary
│   │
│   ├── charts/
│   │   ├── PortfolioPieChart.tsx # Recharts PieChart — tooltip, legends, animation
│   │   ├── PriceLineChart.tsx    # Recharts AreaChart — price history
│   │   └── CompareChart.tsx      # Recharts dual-axis LineChart
│   │
│   ├── coin/
│   │   ├── CoinNewsFeed.tsx      # Wrapper → CryptoPanicFeed
│   │   ├── CryptoPanicFeed.tsx   # News cards, skeleton, pagination
│   │   └── TradingViewWidget.tsx # TradingView Advanced Chart (SSR-safe)
│   │
│   ├── portfolio/
│   │   └── PortfolioTable.tsx    # Live dot ●, P&L colored, remove button
│   │
│   ├── watchlist/
│   │   └── WatchlistCard.tsx     # Card with live price + 24h%
│   │
│   ├── alerts/
│   │   └── AlertRow.tsx          # Target price, current price, status badge
│   │
│   └── ui/
│       ├── Skeleton.tsx          # Shimmer skeleton
│       ├── Badge.tsx             # Color badge (success/error/warning/info)
│       ├── Tooltip.tsx           # CSS-only accessible tooltip
│       └── Button.tsx            # primary / secondary / ghost / danger variants
│
├── hooks/
│   ├── useLivePrice.ts           # Single symbol via priceFeed singleton
│   ├── usePortfolioLivePrices.ts # portfolioStore + useLivePrices → rows with isLive
│   ├── useMultiTickerWS.ts       # Direct Binance WS (fallback)
│   ├── useTheme.ts               # Light/dark with data-theme on <html>
│   ├── useKeyboardShortcuts.ts   # Global shortcuts, auto-cleanup
│   ├── usePortfolioExport.ts     # CSV blob download
│   └── useDebounce.ts            # Generic debounce
│
├── lib/
│   ├── ws/priceFeed.ts           # Singleton Binance WS: subscribe/unsubscribe, batching, reconnect
│   ├── api/
│   │   ├── coingecko.ts          # Typed CoinGecko fetchers
│   │   ├── cryptopanic.ts        # CryptoPanic news fetcher
│   │   ├── multiversx.ts         # MultiversX economics + stats
│   │   └── binance.ts            # Binance klines/OHLC fetcher
│   ├── formatters.ts             # fmtPrice / fmtLarge / fmtPct / fmtDate
│   ├── cgToBinance.ts            # CoinGecko id → Binance USDT symbol map
│   └── constants.ts              # TOP_COINS, DEFAULT_CURRENCY, REFRESH_INTERVALS
│
├── store/
│   ├── portfolioStore.ts         # Zustand persist — entries[], addEntry, removeEntry
│   ├── watchlistStore.ts         # Zustand persist — coinIds[], add, remove, has
│   └── alertsStore.ts            # Zustand persist — alerts[], addAlert, updateStatus
│
└── types/
    ├── coingecko.ts
    ├── cryptopanic.ts
    ├── multiversx.ts
    └── portfolio.ts              # PortfolioEntry, PortfolioRow, AlertEntry
```

---

## ⚡ Binance WebSocket — `priceFeed` Singleton

All live prices flow through a single managed WebSocket connection:

```
wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker/egldusdt@miniTicker
```

**API:**
```typescript
priceFeed.subscribe(symbol, cb) → unsubscribeFn
priceFeed.getCached(symbol)     → TickerPayload | null
```

- Subscriptions from the same React render tick are **batched after 40ms** → 1 reconnect
- Reconnect: exponential `1.5s → 3s → 6s → 12s → 24s`, max 5 retries
- Use `useLivePrices(symbols[])` — never subscribe to Binance WS directly

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+K` / `Ctrl+K` | Open global search |
| `D` | Go to Dashboard |
| `W` | Go to Watchlist |
| `P` | Go to Portfolio |
| `A` | Go to Alerts |
| `?` | Show shortcuts help |
| `Esc` | Close modal / search |

---

## 💰 Formatters (`src/lib/formatters.ts`)

```typescript
fmtPrice(42341.5)     // "$42,341.50"
fmtPrice(0.000123)    // "$0.000123"
fmtLarge(1_230_000)   // "$1.23M"
fmtPct(3.45)          // "+3.45%"
fmtDate(timestamp)    // "May 17, 2026 · 01:33"
```

All numeric values in the UI must be wrapped in `fmtPrice / fmtLarge / fmtPct` and use the `tabular-nums` CSS class.

---

## 🌐 EGLD / MultiversX

CryptoTraderPro has first-class support for the MultiversX ecosystem:

- **Dedicated `/egld` dashboard** — price, 24h%, marketcap, staking APR, total supply, validators, transactions
- **Live EGLDUSDT price** via Binance WS `priceFeed`
- **Route handler** `/api/egld` aggregates `/economics` + `/stats` from `api.multiversx.com`
- **Direct link** to [MultiversX Explorer](https://explorer.multiversx.com)
- **Full coin detail** at `/coin/elrond-erd-2` with TradingView chart + CryptoPanic news

---

## 🤝 Extending the App

| Task | Where to add |
|---|---|
| New coin WS support | `src/lib/cgToBinance.ts` |
| New external API | `src/lib/api/{service}.ts` + `src/app/api/{service}/route.ts` |
| New Zustand store | `src/store/{name}Store.ts` with `persist` middleware |
| New page | `src/app/{route}/page.tsx` + entry in `sitemap.ts` |
| New WS hook | Build on `useLivePrices` — never raw Binance WS |

---

## 🗺️ Roadmap

| Feature | Status |
|---|---|
| Dashboard top coins + search Cmd+K | ✅ v0.5.0 |
| Keyboard shortcuts globale | ✅ v0.5.0 |
| ErrorBoundary + Axios retry 429 | ✅ v0.5.0 |
| Sitemap dinamic SEO | ✅ v0.5.0 |
| priceFeed singleton WS | ✅ v0.7.0 |
| CoinNewsFeed → CryptoPanicFeed | ✅ v0.7.0 |
| usePortfolioLivePrices + pie chart | ✅ v0.8.0 |
| Live dot ● per row portfolio | ✅ v0.8.0 |
| Flash animație preț schimbat | 🔲 v0.9.0 |
| 24h% per row portfolio (from WS) | 🔲 v0.9.0 |
| /alerts page cu Notification API | 🔲 v0.9.0 |
| /compare dual-chart normalizat | 🔲 v0.10.0 |
| /backtest SMA crossover | 🔲 v0.10.0 |
| /egld MultiversX dashboard | 🔲 v0.11.0 |
| Supabase auth + cloud sync | 🔲 v1.0.0 |
| Mobile PWA + push notifications | 🔲 v1.0.0 |

---

## 📦 Deployment

Auto-deployed to **GitHub Pages** via GitHub Actions on every push to `main`.

```yaml
# .github/workflows/deploy.yml:
# 1. npm ci + next build
# 2. next export → /out
# 3. Deploy /out to gh-pages branch
```

Live URL: `https://gzeu.github.io/CryptoTraderPro`

---

## 🤝 Contributing

```bash
git checkout -b feat/your-feature
npm run dev
npm run type-check
git push origin feat/your-feature
# Open Pull Request
```

Follow existing code style (Prettier + ESLint config included).

---

## 📄 License

MIT © [Gzeu](https://github.com/Gzeu)
