'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useMarkets } from '@/hooks/useCoinGecko'
import { CoinRow } from '@/components/dashboard/CoinRow'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function WatchlistPage() {
  const { ids, toggle } = useWatchlistStore()
  const { coins, loading } = useMarkets({ refreshInterval: 60_000 })

  const watched = coins.filter(c => ids.includes(c.id))

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <Link href="/" className="text-sm flex items-center gap-1 mb-6 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
          ← Dashboard
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <Star size={20} style={{ color: 'var(--yellow)' }} fill="currentColor" />
          <h1 className="font-bold text-2xl">Watchlist</h1>
          <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>({ids.length} coins)</span>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-[2rem_1fr_7rem_7rem_6rem_5rem_4rem] gap-3 px-4 py-3 text-xs font-medium border-b"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            <span>#</span><span>Name</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h %</span>
            <span className="text-right hidden sm:block">Market Cap</span>
            <span className="text-right hidden md:block">7d Chart</span>
            <span className="text-center">★</span>
          </div>

          {loading
            ? <SkeletonTable rows={ids.length || 6} />
            : watched.length === 0
              ? <EmptyState variant="watchlist" />
              : watched.map((coin, i) => (
                  <CoinRow
                    key={coin.id}
                    coin={coin}
                    rank={i + 1}
                    inWatchlist
                    onToggleWatchlist={toggle}
                    animDelay={i * 30}
                  />
                ))
          }
        </div>
      </div>
    </div>
  )
}
