# CryptoTraderPro

<div align="center">

![Version](https://img.shields.io/badge/version-0.5.0-6366f1?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)
[![Deploy](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/deploy.yml/badge.svg?style=flat-square)](https://github.com/Gzeu/CryptoTraderPro/actions)

**Professional cryptocurrency trading dashboard.**
Real-time prices · OHLC charts · Portfolio P&L · Price Alerts · MultiversX/EGLD native support.

[🔗 Live Demo](https://gzeu.github.io/CryptoTraderPro) · [📋 Changelog](./CHANGELOG.md) · [🐛 Issues](https://github.com/Gzeu/CryptoTraderPro/issues)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 📊 **Market Dashboard** | Top 100 coins, sortable by Price / 24h% / MCap / Volume, paginated 25/page |
| 🕯️ **OHLC Candlestick Chart** | Per-coin detail page with 1D/7D/14D/1M/3M/1Y range selector via `lightweight-charts` |
| 🔔 **Price Alerts** | Set above/below thresholds → browser push notifications, persisted across sessions |
| ⭐ **Watchlist** | Star any coin, persistent via `localStorage`, dedicated `/watchlist` page |
| 💼 **Portfolio Tracker** | Add positions with buy price, live P&L, cost basis, total summary |
| ⚡ **EGLD / MultiversX** | Featured card with sparkline, rank, explorer link, dedicated `useEGLD` hook |
| 🌗 **Dark / Light Mode** | System-aware + manual toggle, stored in `localStorage` |
| 🔍 **Global Search** | `Cmd+K` / `Ctrl+K` modal search across all 100 coins with keyboard navigation |
| ⌨️ **Keyboard Shortcuts** | `Cmd+K` search · `D` dashboard · `W` watchlist · `P` portfolio · `A` alerts · `?` help |
| ⚡ **React Query** | 60s stale cache, auto-refetch, retry logic, rate-limit 429 backoff |
| 🛡️ **Zod Validation** | Runtime schema validation on all CoinGecko responses |
| 🧪 **Unit Tests** | Vitest + Testing Library — formatters, schemas, stores |
| 📱 **PWA** | Installable, manifest, theme color, offline-ready |
| 🚀 **GitHub Pages Deploy** | Auto-deploy on push to `main` via GitHub Actions |

---

## 🛠 Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.0.2 |
| Language | TypeScript | 5.6 |
| Styling | TailwindCSS | 3.4 |
| Server state | @tanstack/react-query | 5.64 |
| Client state | Zustand + persist | 4.5 |
| Charts | lightweight-charts | 4.2 |
| Validation | Zod | 3.23 |
| HTTP | Axios | 1.7 |
| Icons | Lucide React | 0.441 |
| Testing | Vitest + Testing Library | 2.1 |
| Data | CoinGecko Public API | v3 |

---

## 🚀 Getting Started

```bash
# Install
npm install

# Dev server
npm run dev         # http://localhost:3000

# Tests
npm test            # run all unit tests
npm run test:watch  # watch mode
npm run test:coverage

# Type check + lint
npm run type-check
npm run lint

# Build
npm run build
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx               # Dashboard — market table + KPIs + EGLD card
│   ├── coin/[id]/page.tsx     # Coin detail — OHLC chart, stats, price alert form
│   ├── portfolio/page.tsx     # Portfolio P&L tracker
│   ├── watchlist/page.tsx     # Starred coins
│   ├── alerts/page.tsx        # Price alerts manager
│   ├── sitemap.ts             # Next.js sitemap generation
│   ├── layout.tsx             # Root layout + Providers
│   └── providers.tsx          # QueryClientProvider
│
├── components/
│   ├── charts/
│   │   ├── CandlestickChart.tsx   # lightweight-charts OHLC
│   │   └── SparklineChart.tsx     # SVG 7d sparkline
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── CoinRow.tsx
│   │   ├── EGLDCard.tsx           # MultiversX featured card
│   │   └── AlertsPanel.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── LiveTicker.tsx
│   │   └── SearchModal.tsx        # Cmd+K global search
│   └── ui/
│       ├── Badge.tsx
│       ├── Skeleton.tsx
│       ├── EmptyState.tsx
│       └── ErrorBoundary.tsx
│
├── hooks/
│   ├── useMarketsQuery.ts     # React Query markets hook
│   ├── useEGLD.ts             # EGLD/MultiversX data hook
│   ├── useAlertWatcher.ts     # Browser notification watcher
│   ├── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   ├── useWatchlist.ts
│   └── useTheme.ts
│
├── lib/
│   ├── api/coingecko.ts       # All CoinGecko API calls + rate-limit retry
│   ├── schemas.ts             # Zod runtime validation schemas
│   ├── queryClient.ts         # React Query config
│   └── formatters.ts          # fmtPrice, fmtLarge, fmtPct, fmtDate…
│
├── store/
│   ├── watchlistStore.ts      # Zustand persist
│   ├── portfolioStore.ts      # Zustand persist
│   └── alertStore.ts          # Zustand persist
│
├── test/
│   ├── formatters.test.ts
│   ├── schemas.test.ts
│   └── setup.ts
│
└── types/
    └── index.ts
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

## 🔔 Price Alerts

1. Open any coin page (e.g. `/coin/bitcoin`)
2. Set direction (above / below) and target price
3. Click **Set Alert** — saved to localStorage
4. Dashboard auto-checks live prices every 60s
5. Browser push notification fires when threshold crossed

> Notifications require browser permission. Click **Allow** when prompted.

---

## ⚡ EGLD / MultiversX

CryptoTraderPro has first-class support for the MultiversX ecosystem:

- **Featured KPI card** on the main dashboard with 7d sparkline
- **`useEGLD()` hook** — zero extra API calls (reuses React Query cache)
- **Direct link** to [MultiversX Explorer](https://explorer.multiversx.com)
- **Coin detail page** at `/coin/elrond-erd-2` with full OHLC chart

---

## 🌐 API & Rate Limits

Data is sourced from the **[CoinGecko Public API](https://www.coingecko.com/en/api)** (no key required).

- Requests are cached for **60 seconds** (React Query stale time)
- On HTTP 429 (rate limit), Axios automatically retries with **exponential backoff** (1s → 2s → 4s)
- No API key needed for the public tier (30 calls/min)

---

## 📦 Deployment

Auto-deployed to **GitHub Pages** via GitHub Actions on every push to `main`.

```yaml
# .github/workflows/deploy.yml handles:
# 1. npm ci + next build
# 2. next export → /out
# 3. Deploy /out to gh-pages branch
```

Live URL: `https://gzeu.github.io/CryptoTraderPro`

---

## 📋 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for full version history.

---

## 🤝 Contributing

```bash
# Fork → clone → branch
git checkout -b feat/your-feature

# Develop + test
npm run dev
npm test
npm run type-check

# Push + PR
git push origin feat/your-feature
```

Please follow the existing code style (Prettier + ESLint config included).

---

## 📄 License

MIT © [Gzeu](https://github.com/Gzeu)
