# CryptoTraderPro

<div align="center">

![Version](https://img.shields.io/badge/version-0.11.0-01696f?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-000?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2-22c55e?style=flat-square)
![MultiversX](https://img.shields.io/badge/MultiversX-EGLD-23F7DD?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMyM0Y3REQiLz48L3N2Zz4=)
![License](https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square)
[![Deploy](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/deploy.yml/badge.svg)](https://github.com/Gzeu/CryptoTraderPro/actions)

**Professional cryptocurrency trading dashboard.**  
Real-time WebSocket prices · Portfolio P&L · Price Alerts · Backtest · Compare · MultiversX/EGLD native · Address Inspector · CryptoPanic news · Binance WS singleton.

[🔗 Live Demo](https://gzeu.github.io/CryptoTraderPro) · [📋 Changelog](./CHANGELOG.md) · [🐛 Issues](https://github.com/Gzeu/CryptoTraderPro/issues) · [🌐 /egld Dashboard](#-egld--multiversx)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 📊 **Market Dashboard** | Top 50 coins live, sortable by Price / 24h% / MCap / Volume |
| ⚡ **Binance WebSocket** | Singleton `priceFeed` — batched subscriptions, exponential reconnect |
| 💼 **Portfolio Tracker** | Add positions with buy price, live P&L per row, 24h%, pie chart, CSV export |
| 🔔 **Price Alerts** | Above/below thresholds → browser `Notification API`, persisted Zustand |
| ⭐ **Watchlist** | Star any coin, live prices via WS, persistent `/watchlist` page |
| 🔍 **Global Search** | `Cmd+K` modal — live filter, keyboard nav `↑↓↵Esc` |
| ⌨️ **Keyboard Shortcuts** | `D` dashboard · `W` watchlist · `P` portfolio · `A` alerts · `?` help |
| 📰 **Crypto News** | CryptoPanic feed per coin, paginated, vote counts |
| 📈 **TradingView Charts** | Embedded Advanced Chart per coin (SSR-safe dynamic import) |
| ↔️ **Compare** | Side-by-side dual-chart overlay, normalized to 100% |
| 🧪 **Backtest** | SMA crossover strategy on Binance OHLC klines, equity curve |
| 🌐 **EGLD Dashboard** | MultiversX economics, staking APR, validators, live EGLDUSDT · `● LIVE` |
| 🔎 **Address Inspector** | `erd1...` wallet lookup — EGLD balance, ESDT tokens, NFTs, recent txs |
| ✨ **PriceFlash** | Green/red flash 600ms on every price update across all pages |
| 🟢 **LiveDot** | Reusable animated live indicator — `<LiveDot showLabel />` |
| 🌗 **Dark / Light Mode** | `prefers-color-scheme` default + manual `data-theme` toggle |
| 🛡️ **Error Boundary** | React class ErrorBoundary — catch + retry UI, no raw stack traces |
| 🗺️ **SEO Sitemap** | Dynamic `sitemap.ts` — home + portfolio + watchlist + top-15 coins + EGLD |

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

# Configure environment
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
COINGECKO_API_KEY=
NEXT_PUBLIC_COINGECKO_BASE=https://api.coingecko.com/api/v3

# CryptoPanic — news feed per currency
CRYPTOPANIC_API_KEY=                        # REQUIRED — https://cryptopanic.com/developers/api/
NEXT_PUBLIC_CRYPTOPANIC_BASE=https://cryptopanic.com/api/v1

# MultiversX (EGLD dashboard + Address Inspector)
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
│   ├── sitemap.ts                # Dynamic sitemap (home + portfolio + watchlist + top-15 coins + /egld)
│   ├── error.tsx                 # Global error boundary page
│   ├── not-found.tsx             # 404 page
│   │
│   ├── portfolio/page.tsx        # /portfolio → table + pie chart, Binance WS live prices
│   ├── watchlist/page.tsx        # /watchlist  → live prices per coin card
│   ├── alerts/page.tsx           # /alerts     → threshold triggers + Notification API
│   ├── compare/page.tsx          # /compare    → side-by-side dual-chart, normalized %
│   ├── backtest/page.tsx         # /backtest   → SMA crossover, equity curve, metrics
│   │
│   ├── egld/
│   │   ├── page.tsx              # /egld       → EGLD KPI cards, staking, validators, wallet input
│   │   └── [address]/page.tsx    # /egld/erd1… → balance, ESDT tokens, NFTs, recent transactions
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
│       ├── egld/route.ts         # GET /api/egld          — aggregates /economics + /stats, revalidate 30s
│       ├── egld/address/
│       │   └── [address]/route.ts # GET /api/egld/address/[address] — account + tokens + nfts + txs, revalidate 15s
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
│   │   └── PortfolioTable.tsx    # Live dot ●, P&L colored, 24h%, remove button
│   │
│   ├── watchlist/
│   │   └── WatchlistCard.tsx     # Card with live price + 24h%
│   │
│   ├── alerts/
│   │   └── AlertRow.tsx          # Target price, current price, status badge
│   │
│   ├── egld/
│   │   ├── EgldKpiCard.tsx       # KPI card: icon, label, value, optional delta
│   │   ├── EgldQuickLinks.tsx    # Explorer · xExchange · xPortal · Docs · Staking
│   │   ├── WalletInspector.tsx   # erd1… input + validate + navigate to /egld/[address]
│   │   └── AddressDetail.tsx     # Balance, ESDT list, NFT count, recent txs
│   │
│   └── ui/
│       ├── Skeleton.tsx          # Shimmer skeleton
│       ├── Badge.tsx             # Color badge (success/error/warning/info)
│       ├── Tooltip.tsx           # CSS-only accessible tooltip
│       ├── Button.tsx            # primary / secondary / ghost / danger variants
│       ├── PriceFlash.tsx        # Wraps any value — green/red flash 600ms on change
│       ├── LiveDot.tsx           # Animated ● indicator — size sm/md, optional label
│       └── CopyButton.tsx        # Copy to clipboard — ✓ feedback 1.5s
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
│   │   ├── multiversx.ts         # MultiversX economics + stats + address + tokens + txs
│   │   └── binance.ts            # Binance klines/OHLC fetcher
│   ├── formatters.ts             # fmtPrice / fmtLarge / fmtPct / fmtDate / fmtEgld
│   ├── cgToBinance.ts            # CoinGecko id → Binance USDT symbol map
│   ├── egldValidation.ts         # isValidEgldAddress(addr) — bech32 erd1 check
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
    ├── multiversx.ts             # EgldEconomics, EgldStats, MvxAccount, EsdtToken, MvxTx
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

## ✨ Frontend Polish Components

### `PriceFlash`
Wraps any price value and flashes green/red for 600ms when the value changes:
```tsx
<PriceFlash value={price}>
  {fmtPrice(price)}
</PriceFlash>
```
Used on every live price in Dashboard, Portfolio, Watchlist, and EGLD pages.

### `LiveDot`
Reusable animated live indicator with two variants:
```tsx
<LiveDot isLive={isConnected} />                  // ● dot only
<LiveDot isLive={isConnected} showLabel size="md" /> // ● LIVE
```

### `CopyButton`
Copy any string to clipboard with 1.5s visual confirmation (`✓ Copied`):
```tsx
<CopyButton value="erd1abc..." />
```

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
fmtEgld(1234500000000000000n) // "1.2345 EGLD"
```

All numeric values in the UI must use `fmtPrice / fmtLarge / fmtPct / fmtEgld` and the `tabular-nums` CSS class.

---

## 🌐 EGLD / MultiversX

CryptoTraderPro has first-class support for the MultiversX ecosystem:

### `/egld` — Main Dashboard
- **8 KPI cards**: EGLD Price (live WS `● LIVE`), 24h%, Market Cap, Staking APR, Total Staked, Validators, Total Transactions, Total Accounts
- **Wallet Inspector** — enter any `erd1...` address, validates bech32, navigates to Address Detail
- **Quick Links** — Explorer · xExchange · xPortal · Docs · Staking Providers
- **`PriceFlash`** on EGLD price + `LiveDot` indicator

### `/egld/[address]` — Address Inspector
- EGLD balance + USD value (calculated from live WS price)
- MultiversX username (`@alias`) if registered
- ESDT tokens list — logo, identifier, balance with correct decimals
- NFT/SFT count
- Recent transactions — status icon (↑ send / ↓ receive), hash, action label, value, timestamp
- **CopyButton** on address · direct link to Explorer

### API Routes
| Route | Data | Revalidate |
|---|---|---|
| `GET /api/egld` | economics + stats aggregated | 30s |
| `GET /api/egld/address/[address]` | account + tokens + nfts + txs | 15s |

### Data source
```
https://api.multiversx.com/economics
https://api.multiversx.com/stats
https://api.multiversx.com/accounts/{address}
https://api.multiversx.com/accounts/{address}/tokens
https://api.multiversx.com/accounts/{address}/nfts?size=1
https://api.multiversx.com/accounts/{address}/transactions?size=10
```

---

## 🤝 Extending the App

| Task | Where to add |
|---|---|
| New coin WS support | `src/lib/cgToBinance.ts` |
| New external API | `src/lib/api/{service}.ts` + `src/app/api/{service}/route.ts` |
| New Zustand store | `src/store/{name}Store.ts` with `persist` middleware |
| New page | `src/app/{route}/page.tsx` + entry in `sitemap.ts` |
| New WS hook | Build on `useLivePrices` — never raw Binance WS |
| New UI component | `src/components/ui/` — use Nexus CSS variables only |

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
| PriceFlash animație preț schimbat | ✅ v0.9.0 |
| 24h% per row portfolio (from WS) | ✅ v0.9.0 |
| /alerts page cu Notification API | ✅ v0.9.0 |
| /compare dual-chart normalizat | ✅ v0.10.0 |
| /backtest SMA crossover | ✅ v0.10.0 |
| /egld MultiversX dashboard complet | ✅ v0.11.0 |
| /egld/[address] Address Inspector | ✅ v0.11.0 |
| LiveDot + CopyButton components | ✅ v0.11.0 |
| Supabase auth + cloud sync portfolio | 🔲 v1.0.0 |
| Mobile PWA + push notifications | 🔲 v1.0.0 |
| xExchange DEX integration | 🔲 v1.0.0 |
| Multi-chain support (ETH, SOL) | 🔲 v1.1.0 |

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
