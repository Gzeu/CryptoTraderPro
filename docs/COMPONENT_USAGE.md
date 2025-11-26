# 🎨 Component Usage Guide

## 📊 Complete Component Suite

### Created Components

1. **PortfolioOverview** - Portfolio analytics dashboard
2. **WatchlistTable** - Real-time watchlist with live prices
3. **AssetList** - Detailed portfolio asset table
4. **LivePriceChart** - TradingView chart with WebSocket
5. **PriceAlertManager** - Alert management interface

---

## 🚀 Sample Page Implementations

### Portfolio Dashboard Page

```typescript
// app/portfolio/page.tsx
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview'
import { AssetList } from '@/components/portfolio/AssetList'
import { LivePriceChart } from '@/components/charts/LivePriceChart'

export default function PortfolioPage() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Portfolio Analytics */}
      <PortfolioOverview />

      {/* Asset Details */}
      <AssetList />

      {/* Optional: Chart for main holding */}
      <LivePriceChart symbol="BTCUSDT" interval="1h" height={400} />
    </div>
  )
}
```

### Watchlist Dashboard Page

```typescript
// app/watchlist/page.tsx
import { WatchlistTable } from '@/components/watchlist/WatchlistTable'
import { PriceAlertManager } from '@/components/watchlist/PriceAlertManager'

export default function WatchlistPage() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        <p className="mt-2 text-muted-foreground">
          Track your favorite cryptocurrencies and set price alerts
        </p>
      </div>

      {/* Watchlist with live prices */}
      <WatchlistTable autoUpdate={true} updateInterval={30000} />

      {/* Price alerts */}
      <PriceAlertManager />
    </div>
  )
}
```

### Coin Detail Page

```typescript
// app/coin/[id]/page.tsx
import { LivePriceChart } from '@/components/charts/LivePriceChart'
import { PriceAlertManager } from '@/components/watchlist/PriceAlertManager'

export default function CoinDetailPage({ params }: { params: { id: string } }) {
  const symbol = `${params.id.toUpperCase()}USDT`

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Real-time chart */}
      <LivePriceChart symbol={symbol} interval="1h" height={500} />

      {/* Alerts for this specific coin */}
      <PriceAlertManager coinId={params.id} />
    </div>
  )
}
```

---

## 📚 Component Props & APIs

### PortfolioOverview
```typescript
<PortfolioOverview />
// No props required - uses active portfolio from store
```

### AssetList
```typescript
<AssetList 
  onEditAsset={(asset) => console.log('Edit', asset)}
/>
```

### WatchlistTable
```typescript
<WatchlistTable 
  category="DeFi"           // Optional: filter by category
  autoUpdate={true}         // Enable live updates
  updateInterval={30000}    // Update every 30s
/>
```

### LivePriceChart
```typescript
<LivePriceChart 
  symbol="BTCUSDT"
  interval="1h"             // 1m, 5m, 15m, 1h, 4h, 1d
  height={400}              // Chart height in pixels
/>
```

### PriceAlertManager
```typescript
<PriceAlertManager 
  coinId="bitcoin"          // Optional: filter alerts by coin
/>
```

---

## 🎯 Features by Component

### PortfolioOverview
- ✅ Total value, P&L, risk level
- ✅ Diversification score
- ✅ Best/worst performers
- ✅ Color-coded metrics
- ✅ Responsive grid layout

### AssetList
- ✅ Sortable columns
- ✅ Holdings, value, P&L tracking
- ✅ Allocation visualization
- ✅ Edit/remove actions
- ✅ Formatted numbers

### WatchlistTable
- ✅ Real-time price updates
- ✅ Sortable by name/price/change
- ✅ Category filtering
- ✅ Quick remove action
- ✅ Live connection indicator

### LivePriceChart
- ✅ TradingView candlestick chart
- ✅ WebSocket real-time updates
- ✅ Multiple timeframes
- ✅ Dark theme optimized
- ✅ Loading states

### PriceAlertManager
- ✅ Active/triggered alerts toggle
- ✅ Alert type indicators
- ✅ Enable/disable alerts
- ✅ Delete alerts
- ✅ Alert statistics

---

## 🔧 Integration Examples

### Add Asset to Portfolio
```typescript
import { usePortfolioStore } from '@/store/portfolioStore'

function AddAssetButton() {
  const { addAsset, currentPortfolioId } = usePortfolioStore()

  const handleAddAsset = () => {
    if (!currentPortfolioId) return

    addAsset(currentPortfolioId, {
      coinId: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0.5,
      avgBuyPrice: 40000,
      currentPrice: 45000,
      value: 22500,
      pnl: 2500,
      pnlPercent: 12.5,
      allocation: 0,
    })
  }

  return <button onClick={handleAddAsset}>Add Bitcoin</button>
}
```

### Add Coin to Watchlist
```typescript
import { useWatchlist } from '@/hooks/useWatchlist'

function AddToWatchlistButton({ coinId, symbol, name }: any) {
  const { addCoinToWatchlist } = useWatchlist()

  return (
    <button onClick={() => addCoinToWatchlist(coinId, symbol, name, 'DeFi')}>
      Add to Watchlist
    </button>
  )
}
```

### Create Price Alert
```typescript
import { usePriceAlerts } from '@/hooks/useWatchlist'

function CreateAlertButton() {
  const { createAlert } = usePriceAlerts()

  const handleCreateAlert = async () => {
    await createAlert(
      'bitcoin',
      'BTC',
      'Bitcoin',
      'above',  // 'above' | 'below' | 'percent_change'
      50000     // target price
    )
  }

  return <button onClick={handleCreateAlert}>Alert at $50k</button>
}
```

---

## 💡 Best Practices

### State Management
- Use Zustand stores for global state (portfolios, watchlist)
- Use React hooks for component-level state
- Enable auto-updates for real-time features

### Performance
- Set appropriate update intervals (30-60s recommended)
- Use memoization for expensive calculations
- Lazy load charts and heavy components

### User Experience
- Show loading states for async operations
- Provide empty states with helpful messages
- Use optimistic updates for better UX
- Display connection status for live data

---

## 🔗 Related Files

- **Stores**: `src/store/portfolioStore.ts`, `src/store/watchlistStore.ts`
- **Hooks**: `src/hooks/usePortfolioAnalytics.ts`, `src/hooks/useWatchlist.ts`, `src/hooks/useBinanceWebSocket.ts`
- **API**: `src/lib/api/coinGecko.ts`, `src/lib/api/binance.ts`
- **Types**: `src/types/crypto.ts`

---

Last updated: November 26, 2025
