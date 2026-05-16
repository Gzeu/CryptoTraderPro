'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Plus, BarChart2 } from 'lucide-react'
import { ComparisonChart, type ComparisonSeries } from '@/components/charts/ComparisonChart'
import { useTheme } from '@/hooks/useTheme'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

// ---- coin picker data (top 20 + EGLD) ----
const COINS = [
  { id: 'bitcoin',        name: 'Bitcoin',     symbol: 'BTC'  },
  { id: 'ethereum',       name: 'Ethereum',    symbol: 'ETH'  },
  { id: 'elrond-erd-2',   name: 'EGLD',        symbol: 'EGLD' },
  { id: 'solana',         name: 'Solana',      symbol: 'SOL'  },
  { id: 'binancecoin',    name: 'BNB',         symbol: 'BNB'  },
  { id: 'cardano',        name: 'Cardano',     symbol: 'ADA'  },
  { id: 'ripple',         name: 'XRP',         symbol: 'XRP'  },
  { id: 'dogecoin',       name: 'Dogecoin',    symbol: 'DOGE' },
  { id: 'polkadot',       name: 'Polkadot',    symbol: 'DOT'  },
  { id: 'avalanche-2',    name: 'Avalanche',   symbol: 'AVAX' },
  { id: 'chainlink',      name: 'Chainlink',   symbol: 'LINK' },
  { id: 'uniswap',        name: 'Uniswap',     symbol: 'UNI'  },
  { id: 'litecoin',       name: 'Litecoin',    symbol: 'LTC'  },
  { id: 'cosmos',         name: 'Cosmos',      symbol: 'ATOM' },
  { id: 'stellar',        name: 'Stellar',     symbol: 'XLM'  },
]

type Range = { label: string; days: number }
const RANGES: Range[] = [
  { label: '7D',  days: 7   },
  { label: '1M',  days: 30  },
  { label: '3M',  days: 90  },
  { label: '1Y',  days: 365 },
]

function usePriceHistory(coinId: string, days: number) {
  return useQuery({
    queryKey: ['compare-prices', coinId, days],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      )
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json() as { prices: [number, number][] }
      return data.prices
    },
    staleTime: 300_000,
  })
}

function CoinTag({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: 'var(--color-primary-highlight)', color: 'var(--color-primary)' }}>
      {name}
      <button onClick={onRemove} aria-label={`Remove ${name}`}
        className="hover:opacity-60 transition-opacity"><X size={11} /></button>
    </span>
  )
}

// Loader for a single coin's data — renders nothing, just feeds into parent series
function CoinLoader({
  coinId, coinName, days,
  onLoaded,
}: { coinId: string; coinName: string; days: number; onLoaded: (s: ComparisonSeries) => void }) {
  const { data } = useQuery({
    queryKey: ['compare-prices', coinId, days],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      )
      if (!res.ok) throw new Error('fetch failed')
      const d = await res.json() as { prices: [number, number][] }
      return d.prices
    },
    staleTime: 300_000,
  })

  if (data) onLoaded({ coinId, coinName, prices: data })
  return null
}

export default function ComparePage() {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'

  const [selected, setSelected] = useState<typeof COINS>([COINS[0], COINS[1], COINS[2]])
  const [range,    setRange]    = useState<Range>(RANGES[1])
  const [series,   setSeries]   = useState<ComparisonSeries[]>([])

  const available = COINS.filter(c => !selected.find(s => s.id === c.id))

  function addCoin(coin: typeof COINS[0]) {
    if (selected.length >= 6) return
    setSelected(prev => [...prev, coin])
  }

  function removeCoin(id: string) {
    setSelected(prev => prev.filter(c => c.id !== id))
    setSeries(prev => prev.filter(s => s.coinId !== id))
  }

  const handleLoaded = useCallback((s: ComparisonSeries) => {
    setSeries(prev => {
      const exists = prev.find(p => p.coinId === s.coinId)
      if (exists && exists.prices.length === s.prices.length) return prev
      return [...prev.filter(p => p.coinId !== s.coinId), s]
    })
  }, [])

  const loading = selected.some(c => !series.find(s => s.coinId === c.id))

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-sm"
            style={{ color: 'var(--color-text-muted)' }}>← Dashboard</Link>
          <BarChart2 size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="font-bold">Price Comparison</span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>normalised to 100%</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Data loaders (invisible) */}
        {selected.map(c => (
          <CoinLoader key={`${c.id}-${range.days}`}
            coinId={c.id} coinName={c.name} days={range.days}
            onLoaded={handleLoaded}
          />
        ))}

        {/* Controls */}
        <div className="rounded-xl border p-4 space-y-3"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {/* Selected coins */}
          <div className="flex flex-wrap gap-2 items-center">
            {selected.map(c => (
              <CoinTag key={c.id} name={c.name} onRemove={() => removeCoin(c.id)} />
            ))}
            {selected.length < 6 && (
              <div className="relative group">
                <button
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <Plus size={11} /> Add coin
                </button>
                <div className="absolute top-full left-0 mt-1 z-50 hidden group-focus-within:block group-hover:block
                  rounded-xl border shadow-lg overflow-hidden"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', minWidth: 180 }}>
                  {available.map(c => (
                    <button key={c.id} onClick={() => addCoin(c)}
                      className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: 'var(--color-text)' }}>
                      {c.name} <span style={{ color: 'var(--color-text-muted)' }}>{c.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Range picker */}
          <div className="flex gap-1">
            {RANGES.map(r => (
              <button key={r.days} onClick={() => { setRange(r); setSeries([]) }}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={range.days === r.days
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text-muted)', background: 'var(--color-surface-2)' }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border p-4"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {loading
            ? <Skeleton style={{ height: 300, borderRadius: 8 }} />
            : <ComparisonChart
                series={series.filter(s => selected.find(c => c.id === s.coinId))}
                isDark={isDark}
                height={300}
              />
          }
        </div>

        {/* Legend note */}
        <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
          Chart shows % change from the start of the selected period. All coins start at 0%.
          Powered by CoinGecko.
        </p>
      </main>
    </div>
  )
}
