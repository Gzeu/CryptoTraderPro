<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0d9488"/><path d="M6 16h4l2.5-6 3.5 12 2.5-8 2 2.5h5.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>

# CryptoTraderPro

**Professional real-time cryptocurrency trading dashboard**

[![Deploy](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/nextjs.yml/badge.svg)](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/nextjs.yml)
[![Live Demo](https://img.shields.io/badge/live-demo-0d9488?style=flat-square&logo=vercel)](https://gzeu.github.io/CryptoTraderPro/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

🌐 **[gzeu.github.io/CryptoTraderPro](https://gzeu.github.io/CryptoTraderPro/)**

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Market Table** | Top 100 coins by market cap — live prices, 24h %, sparklines |
| ⭐ **Watchlist** | Star coins to build your personal watchlist (persisted in memory) |
| 📡 **Live Ticker** | Scrolling price bar — BTC, ETH, **EGLD**, BNB, SOL and more |
| 🔍 **Search** | Filter coins by name or symbol instantly |
| 🌙 **Dark / Light Mode** | System-aware theme with manual toggle, saved to localStorage |
| 📱 **PWA Ready** | Installable on mobile and desktop |
| ⚡ **Static Export** | No backend — deployed via GitHub Pages, edge-fast |
| 🛡️ **Error Boundary** | Catches any runtime crash with a friendly retry screen |
| 💀 **Skeleton Loaders** | Shimmer placeholders on every data-loading view |

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, `output: export`) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 3 + CSS custom properties |
| State | React `useState` / `useCallback` |
| Data | CoinGecko API v3 (free tier) |
| CI/CD | GitHub Actions → GitHub Pages |

---

## 🛠 Local Development

```bash
git clone https://github.com/Gzeu/CryptoTraderPro.git
cd CryptoTraderPro
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** Free CoinGecko tier has a 30 req/min rate limit. Add your API key to `.env.local` (see `.env.example`) for higher limits.

---

## 📦 Deployment

Auto-deployed to **GitHub Pages** on every push to `main` via GitHub Actions.

```bash
npm run build   # generates /out (static HTML)
```

The workflow uses [`actions/configure-pages`](https://github.com/actions/configure-pages) which auto-sets `basePath` and `output: export` — no manual config needed beyond `next.config.js`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout — fonts, metadata, OG, PWA
│   ├── page.tsx          # Dashboard — market table, ticker, KPIs
│   ├── globals.css       # Design tokens, animations, skeleton
│   ├── error.tsx         # Global error boundary
│   └── not-found.tsx     # 404 page
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities (formatters, API helpers)
├── store/                # Zustand stores
└── types/                # TypeScript interfaces
```

---

## 🗺 Roadmap

- [ ] 📈 Candlestick charts (Lightweight Charts / TradingView)
- [ ] 💼 Portfolio P&L tracker with entry price
- [ ] 🔔 Price alerts (push notifications)
- [ ] 🔗 MultiversX / EGLD deep integration
- [ ] 💱 Multi-currency support (EUR, RON, BTC)
- [ ] 🧪 Unit tests with Vitest

---

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © [Gzeu](https://github.com/Gzeu)
