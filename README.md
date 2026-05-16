# CryptoTraderPro

![Version](https://img.shields.io/badge/version-0.4.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6)
![License](https://img.shields.io/badge/license-MIT-green)
[![Deploy](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/deploy.yml/badge.svg)](https://github.com/Gzeu/CryptoTraderPro/actions)

Professional cryptocurrency trading dashboard built with **Next.js 15**, **TypeScript**, **TailwindCSS**, and **CoinGecko API**.

🔗 **Live** → [gzeu.github.io/CryptoTraderPro](https://gzeu.github.io/CryptoTraderPro)

---

## Features

| Feature | Status |
|---|---|
| Live prices — top 100 coins | ✅ |
| Sortable columns (Price, 24h%, MCap, Volume) | ✅ |
| Pagination (25/page) | ✅ |
| Dark / light mode | ✅ |
| Coin detail page + OHLC candlestick chart | ✅ |
| Price alerts (browser notifications) | ✅ |
| Watchlist (persisted) | ✅ |
| Portfolio P&L tracker | ✅ |
| EGLD / MultiversX featured card | ✅ |
| React Query caching (60s stale) | ✅ |
| Zod runtime validation | ✅ |
| Unit tests (Vitest) | ✅ |
| PWA manifest | ✅ |
| GitHub Actions → GitHub Pages deploy | ✅ |

---

## Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript 5.6
- **Styling** — TailwindCSS 3
- **State** — Zustand + React Query
- **Charts** — `lightweight-charts` v4 (OHLC), custom SVG sparklines
- **Validation** — Zod
- **Testing** — Vitest + Testing Library
- **Data** — CoinGecko public API

---

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # run unit tests
npm run type-check   # TypeScript check
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard (market table)
│   ├── coin/[id]/page.tsx    # Coin detail + OHLC chart
│   ├── portfolio/page.tsx    # Portfolio P&L
│   ├── watchlist/page.tsx    # Watchlist
│   └── alerts/page.tsx       # Price alerts manager
├── components/
│   ├── charts/               # CandlestickChart, SparklineChart
│   ├── dashboard/            # KPICard, CoinRow, EGLDCard, AlertsPanel
│   ├── layout/               # Header, LiveTicker
│   └── ui/                   # Badge, Skeleton, EmptyState
├── hooks/                    # useMarketsQuery, useEGLD, useAlertWatcher, useWatchlist, useTheme
├── lib/
│   ├── api/coingecko.ts      # All CoinGecko API calls
│   ├── schemas.ts            # Zod validation schemas
│   ├── queryClient.ts        # React Query config
│   └── formatters.ts         # fmtPrice, fmtLarge, fmtPct…
├── store/                    # watchlistStore, portfolioStore, alertStore
├── test/                     # Vitest unit tests
└── types/                    # Shared TypeScript types
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

---

## License

MIT © [Gzeu](https://github.com/Gzeu)
