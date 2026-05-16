'use client'

import { Star } from 'lucide-react'
import { PctBadge } from '@/components/ui/Badge'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { fmtLarge } from '@/lib/formatters'
import { LivePriceBadge } from '@/components/ui/LivePriceBadge'
import { type Coin } from '@/types'

interface Props {
  coin: Coin
  rank: number
  inWatchlist: boolean
  onToggleWatchlist: (id: string) => void
  animDelay?: number
}

// Map CoinGecko symbol → Binance USDT pair (best-effort)
function toBinanceSymbol(symbol: string): string {
  const overrides: Record<string, string> = {
    egld: 'EGLDUSDT',
    matic: 'MATICUSDT',
    shib: 'SHIBUSDT',
  }
  const lower = symbol.toLowerCase()
  return overrides[lower] ?? `${symbol.toUpperCase()}USDT`
}

export function CoinRow({ coin, rank, inWatchlist, onToggleWatchlist, animDelay = 0 }: Props) {
  const wsSymbol = toBinanceSymbol(coin.symbol)

  return (
    <div
      className="grid grid-cols-[2rem_1fr_10rem_7rem_6rem_5rem_4rem] gap-3 px-4 py-3 border-b items-center hover:opacity-80 transition-opacity fade-up"
      style={{ borderColor: 'var(--border)', animationDelay: `${animDelay}ms` }}
    >
      <span className="text-xs num" style={{ color: 'var(--text-faint)' }}>{rank}</span>

      {/* Coin name + symbol */}
      <div className="flex items-center gap-2 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full shrink-0" loading="lazy" />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{coin.name}</p>
          <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{coin.symbol}</p>
        </div>
      </div>

      {/* 🔴 Live price via Binance WS */}
      <div className="flex justify-end">
        <LivePriceBadge symbol={wsSymbol} showChange={false} />
      </div>

      {/* 24h change badge (from CoinGecko snapshot — still useful for context) */}
      <div className="flex justify-end">
        <PctBadge value={coin.price_change_percentage_24h ?? 0} />
      </div>

      <p className="text-right text-xs num hidden sm:block" style={{ color: 'var(--text-muted)' }}>
        {fmtLarge(coin.market_cap)}
      </p>

      <div className="hidden md:flex justify-end">
        <SparklineChart prices={coin.sparkline_in_7d?.price ?? []} />
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onToggleWatchlist(coin.id)}
          className="p-1 rounded transition-colors"
          title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          style={{ color: inWatchlist ? 'var(--yellow)' : 'var(--text-faint)' }}
        >
          <Star size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}
