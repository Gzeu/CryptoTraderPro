# CryptoTraderPro — Master Frontend Prompt
> **Repo:** https://github.com/Gzeu/CryptoTraderPro  
> **Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · React Query · Zustand · Recharts · TradingView Widget  
> **Versiune curentă:** v0.10.0  
> **Scop prompt:** Agent AI (Windsurf / Cursor / Claude) poate citi acest fișier și reproduce, extinde sau audita întregul frontend fără context suplimentar.

---

## 1. Arhitectura proiectului

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
│   ├── portfolio/page.tsx        # /portfolio → tabel + pie chart, Binance WS live prices
│   ├── watchlist/page.tsx        # /watchlist  → lista monede urmărite cu live prices
│   ├── alerts/page.tsx           # /alerts     → price alert management (threshold triggers)
│   ├── compare/page.tsx          # /compare    → side-by-side coin comparison + Recharts overlay
│   ├── backtest/page.tsx         # /backtest   → OHLC backtest simplu (SMA crossover strategy)
│   ├── egld/page.tsx             # /egld       → MultiversX EGLD dashboard dedicat
│   │
│   ├── coin/[id]/
│   │   └── page.tsx              # /coin/[id]  → TradingView chart, stats, CoinNewsFeed, useLivePrice
│   │
│   └── api/                      # Next.js Route Handlers (server-side proxy)
│       ├── coins/route.ts        # GET /api/coins?page=&per_page=&vs_currency= → CoinGecko proxy
│       ├── coin/[id]/route.ts    # GET /api/coin/[id] → CoinGecko /coins/{id}
│       ├── chart/[id]/route.ts   # GET /api/chart/[id]?days= → CoinGecko market_chart
│       ├── news/route.ts         # GET /api/news?currency= → CryptoPanic proxy
│       ├── global/route.ts       # GET /api/global → CoinGecko global market stats
│       ├── search/route.ts       # GET /api/search?q= → CoinGecko search
│       ├── egld/route.ts         # GET /api/egld → MultiversX API stats
│       └── alerts/check/route.ts # POST /api/alerts/check → evaluează alertele active
│
├── components/
│   ├── Header.tsx                # Sticky nav: logo, links (D/W/P/A), theme toggle, search Cmd+K
│   ├── SearchModal.tsx           # Global search modal Cmd+K: live filter + keyboard nav
│   ├── ErrorBoundary.tsx         # React class ErrorBoundary: catch + retry UI
│   │
│   ├── charts/
│   │   ├── PortfolioPieChart.tsx # Recharts PieChart cu tooltip custom, legende, animație
│   │   ├── PriceLineChart.tsx    # Recharts AreaChart pentru price history (coin page)
│   │   ├── CompareChart.tsx      # Recharts LineChart dual-line normalizat pentru /compare
│   │   └── BacktestChart.tsx     # Recharts ComposedChart equity curve + buy/sell markers
│   │
│   ├── coin/
│   │   ├── CoinNewsFeed.tsx      # Wrapper → CryptoPanicFeed cu currency prop
│   │   ├── CryptoPanicFeed.tsx   # Feed știri CryptoPanic: card list, skeleton, paginare
│   │   └── TradingViewWidget.tsx # TradingView Advanced Chart embed (SSR-safe)
│   │
│   ├── portfolio/
│   │   └── PortfolioTable.tsx    # Tabel portfolio cu live dot, P&L colorat, remove button
│   │
│   ├── watchlist/
│   │   └── WatchlistCard.tsx     # Card monedă watchlist cu live price + 24h%
│   │
│   ├── alerts/
│   │   └── AlertRow.tsx          # Row alert: target price, current price, status badge
│   │
│   └── ui/
│       ├── Skeleton.tsx          # Shimmer skeleton cu CSS animation
│       ├── Badge.tsx             # Color badge (success/error/warning/info)
│       ├── Tooltip.tsx           # Hover tooltip (CSS-only, accessible)
│       └── Button.tsx            # Button variants: primary/secondary/ghost/danger
│
├── hooks/
│   ├── useLivePrice.ts           # useLivePrice(symbol) / useLivePrices(symbols[]) via priceFeed singleton
│   ├── usePortfolioLivePrices.ts # Combină portfolioStore + useLivePrices → rows cu isLive per rând
│   ├── useMultiTickerWS.ts       # Direct Binance Combined Stream WS (fallback dacă priceFeed nu e disponibil)
│   ├── useTheme.ts               # Light/dark theme cu data-theme pe <html>
│   ├── useKeyboardShortcuts.ts   # D/W/P/A/?/Esc/Cmd+K shortcuts globale
│   ├── usePortfolioExport.ts     # Export portfolio CSV (blob download)
│   └── useDebounce.ts            # Generic debounce hook (folosit în SearchModal)
│
├── lib/
│   ├── ws/
│   │   └── priceFeed.ts          # Singleton Binance WS manager: subscribe/unsubscribe, debounce-batch, reconnect
│   ├── api/
│   │   ├── coingecko.ts          # CoinGecko typed fetchers (coins, coin, chart, global, search)
│   │   ├── cryptopanic.ts        # CryptoPanic fetcher (news by currency)
│   │   ├── multiversx.ts         # MultiversX API fetcher (EGLD price, validators, staking)
│   │   └── binance.ts            # Binance REST fetcher (klines, ticker, order book)
│   ├── backtest.ts               # SMA crossover engine: calcSMA, runBacktest, BacktestResult
│   ├── formatters.ts             # fmtPrice / fmtLarge / fmtPct / fmtDate helpers
│   ├── cgToBinance.ts            # Map CoinGecko id → Binance USDT symbol
│   └── constants.ts              # TOP_COINS list, DEFAULT_CURRENCY, REFRESH_INTERVALS
│
├── store/
│   ├── portfolioStore.ts         # Zustand: entries[], addEntry, removeEntry (persist localStorage)
│   ├── watchlistStore.ts         # Zustand: coinIds[], add, remove, has (persist localStorage)
│   └── alertsStore.ts            # Zustand: alerts[], addAlert, removeAlert, updateStatus
│
└── types/
    ├── coingecko.ts              # CoinGecko API response types
    ├── cryptopanic.ts            # CryptoPanic API response types
    ├── multiversx.ts             # MultiversX API types
    └── portfolio.ts              # PortfolioEntry, PortfolioRow, AlertEntry types
```

---

## 2. Configurare API — `.env.local`

```bash
# ─── OBLIGATORII ──────────────────────────────────────────────────────────────

# CoinGecko (free tier funcționează fără key; Pro elimină rate limit 429)
COINGECKO_API_KEY=                     # optional — Pro key: https://www.coingecko.com/en/api/pricing
NEXT_PUBLIC_COINGECKO_BASE=https://api.coingecko.com/api/v3

# CryptoPanic — știri crypto per currency
CRYPTOPANIC_API_KEY=                   # OBLIGATORIU — https://cryptopanic.com/developers/api/
NEXT_PUBLIC_CRYPTOPANIC_BASE=https://cryptopanic.com/api/v1

# MultiversX (EGLD dashboard)
MULTIVERSX_API_URL=https://api.multiversx.com
NEXT_PUBLIC_MULTIVERSX_EXPLORER=https://explorer.multiversx.com

# ─── WEBSOCKET ────────────────────────────────────────────────────────────────

# Binance WS — fără autentificare, public
NEXT_PUBLIC_BINANCE_WS_BASE=wss://stream.binance.com:9443
# Binance REST — pentru klines/OHLC (backtest, chart fallback)
NEXT_PUBLIC_BINANCE_REST_BASE=https://api.binance.com/api/v3

# ─── APP ──────────────────────────────────────────────────────────────────────

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CryptoTraderPro

# ─── OPȚIONALE ────────────────────────────────────────────────────────────────

# TradingView — nu necesită key, embed public
# NEXT_PUBLIC_TRADINGVIEW_LOCALE=en    # default: en

# Binance REST (dacă vrei klines autentificate cu rate limit mai mare)
# BINANCE_API_KEY=
# BINANCE_API_SECRET=

# Email alerts (viitor — SendGrid / Resend)
# SENDGRID_API_KEY=
# ALERT_FROM_EMAIL=alerts@cryptotraderpro.com

# Supabase (viitor — leaderboard, user accounts)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

---

## 3. Conectori API — detalii tehnice

### 3.1 CoinGecko (`src/lib/api/coingecko.ts`)

| Funcție | Endpoint | Parametri | Folosit în |
|---|---|---|---|
| `getCoins(page, perPage)` | `/coins/markets` | `vs_currency=usd&order=market_cap_desc&sparkline=true` | `/` dashboard |
| `getCoin(id)` | `/coins/{id}` | `localization=false&tickers=false&community_data=false` | `/coin/[id]` |
| `getCoinChart(id, days)` | `/coins/{id}/market_chart` | `vs_currency=usd&days={days}` | `/coin/[id]` chart |
| `getGlobal()` | `/global` | — | `/` header stats |
| `searchCoins(q)` | `/search` | `query={q}` | `SearchModal` |
| `getSimplePrice(ids[])` | `/simple/price` | `ids=...&vs_currencies=usd` | `/portfolio` REST fallback |

**Rate limit free tier:** 30 req/min. Toate request-urile trec prin `/api/*` Route Handlers (server-side) pentru a ascunde key-ul și a evita CORS.

**Retry 429:** Axios interceptor cu exponential backoff `1s → 2s → 4s`, max 3 retry-uri.

---

### 3.2 Binance WebSocket (`src/lib/ws/priceFeed.ts`)

**URL pattern:**
```
wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker/egldusdt@miniTicker
```

**`TickerPayload` (miniTicker stream):**
```typescript
interface TickerPayload {
  symbol:             string   // "BTCUSDT"
  price:              number   // last price
  priceChange:        number   // 24h change absolute
  priceChangePercent: number   // 24h change %
  high:               number   // 24h high
  low:                number   // 24h low
  volume:             number   // base asset volume
  quoteVolume:        number   // quote asset volume
  lastUpdated:        number   // timestamp ms
}
```

**priceFeed singleton API:**
```typescript
priceFeed.subscribe(symbol: string, cb: (p: TickerPayload) => void): () => void
priceFeed.getCached(symbol: string): TickerPayload | null
// Debounce: subscripțiile din același tick React sunt batched după 40ms → 1 singur reconnect
// Reconnect exponențial: 1.5s → 3s → 6s → 12s → 24s, max 5 retry
```

**Map CoinGecko → Binance** (`src/lib/cgToBinance.ts`):
```typescript
const CG_TO_BINANCE: Record<string, string> = {
  bitcoin:        'BTCUSDT',
  ethereum:       'ETHUSDT',
  'elrond-erd-2': 'EGLDUSDT',
  solana:         'SOLUSDT',
  binancecoin:    'BNBUSDT',
  cardano:        'ADAUSDT',
  ripple:         'XRPUSDT',
  dogecoin:       'DOGEUSDT',
  polkadot:       'DOTUSDT',
  'avalanche-2':  'AVAXUSDT',
  chainlink:      'LINKUSDT',
  litecoin:       'LTCUSDT',
}
```

---

### 3.3 Binance REST — Klines/OHLC (`src/lib/api/binance.ts`)

```typescript
// GET https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=365
interface Kline {
  openTime:  number
  open:      number
  high:      number
  low:       number
  close:     number
  volume:    number
  closeTime: number
}

async function getKlines(symbol: string, interval: string, limit: number): Promise<Kline[]>
// Folosit în: /backtest (SMA crossover), /coin/[id] OHLC chart fallback
```

---

### 3.4 CryptoPanic (`src/lib/api/cryptopanic.ts`)

```
GET https://cryptopanic.com/api/v1/posts/?auth_token={KEY}&currencies=BTC,EGLD&kind=news&public=true
```

**Response folosit:**
```typescript
interface NewsItem {
  id:         number
  title:      string
  url:        string
  source:     { title: string; domain: string }
  published_at: string
  currencies: Array<{ code: string; title: string }>
  votes:      { positive: number; negative: number; important: number }
}
```

**Rate:** 1000 req/day gratuit. Cacheat `staleTime: 5min` în React Query.

---

### 3.5 MultiversX (`src/lib/api/multiversx.ts`)

```
Base: https://api.multiversx.com

GET /economics              → EGLD marketcap, price, staking APR, total supply
GET /stats                  → transactions count, blocks, accounts
GET /accounts/{address}     → balance, nonce, assets (viitor)
GET /tokens/EGLD-000000     → token info (viitor)
```

**Folosit în:** `/egld` page dedicată.

---

## 4. State Management (Zustand Stores)

### `portfolioStore`
```typescript
interface PortfolioEntry {
  id:       string   // uuid
  coinId:   string   // CoinGecko id
  coinName: string
  amount:   number
  buyPrice: number
}

// Actions: addEntry(entry), removeEntry(id), clearAll()
// Persist: localStorage key "portfolio-v1"
```

### `watchlistStore`
```typescript
// State: coinIds: string[]
// Actions: add(id), remove(id), has(id): boolean
// Persist: localStorage key "watchlist-v1"
```

### `alertsStore`
```typescript
interface AlertEntry {
  id:           string
  coinId:       string
  coinName:     string
  targetPrice:  number
  direction:    'above' | 'below'
  status:       'active' | 'triggered' | 'dismissed'
  createdAt:    number
  triggeredAt?: number
}

// Actions: addAlert, removeAlert, updateStatus(id, status)
// Persist: localStorage key "alerts-v1"
```

---

## 5. Route Handlers — `/api/*`

Toate request-urile externe trec prin server-side Route Handlers pentru:
1. Ascundere API keys (nu apar în browser)
2. CORS bypass
3. Centralizare retry logic

```typescript
// src/app/api/coins/route.ts
// GET /api/coins?page=1&per_page=50&vs_currency=usd
// Proxy → https://api.coingecko.com/api/v3/coins/markets

// src/app/api/news/route.ts
// GET /api/news?currency=BTC
// Proxy → https://cryptopanic.com/api/v1/posts/?auth_token=...&currencies=BTC

// src/app/api/egld/route.ts
// GET /api/egld
// Agregat: /economics + /stats de pe api.multiversx.com

// src/app/api/alerts/check/route.ts
// POST /api/alerts/check  body: { alerts: AlertEntry[], prices: Record<string,number> }
// Returnează: { triggered: string[] }  ← array de alert ids care au atins targetul
```

---

## 6. Pagini — comportament detaliat

### `/` — Dashboard
- **Date:** `useQuery(['coins'])` → `/api/coins?page=1&per_page=50`
- **Live prices:** `useLivePrices(TOP_50_BINANCE_SYMBOLS)` via `priceFeed`
- **Global stats:** `useQuery(['global'])` → `/api/global` (marketcap, dominance, volume 24h)
- **Search modal:** `Cmd+K` → `SearchModal` → `/api/search?q=`
- **Keyboard shortcuts:** `useKeyboardShortcuts` activ pe întreaga pagină

### `/portfolio`
- **Stores:** `usePortfolioStore` (entries)
- **Prices primar:** `useLivePrices` via `priceFeed` (Binance WS)
- **Prices fallback:** `useQuery(['portfolio-prices'])` → `/api/coins/simple` (CoinGecko, refresh 60s)
- **Hook agregat:** `usePortfolioLivePrices(restPrices, restLoading)` → `rows[]` cu `isLive` per rând
- **View toggle:** `table` (cu live dot ● per rând) | `chart` (`PortfolioPieChart`)
- **Export:** `usePortfolioExport` → blob CSV download

### `/watchlist`
- **Stores:** `useWatchlistStore` (coinIds[])
- **Prices:** `useLivePrices(symbols)` → `WatchlistCard` per coin
- **Add/remove:** buton ♥ disponibil din `/coin/[id]` și dashboard

### `/alerts`
- **Stores:** `useAlertsStore` (alerts[])
- **Check:** la fiecare tick WS, comparare `currentPrice` vs `targetPrice + direction`
- **Status:** `active` → `triggered` când condiția e îndeplinită; notificare browser `Notification API`
- **API check server:** `POST /api/alerts/check` pentru evaluare batch server-side (viitor cron)

### `/coin/[id]`
- **Date coin:** `useQuery(['coin', id])` → `/api/coin/[id]`
- **Chart:** `useQuery(['chart', id, days])` → `/api/chart/[id]?days=7|30|90|365`
- **TradingView:** `<TradingViewWidget symbol="BINANCE:BTCUSDT" />` (SSR-safe, dynamic import)
- **Live price:** `useLivePrice(binanceSymbol)` → header price cu `isLive` indicator
- **Știri:** `<CoinNewsFeed symbol="BTC" />` → `<CryptoPanicFeed currency="BTC" />`
- **Add to watchlist:** `useWatchlistStore().add(id)` cu feedback

### `/compare`
- **Selector:** 2 coin pickers → fetch simultan via `useQuery`
- **Chart:** `<CompareChart />` → Recharts dual-line overlay, normalizat la 100 (%)
- **Stats grid:** 8 cards: preț, market cap, volume, 24h%, 7d%, ATH, circulating supply, rank
- **Winner badge:** care coin a outperformat pe intervalul ales

### `/backtest`
- **Date:** Binance klines direct `https://api.binance.com/api/v3/klines`
- **Engine:** `src/lib/backtest.ts` — `runBacktest(bars, fast, slow, capital)`
- **Strategie:** SMA crossover (Golden Cross BUY / Death Cross SELL)
- **Output:** equity curve `<BacktestChart />` + 8 MetricCards + Trade Log tabel
- **Parametri:** Coin, Fast SMA (9/10/20/25), Slow SMA (21/50/100/200), Perioadă (6M/1Y/2Y), Capital

### `/egld`
- **Date:** `useQuery(['egld'])` → `/api/egld` (agregat MultiversX economics + stats)
- **Live price:** `useLivePrice('EGLDUSDT')` via Binance WS
- **Stats afișate:** price, 24h%, marketcap, staking APR, total supply, validators, transactions

---

## 7. Hooks — semnături complete

```typescript
// Live prices (Binance WS via priceFeed singleton)
useLivePrice(symbol: string | null, enabled?: boolean)
  → { price, priceChange, priceChangePercent, high, low, volume, quoteVolume, lastUpdated, isLive, raw }

useLivePrices(symbols: string[], enabled?: boolean)
  → { priceMap: Map<string, TickerPayload>, isLive: boolean }

usePriceGetter(symbols: string[], enabled?: boolean)
  → { getPrice(sym): number|null, getPct(sym): number|null, isLive, priceMap }

// Portfolio
usePortfolioLivePrices(restPrices?: Record<string,number>, restLoading?: boolean)
  → { rows: PortfolioRow[], totalCost, totalValue, totalPnl, totalPnlPct, anyLive }

usePortfolioExport()
  → { exportCsv(): void, loading: boolean }

// Theme
useTheme()
  → { theme: 'light'|'dark', toggle(): void }

// Keyboard
useKeyboardShortcuts(handlers: Record<string, () => void>)
  → void  // auto-cleanup pe unmount

// Utility
useDebounce<T>(value: T, delay: number): T
```

---

## 8. Formatters (`src/lib/formatters.ts`)

```typescript
fmtPrice(n: number): string
  // n < 0.01   → "$0.000123"  (6 zecimale)
  // n < 1      → "$0.4521"    (4 zecimale)
  // n < 1000   → "$42.34"     (2 zecimale)
  // n >= 1000  → "$42,341.00" (2 zecimale, mii separator)

fmtLarge(n: number): string
  // n >= 1T    → "$1.23T"
  // n >= 1B    → "$456.78M" ... etc
  // altfel fmtPrice(n)

fmtPct(n: number): string
  // "+3.45%" sau "-1.23%"  (2 zecimale, prefix +/-)

fmtDate(ts: number): string
  // "May 17, 2026 · 01:33"
```

---

## 9. Design System

**Paleta:** Nexus (beige light / dark charcoal dark), accent Hydra Teal `--color-primary: #01696f`  
**Font body:** Satoshi (Fontshare)  
**Font display:** Boska (Fontshare)  
**Tip scale:** fluid `clamp()` 12px–128px  
**Spacing:** 4px grid system (`--space-1` … `--space-32`)  
**Dark mode:** `prefers-color-scheme` default + toggle manual `data-theme` pe `<html>`

CSS variables complete în `src/app/globals.css`.

---

## 10. Reguli de extindere (pentru agentul AI)

1. **Orice coin nou** → adaugă în `CG_TO_BINANCE` din `src/lib/cgToBinance.ts`
2. **Orice API nou** → creează `src/lib/api/{service}.ts` + Route Handler `src/app/api/{service}/route.ts`
3. **Orice store nou** → `src/store/{name}Store.ts` cu `persist` middleware Zustand
4. **Orice pagină nouă** → folder `src/app/{route}/page.tsx` + entry în `sitemap.ts`
5. **Orice hook care folosește WS** → folosește `useLivePrices` (nu direct Binance WS) pentru a beneficia de singleton batching
6. **Toate valorile numerice** → wrap în `fmtPrice / fmtLarge / fmtPct` + clasă CSS `tabular-nums`
7. **Loading states** → `<Skeleton />` cu dimensiunile exacte ale componentei finale
8. **Erori** → `<ErrorBoundary>` + mesaj friendly, fără stack trace vizibil în producție

---

## 11. Roadmap implementat → planificat

| Feature | Status |
|---|---|
| Dashboard top coins + search Cmd+K | ✅ v0.5.0 |
| Keyboard shortcuts globale | ✅ v0.5.0 |
| ErrorBoundary + Axios retry 429 | ✅ v0.5.0 |
| Sitemap dinamic SEO | ✅ v0.5.0 |
| priceFeed singleton WS | ✅ v0.7.0 |
| usePortfolioLivePrices + pie chart | ✅ v0.8.0 |
| Live dot ● per rând portfolio | ✅ v0.8.0 |
| CoinNewsFeed → CryptoPanicFeed | ✅ v0.7.0 |
| Flash animație preț schimbat | ✅ v0.9.0 |
| 24h% per rând portfolio (din WS) | ✅ v0.9.0 |
| /alerts page cu Notification API | ✅ v0.9.0 |
| /compare dual-chart normalizat | ✅ v0.10.0 |
| /backtest SMA crossover + equity curve | ✅ v0.10.0 |
| BacktestChart: buy/sell markers | ✅ v0.10.0 |
| Trade Log tabel complet | ✅ v0.10.0 |
| /egld MultiversX dashboard | 🔲 v0.11.0 |
| Supabase auth + cloud sync | 🔲 v1.0.0 |
| Mobile PWA + push notifications | 🔲 v1.0.0 |
