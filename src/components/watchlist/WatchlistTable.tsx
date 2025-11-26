// =============================================================================
// Watchlist Table Component - Real-time price monitoring
// =============================================================================

'use client'

import { useState, useMemo } from 'react'
import { Star, TrendingUp, TrendingDown, Plus, X, Bell, BellOff } from 'lucide-react'
import { useWatchlist, useWatchlistAutoUpdate } from '@/hooks/useWatchlist'
import { useWatchlistStore } from '@/store/watchlistStore'
import type { WatchlistItem } from '@/types/crypto'

interface WatchlistTableProps {
  category?: string
  autoUpdate?: boolean
  updateInterval?: number
}

export function WatchlistTable({ 
  category, 
  autoUpdate = true,
  updateInterval = 30000 
}: WatchlistTableProps) {
  const { watchlist, removeFromWatchlist } = useWatchlist()
  const { getCategoryItems } = useWatchlistStore()
  const [sortField, setSortField] = useState<'name' | 'price' | 'change'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Enable auto-updates if requested
  if (autoUpdate) {
    useWatchlistAutoUpdate(updateInterval)
  }

  const filteredWatchlist = useMemo(() => {
    let items = category ? getCategoryItems(category) : watchlist

    // Sort items
    items = [...items].sort((a, b) => {
      let compareA: any
      let compareB: any

      switch (sortField) {
        case 'name':
          compareA = a.name.toLowerCase()
          compareB = b.name.toLowerCase()
          break
        case 'price':
          compareA = a.currentPrice || 0
          compareB = b.currentPrice || 0
          break
        case 'change':
          compareA = a.priceChange24h || 0
          compareB = b.priceChange24h || 0
          break
        default:
          return 0
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return items
  }, [watchlist, category, sortField, sortDirection, getCategoryItems])

  const handleSort = (field: 'name' | 'price' | 'change') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatPrice = (price: number | undefined) => {
    if (!price) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price)
  }

  const formatChange = (change: number | undefined) => {
    if (change === undefined) return '-'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  if (filteredWatchlist.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Star className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No coins in watchlist</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {category 
            ? `No coins found in ${category} category`
            : 'Add cryptocurrencies to start tracking prices'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {category || 'Watchlist'} ({filteredWatchlist.length})
        </h3>
        {autoUpdate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Live updates
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Coin
                    {sortField === 'name' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort('price')}
                    className="ml-auto flex items-center gap-1 hover:text-foreground"
                  >
                    Price
                    {sortField === 'price' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => handleSort('change')}
                    className="ml-auto flex items-center gap-1 hover:text-foreground"
                  >
                    24h Change
                    {sortField === 'change' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredWatchlist.map((item) => (
                <WatchlistRow
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromWatchlist(item.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface WatchlistRowProps {
  item: WatchlistItem
  onRemove: () => void
}

function WatchlistRow({ item, onRemove }: WatchlistRowProps) {
  const [showActions, setShowActions] = useState(false)

  const formatPrice = (price: number | undefined) => {
    if (!price) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price)
  }

  const formatChange = (change: number | undefined) => {
    if (change === undefined) return { text: '-', color: 'text-muted-foreground' }
    const sign = change >= 0 ? '+' : ''
    const color = change >= 0 ? 'text-green-500' : 'text-red-500'
    return { text: `${sign}${change.toFixed(2)}%`, color }
  }

  const change = formatChange(item.priceChange24h)

  return (
    <tr
      className="transition-colors hover:bg-muted/50"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="h-8 w-8 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <div>
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-muted-foreground">{item.symbol.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-mono font-semibold">
        {formatPrice(item.currentPrice)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className={`flex items-center justify-end gap-1 font-semibold ${change.color}`}>
          {item.priceChange24h !== undefined && (
            <>
              {item.priceChange24h >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </>
          )}
          {change.text}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        {item.category && (
          <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {item.category}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {showActions && (
            <>
              <button
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Set alert"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={onRemove}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove from watchlist"
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
