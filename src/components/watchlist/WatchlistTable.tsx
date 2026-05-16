// =============================================================================
// Watchlist Table — real-time prices via Binance WS LivePriceBadge
// =============================================================================

'use client'

import { useState, useMemo } from 'react'
import { Star, TrendingUp, TrendingDown, Bell, X } from 'lucide-react'
import { useWatchlist, useWatchlistAutoUpdate } from '@/hooks/useWatchlist'
import { useWatchlistStore } from '@/store/watchlistStore'
import { LivePriceBadge } from '@/components/ui/LivePriceBadge'
import type { WatchlistItem } from '@/types/crypto'

interface WatchlistTableProps {
  category?:       string
  autoUpdate?:     boolean
  updateInterval?: number
}

export function WatchlistTable({
  category,
  autoUpdate     = true,
  updateInterval = 30_000,
}: WatchlistTableProps) {
  const { watchlist, removeFromWatchlist } = useWatchlist()
  const { getCategoryItems } = useWatchlistStore()
  const [sortField,     setSortField]     = useState<'name' | 'price' | 'change'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  if (autoUpdate) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useWatchlistAutoUpdate(updateInterval)
  }

  const filteredWatchlist = useMemo(() => {
    let items = category ? getCategoryItems(category) : watchlist
    items = [...items].sort((a, b) => {
      let cA: string | number, cB: string | number
      switch (sortField) {
        case 'price':  cA = a.currentPrice ?? 0;  cB = b.currentPrice ?? 0;  break
        case 'change': cA = a.priceChange24h ?? 0; cB = b.priceChange24h ?? 0; break
        default:       cA = a.name.toLowerCase();  cB = b.name.toLowerCase()
      }
      if (cA < cB) return sortDirection === 'asc' ? -1 : 1
      if (cA > cB) return sortDirection === 'asc' ?  1 : -1
      return 0
    })
    return items
  }, [watchlist, category, sortField, sortDirection, getCategoryItems])

  const handleSort = (field: 'name' | 'price' | 'change') => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortIcon = (field: 'name' | 'price' | 'change') =>
    sortField === field ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''

  if (filteredWatchlist.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center" style={{ borderColor: 'var(--border)' }}>
        <Star className="mx-auto h-12 w-12" style={{ color: 'var(--text-faint)' }} />
        <h3 className="mt-4 text-lg font-semibold">No coins in watchlist</h3>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {category
            ? `No coins found in "${category}" category`
            : 'Add cryptocurrencies to start tracking prices'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {category || 'Watchlist'}{' '}({filteredWatchlist.length})
        </h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
          Live (Binance WS)
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                    Coin{sortIcon('name')}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <button onClick={() => handleSort('price')} className="ml-auto flex items-center gap-1 hover:opacity-70 transition-opacity">
                    Live Price{sortIcon('price')}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <button onClick={() => handleSort('change')} className="ml-auto flex items-center gap-1 hover:opacity-70 transition-opacity">
                    24h Change{sortIcon('change')}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ background: 'var(--surface)' }}>
              {filteredWatchlist.map(item => (
                <WatchlistRow key={item.id} item={item} onRemove={() => removeFromWatchlist(item.id)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function toBinanceSymbol(symbol: string): string {
  const overrides: Record<string, string> = {
    egld:  'EGLDUSDT',
    matic: 'MATICUSDT',
    shib:  'SHIBUSDT',
  }
  const lower = symbol.toLowerCase()
  return overrides[lower] ?? `${symbol.toUpperCase()}USDT`
}

interface WatchlistRowProps {
  item:     WatchlistItem
  onRemove: () => void
}

function WatchlistRow({ item, onRemove }: WatchlistRowProps) {
  const [showActions, setShowActions] = useState(false)
  const wsSymbol = toBinanceSymbol(item.symbol)

  const formatChange = (change: number | undefined) => {
    if (change === undefined) return { text: '—', positive: null }
    return { text: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`, positive: change >= 0 }
  }
  const ch = formatChange(item.priceChange24h)

  return (
    <tr
      className="transition-colors"
      style={{ borderTop: '1px solid var(--border)' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Coin */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {item.image && (
            <img src={item.image} alt={item.name} className="h-8 w-8 rounded-full" loading="lazy"
              onError={e => { e.currentTarget.style.display = 'none' }} />
          )}
          <div>
            <div className="font-semibold text-sm">{item.name}</div>
            <div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{item.symbol}</div>
          </div>
        </div>
      </td>

      {/* 🔴 Live price badge */}
      <td className="px-4 py-3 text-right">
        <LivePriceBadge symbol={wsSymbol} showChange={false} />
      </td>

      {/* 24h change (snapshot from store, WS %change also in badge if showChange=true) */}
      <td className="px-4 py-3 text-right">
        <span
          className="inline-flex items-center justify-end gap-1 font-semibold text-sm"
          style={{ color: ch.positive === null ? 'var(--text-muted)' : ch.positive ? 'var(--success)' : 'var(--error)' }}
        >
          {item.priceChange24h !== undefined && (
            ch.positive
              ? <TrendingUp className="h-3.5 w-3.5" />
              : <TrendingDown className="h-3.5 w-3.5" />
          )}
          {ch.text}
        </span>
      </td>

      {/* Category */}
      <td className="px-4 py-3 text-right">
        {item.category && (
          <span
            className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: 'var(--primary-highlight)', color: 'var(--primary)' }}
          >
            {item.category}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {showActions && (
            <>
              <button
                className="rounded-md p-1 transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
                title="Set alert"
                aria-label="Set price alert"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={onRemove}
                className="rounded-md p-1 transition-opacity hover:opacity-60"
                style={{ color: 'var(--error)' }}
                title="Remove from watchlist"
                aria-label="Remove from watchlist"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
