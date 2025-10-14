'use client'

// =============================================================================
// Crypto Watchlist Table Component
// =============================================================================

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  StarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercentage } from '@/lib/api/coinGecko'
import type { CryptoCoin } from '@/types/crypto'

interface WatchlistTableProps {
  coins: CryptoCoin[]
  loading?: boolean
  onCoinSelect?: (coin: CryptoCoin) => void
  onAddToWatchlist?: (coinId: string) => void
  onRemoveFromWatchlist?: (coinId: string) => void
  watchlistIds?: string[]
  className?: string
  compact?: boolean
}

type SortField = 'rank' | 'name' | 'price' | 'change24h' | 'marketCap' | 'volume'
type SortDirection = 'asc' | 'desc'

export function WatchlistTable({
  coins,
  loading = false,
  onCoinSelect,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  watchlistIds = [],
  className,
  compact = false,
}: WatchlistTableProps) {
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [hoveredCoin, setHoveredCoin] = useState<string | null>(null)

  // Sort coins based on current sort field and direction
  const sortedCoins = useMemo(() => {
    if (!coins.length) return []

    return [...coins].sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case 'rank':
          aValue = a.market_cap_rank || 999999
          bValue = b.market_cap_rank || 999999
          break
        case 'name':
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        case 'price':
          aValue = a.current_price
          bValue = b.current_price
          break
        case 'change24h':
          aValue = a.price_change_percentage_24h
          bValue = b.price_change_percentage_24h
          break
        case 'marketCap':
          aValue = a.market_cap
          bValue = b.market_cap
          break
        case 'volume':
          aValue = a.total_volume
          bValue = b.total_volume
          break
        default:
          return 0
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })
  }, [coins, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpIcon className="h-3 w-3 opacity-0 group-hover:opacity-30" />
    return sortDirection === 'asc' 
      ? <ArrowUpIcon className="h-3 w-3" />
      : <ArrowDownIcon className="h-3 w-3" />
  }

  const isInWatchlist = (coinId: string) => watchlistIds.includes(coinId)

  if (loading) {
    return (
      <div className={cn("rounded-lg border bg-card", className)}>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted/70 rounded w-2/3 animate-pulse" />
                </div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!coins.length) {
    return (
      <div className={cn("rounded-lg border bg-card", className)}>
        <div className="flex flex-col items-center justify-center p-12">
          <div className="rounded-full bg-muted p-3">
            <EyeIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No cryptocurrencies found</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Add some cryptocurrencies to your watchlist to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('rank')}
                    className="group flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    #
                    <SortIcon field="rank" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left min-w-[200px]">
                  <button
                    onClick={() => handleSort('name')}
                    className="group flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Name
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('price')}
                    className="group flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground ml-auto"
                  >
                    Price
                    <SortIcon field="price" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('change24h')}
                    className="group flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground ml-auto"
                  >
                    24h %
                    <SortIcon field="change24h" />
                  </button>
                </th>
                {!compact && (
                  <>
                    <th className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSort('marketCap')}
                        className="group flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground ml-auto"
                      >
                        Market Cap
                        <SortIcon field="marketCap" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSort('volume')}
                        className="group flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground ml-auto"
                      >
                        Volume (24h)
                        <SortIcon field="volume" />
                      </button>
                    </th>
                  </>
                )}
                <th className="px-4 py-3 w-10">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCoins.map((coin, index) => {
                const isPositive = coin.price_change_percentage_24h >= 0
                const isWatchlisted = isInWatchlist(coin.id)
                const isHovered = hoveredCoin === coin.id
                
                return (
                  <tr
                    key={coin.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 cursor-pointer",
                      isHovered && "bg-muted/30"
                    )}
                    onMouseEnter={() => setHoveredCoin(coin.id)}
                    onMouseLeave={() => setHoveredCoin(null)}
                    onClick={() => onCoinSelect?.(coin)}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {coin.market_cap_rank || '—'}
                      </span>
                    </td>

                    {/* Name & Symbol */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 flex-shrink-0">
                          {coin.image ? (
                            <Image
                              src={coin.image}
                              alt={coin.name}
                              fill
                              className="rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium text-muted-foreground">
                                {coin.symbol.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {coin.name}
                            </span>
                            {coin.price_change_percentage_1h_in_currency !== undefined && (
                              <div className="flex items-center">
                                {coin.price_change_percentage_1h_in_currency >= 0 ? (
                                  <TrendingUpIcon className="h-3 w-3 text-bullish" />
                                ) : (
                                  <TrendingDownIcon className="h-3 w-3 text-bearish" />
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground uppercase">
                            {coin.symbol}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-medium">
                        {formatNumber(coin.current_price)}
                      </span>
                    </td>

                    {/* 24h Change */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={cn(
                          "font-mono font-medium",
                          isPositive ? "text-bullish" : "text-bearish"
                        )}>
                          {formatPercentage(coin.price_change_percentage_24h)}
                        </span>
                        {isPositive ? (
                          <ArrowUpIcon className="h-3 w-3 text-bullish" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-bearish" />
                        )}
                      </div>
                    </td>

                    {!compact && (
                      <>
                        {/* Market Cap */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-muted-foreground">
                            {formatNumber(coin.market_cap)}
                          </span>
                        </td>

                        {/* Volume */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-muted-foreground">
                            {formatNumber(coin.total_volume)}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        {isWatchlisted ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveFromWatchlist?.(coin.id)
                            }}
                            className="p-1 rounded-md hover:bg-muted transition-colors group"
                            title="Remove from watchlist"
                          >
                            <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddToWatchlist?.(coin.id)
                            }}
                            className="p-1 rounded-md hover:bg-muted transition-colors group opacity-0 group-hover:opacity-100"
                            title="Add to watchlist"
                          >
                            <PlusIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default WatchlistTable