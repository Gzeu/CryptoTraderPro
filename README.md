# CryptoTraderPro

> Professional cryptocurrency trading dashboard built with Next.js 15, TypeScript, and TailwindCSS.

[![Deploy to GitHub Pages](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/nextjs.yml/badge.svg)](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/nextjs.yml)
[![CI/CD Pipeline](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/CryptoTraderPro/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

**🌐 Live Demo → [gzeu.github.io/CryptoTraderPro](https://gzeu.github.io/CryptoTraderPro/)**

---

## Features

- 📊 **Real-time candlestick charts** powered by Lightweight Charts / TradingView
- 💼 **Portfolio tracker** — track your holdings with P&L
- 🔍 **Watchlist** — monitor 100+ coins from CoinGecko
- 🌐 **Live ticker bar** — BTC, ETH, EGLD, BNB, SOL and more
- 🌙 **Dark / Light mode** toggle
- 📱 **PWA-ready** — installable on mobile
- ⚡ **Static export** — deployed on GitHub Pages, zero backend

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 3 |
| State | Zustand |
| Data | CoinGecko API (free tier) |
| Charts | Lightweight Charts (TradingView) |
| CI/CD | GitHub Actions → GitHub Pages |

## Local Development

```bash
git clone https://github.com/Gzeu/CryptoTraderPro.git
cd CryptoTraderPro
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Auto-deployed to GitHub Pages on every push to `main` via GitHub Actions.

```bash
npm run build   # generates static output in /out
```

## License

MIT © [Gzeu](https://github.com/Gzeu)
