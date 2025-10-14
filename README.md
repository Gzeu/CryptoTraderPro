# 🚀 CryptoTraderPro

**Next.js 14 cryptocurrency trading dashboard with real-time charts, portfolio tracking, and advanced analytics.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![TradingView](https://img.shields.io/badge/TradingView-Charts-orange)](https://www.tradingview.com/lightweight-charts/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

![CryptoTraderPro Dashboard](https://via.placeholder.com/1200x630/0a0a0a/ffffff?text=CryptoTraderPro%20-%20Advanced%20Crypto%20Trading%20Dashboard)

## ✨ Features

### 📊 **Real-Time Market Data**
- Live cryptocurrency prices from CoinGecko API
- Real-time market statistics (market cap, volume, dominance)
- Trending coins and market movers
- 24/7 price updates with WebSocket connections

### 📈 **Professional Charts**
- **TradingView Lightweight Charts** integration
- Candlestick, line, and area chart types
- Volume indicators and technical analysis
- Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d, 1w)
- Dark/light theme support

### 👀 **Smart Watchlists**
- Track your favorite cryptocurrencies
- Sortable tables with live data
- Quick add/remove from watchlist
- Portfolio performance tracking

### 🎨 **Modern UI/UX**
- **shadcn/ui** components with Radix UI
- Responsive design for all devices
- Dark mode with system preference detection
- Smooth animations and transitions
- Professional trading interface

### ⚡ **Performance Optimized**
- In-memory caching with TTL
- Debounced API calls
- Optimized image loading
- Lazy loading and code splitting

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **APIs**: [CoinGecko](https://www.coingecko.com/en/api), [Binance](https://binance-docs.github.io/apidocs/)
- **Deployment**: [Vercel](https://vercel.com/) / [Netlify](https://netlify.com/)

## 🚀 Quick Start

### Prerequisites

- **Node.js 18.17+**
- **npm**, **yarn**, or **pnpm**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/Gzeu/CryptoTraderPro.git
cd CryptoTraderPro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys (optional)
```

### 4. Run Development Server

```bash
npm run dev
```

**🎉 Open [http://localhost:3000](http://localhost:3000) in your browser!**

## 📊 API Keys Setup

### CoinGecko API (Recommended)

1. Visit [CoinGecko API](https://www.coingecko.com/en/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. **Free tier**: 10-50 calls/minute

> **Note**: You can run the app without API keys using public endpoints.

## 🚀 Deployment

### Deploy to Vercel (1-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Gzeu/CryptoTraderPro)

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Gzeu/CryptoTraderPro)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Commit** your changes
4. **Push** to the branch
5. **Open** a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for the crypto community**

[⭐ Star this repo](https://github.com/Gzeu/CryptoTraderPro) • [🐛 Report Bug](https://github.com/Gzeu/CryptoTraderPro/issues) • [✨ Request Feature](https://github.com/Gzeu/CryptoTraderPro/issues)

</div>