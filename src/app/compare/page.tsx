'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight, TrendingUp } from 'lucide-react'
import { CompareChart } from '@/components/charts/CompareChart'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { fmtPrice, fmtLarge, fmtPct } from '@/lib/formatters'
import { TOP_COINS } from '@/lib/constants'

const DAYS_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
  { label: '1Y', value: 365 },
]

const COIN_COLORS = [
  'var(--color-primary)',
  'var(--color-orange)',
  'var(--color-purple)',
  'var(--color-blue)',
]

async function fetchChart(id: string, days: number) {
  const res = await fetch(`/api/chart/${id}?days=${days}`)
  if (!res.ok) throw new Error('Failed to fetch chart')
  return res.json()
}

async function fetchCoin(id: string) {
  const res = await fetch(`/api/coin/${id}`)
  if (!res.ok) throw new Error('Failed to fetch coin')
  return res.json()
}

function StatCard({ label, valueA, valueB, format = 'price' }: { label: string; valueA: any; valueB: any; format?: 'price' | 'large' | 'pct' | 'raw' }) {
  const fmt = (v: any) => {
    if (v == null) return '—'
    if (format === 'price') return fmtPrice(v)
    if (format === 'large') return fmtLarge(v)
    if (format === 'pct') return fmtPct(v)
    return String(v)
  }
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium uppercase tracking-wide">{label}</p>
      <div className="flex gap-4">
        <span className="tabular-nums font-semibold text-[var(--color-primary)]">{fmt(valueA)}</span>
        <span className="text-[var(--color-divider)]">/</span>
        <span className="tabular-nums font-semibold text-[var(--color-orange)]">{fmt(valueB)}</span>
      </div>
    </div>
  )
}

export default function ComparePage() {
  const coinOptions = TOP_COINS.slice(0, 30)
  const [idA, setIdA] = useState('bitcoin')
  const [idB, setIdB] = useState('ethereum')
  const [days, setDays] = useState(30)
  const [normalized, setNormalized] = useState(true)

  const { data: chartA, isLoading: loadingA } = useQuery({ queryKey: ['chart', idA, days], queryFn: () => fetchChart(idA, days), staleTime: 5 * 60_000 })
  const { data: chartB, isLoading: loadingB } = useQuery({ queryKey: ['chart', idB, days], queryFn: () => fetchChart(idB, days), staleTime: 5 * 60_000 })
  const { data: coinA } = useQuery({ queryKey: ['coin', idA], queryFn: () => fetchCoin(idA), staleTime: 60_000 })
  const { data: coinB } = useQuery({ queryKey: ['coin', idB], queryFn: () => fetchCoin(idB), staleTime: 60_000 })

  const seriesA = useMemo(() =>
    (chartA?.prices ?? []).map(([ts, price]: [number, number]) => ({ ts, price })),
    [chartA]
  )
  const seriesB = useMemo(() =>
    (chartB?.prices ?? []).map(([ts, price]: [number, number]) => ({ ts, price })),
    [chartB]
  )

  const loading = loadingA || loadingB

  const nameA = coinA?.name ?? idA
  const nameB = coinB?.name ?? idB

  const perfA = seriesA.length > 1 ? ((seriesA.at(-1)!.price - seriesA[0].price) / seriesA[0].price) * 100 : null
  const perfB = seriesB.length > 1 ? ((seriesB.at(-1)!.price - seriesB[0].price) / seriesB[0].price) * 100 : null
  const winner = perfA != null && perfB != null ? (perfA >= perfB ? nameA : nameB) : null

  return (
    <main className="max-w-[var(--content-wide)] mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[var(--text-xl)] font-display font-bold text-[var(--color-text)] flex items-center gap-2">
          <ArrowLeftRight size={22} className="text-[var(--color-primary)]" />
          Compare Coins
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Side-by-side performance comparison, normalized to 100%</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        {[{ label: 'Coin A', value: idA, set: setIdA, color: 'text-[var(--color-primary)]' }, { label: 'Coin B', value: idB, set: setIdB, color: 'text-[var(--color-orange)]' }].map(({ label, value, set, color }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className={`text-xs font-medium ${color}`}>{label}</label>
            <select
              value={value}
              onChange={e => set(e.target.value)}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            >
              {coinOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">Range</label>
          <div className="flex gap-1">
            {DAYS_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setDays(o.value)}
                className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                  days === o.value
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-dynamic)]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">Mode</label>
          <button
            onClick={() => setNormalized(n => !n)}
            className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
              normalized
                ? 'bg-[var(--color-primary-highlight)] text-[var(--color-primary)]'
                : 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-dynamic)]'
            }`}
          >
            {normalized ? 'Normalized %' : 'Raw Price'}
          </button>
        </div>
      </div>

      {/* Performance summary */}
      {perfA != null && perfB != null && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-offset)] border border-[var(--color-border)] text-sm">
          <TrendingUp size={15} className="text-[var(--color-primary)]" />
          <span className="text-[var(--color-text-muted)]">Over {days}d:</span>
          <span className="font-semibold text-[var(--color-primary)] tabular-nums">{nameA}: {fmtPct(perfA)}</span>
          <span className="text-[var(--color-divider)]">vs</span>
          <span className="font-semibold text-[var(--color-orange)] tabular-nums">{nameB}: {fmtPct(perfB)}</span>
          {winner && (
            <Badge variant="success">🏆 {winner} outperformed</Badge>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        {loading ? (
          <Skeleton className="w-full h-[340px] rounded-lg" />
        ) : seriesA.length > 0 && seriesB.length > 0 ? (
          <CompareChart
            coinA={{ id: idA, name: nameA, color: COIN_COLORS[0], data: seriesA }}
            coinB={{ id: idB, name: nameB, color: COIN_COLORS[1], data: seriesB }}
            normalized={normalized}
          />
        ) : (
          <div className="flex items-center justify-center h-[340px] text-[var(--color-text-muted)] text-sm">No data available</div>
        )}
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Stats — <span className="text-[var(--color-primary)]">{nameA}</span> vs <span className="text-[var(--color-orange)]">{nameB}</span></h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="Current Price" valueA={coinA?.market_data?.current_price?.usd} valueB={coinB?.market_data?.current_price?.usd} format="price" />
          <StatCard label="Market Cap" valueA={coinA?.market_data?.market_cap?.usd} valueB={coinB?.market_data?.market_cap?.usd} format="large" />
          <StatCard label="24h Volume" valueA={coinA?.market_data?.total_volume?.usd} valueB={coinB?.market_data?.total_volume?.usd} format="large" />
          <StatCard label="24h Change" valueA={coinA?.market_data?.price_change_percentage_24h} valueB={coinB?.market_data?.price_change_percentage_24h} format="pct" />
          <StatCard label="7d Change" valueA={coinA?.market_data?.price_change_percentage_7d} valueB={coinB?.market_data?.price_change_percentage_7d} format="pct" />
          <StatCard label="ATH" valueA={coinA?.market_data?.ath?.usd} valueB={coinB?.market_data?.ath?.usd} format="price" />
          <StatCard label="Circulating Supply" valueA={coinA?.market_data?.circulating_supply} valueB={coinB?.market_data?.circulating_supply} format="large" />
          <StatCard label="Market Cap Rank" valueA={coinA?.market_cap_rank} valueB={coinB?.market_cap_rank} format="raw" />
        </div>
      </div>
    </main>
  )
}
