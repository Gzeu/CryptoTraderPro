'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FlaskConical, TrendingUp, TrendingDown, Activity, Percent } from 'lucide-react'
import { runBacktest } from '@/lib/backtest'
import type { OHLCBar } from '@/lib/backtest'
import { BacktestChart } from '@/components/charts/BacktestChart'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { fmtPrice, fmtPct, fmtDate } from '@/lib/formatters'
import { TOP_COINS } from '@/lib/constants'
import { CG_TO_BINANCE } from '@/lib/cgToBinance'

const FAST_OPTIONS = [9, 10, 20, 25]
const SLOW_OPTIONS = [21, 50, 100, 200]
const DAYS_OPTIONS = [{ label: '6M', value: 180 }, { label: '1Y', value: 365 }, { label: '2Y', value: 730 }]
const CAPITAL_OPTIONS = [1_000, 5_000, 10_000, 50_000]

async function fetchBinanceKlines(symbol: string, days: number): Promise<OHLCBar[]> {
  const limit = Math.min(days, 1000)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BINANCE_REST_BASE ?? 'https://api.binance.com/api/v3'}/klines?symbol=${symbol}&interval=1d&limit=${limit}`
  )
  if (!res.ok) throw new Error('Binance klines fetch failed')
  const raw: any[][] = await res.json()
  return raw.map(k => ({
    ts: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }))
}

function MetricCard({ icon, label, value, sub, variant }: { icon: React.ReactNode; label: string; value: string; sub?: string; variant?: 'success' | 'error' | 'info' | 'warning' }) {
  const color = variant === 'success' ? 'text-green-500 dark:text-green-400'
    : variant === 'error' ? 'text-red-500 dark:text-red-400'
    : 'text-[var(--color-text)]'
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs mb-2">
        {icon}
        <span className="uppercase tracking-wide font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function BacktestPage() {
  const coinOptions = TOP_COINS.filter(c => CG_TO_BINANCE[c.id])
  const [coinId, setCoinId] = useState('bitcoin')
  const [fastPeriod, setFastPeriod] = useState(20)
  const [slowPeriod, setSlowPeriod] = useState(50)
  const [days, setDays] = useState(365)
  const [capital, setCapital] = useState(10_000)

  const symbol = CG_TO_BINANCE[coinId]

  const { data: bars, isLoading, error } = useQuery<OHLCBar[]>({
    queryKey: ['klines', symbol, days],
    queryFn: () => fetchBinanceKlines(symbol, days),
    staleTime: 15 * 60_000,
    enabled: !!symbol,
  })

  const result = useMemo(() => {
    if (!bars || bars.length < slowPeriod + 2) return null
    return runBacktest(bars, fastPeriod, slowPeriod, capital)
  }, [bars, fastPeriod, slowPeriod, capital])

  const vsHold = result ? result.totalReturnPct - result.buyAndHoldReturnPct : null

  return (
    <main className="max-w-[var(--content-wide)] mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[var(--text-xl)] font-display font-bold text-[var(--color-text)] flex items-center gap-2">
          <FlaskConical size={22} className="text-[var(--color-primary)]" />
          Backtest — SMA Crossover
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Simulates a moving average crossover strategy on daily OHLC data from Binance.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        {/* Coin */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-muted)] font-medium">Coin</label>
          <select value={coinId} onChange={e => setCoinId(e.target.value)}
            className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            {coinOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {/* Fast SMA */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-muted)] font-medium">Fast SMA</label>
          <select value={fastPeriod} onChange={e => setFastPeriod(+e.target.value)}
            className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            {FAST_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        {/* Slow SMA */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-muted)] font-medium">Slow SMA</label>
          <select value={slowPeriod} onChange={e => setSlowPeriod(+e.target.value)}
            className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            {SLOW_OPTIONS.filter(v => v > fastPeriod).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        {/* Period */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-muted)] font-medium">Period</label>
          <div className="flex gap-1">
            {DAYS_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setDays(o.value)}
                className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                  days === o.value ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-dynamic)]'
                }`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {/* Capital */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-text-muted)] font-medium">Capital</label>
          <select value={capital} onChange={e => setCapital(+e.target.value)}
            className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            {CAPITAL_OPTIONS.map(v => <option key={v} value={v}>${v.toLocaleString()}</option>)}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="w-full h-[320px] rounded-xl" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-[var(--color-error-highlight)] border border-[var(--color-error)] text-sm text-[var(--color-error)]">
          Failed to load OHLC data. Binance may be rate-limiting. Try again in a moment.
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard icon={<TrendingUp size={13} />} label="Total Return" value={fmtPct(result.totalReturnPct)} variant={result.totalReturnPct >= 0 ? 'success' : 'error'} sub={`Final: $${result.finalEquity.toLocaleString()}`} />
            <MetricCard icon={<Activity size={13} />} label="Buy & Hold" value={fmtPct(result.buyAndHoldReturnPct)} variant={result.buyAndHoldReturnPct >= 0 ? 'success' : 'error'} />
            <MetricCard icon={<TrendingUp size={13} />} label="vs Buy & Hold" value={vsHold != null ? fmtPct(vsHold) : '—'} variant={vsHold != null && vsHold >= 0 ? 'success' : 'error'} sub={vsHold != null && vsHold >= 0 ? 'Strategy wins 🏆' : 'Buy & Hold wins'} />
            <MetricCard icon={<TrendingDown size={13} />} label="Max Drawdown" value={`-${result.maxDrawdownPct}%`} variant="error" />
            <MetricCard icon={<Activity size={13} />} label="Sharpe Ratio" value={String(result.sharpeRatio)} variant={result.sharpeRatio >= 1 ? 'success' : result.sharpeRatio >= 0 ? 'info' : 'error'} sub="Annualized (crypto 365d)" />
            <MetricCard icon={<Percent size={13} />} label="Win Rate" value={`${result.winRate}%`} variant={result.winRate >= 50 ? 'success' : 'warning'} sub={`${Math.ceil(result.numTrades / 2)} winning trades`} />
            <MetricCard icon={<Activity size={13} />} label="Total Trades" value={String(result.numTrades)} sub={`${result.numTrades / 2 | 0} buy / sell pairs`} />
            <MetricCard icon={<TrendingUp size={13} />} label="Strategy" value={`SMA${fastPeriod} / SMA${slowPeriod}`} sub={`${days}d on ${symbol}`} />
          </div>

          {/* Equity curve chart */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">Equity Curve</h2>
            <BacktestChart result={result} initialCapital={capital} />
          </div>

          {/* Trade log */}
          {result.trades.length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
              <div className="bg-[var(--color-surface-offset)] px-4 py-2.5 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Trade Log</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                    <th className="py-2 px-4 text-left font-medium">#</th>
                    <th className="py-2 px-4 text-left font-medium">Type</th>
                    <th className="py-2 px-4 text-left font-medium">Date</th>
                    <th className="py-2 px-4 text-right font-medium">Price</th>
                    <th className="py-2 px-4 text-right font-medium">Equity After</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((t, i) => (
                    <tr key={i} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-offset)] transition-colors">
                      <td className="py-2.5 px-4 text-[var(--color-text-muted)] tabular-nums">{i + 1}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={t.type === 'buy' ? 'success' : 'error'}>
                          {t.type === 'buy' ? '▲ BUY' : '▼ SELL'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-[var(--color-text-muted)] text-xs tabular-nums">{fmtDate(t.ts)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-medium">{fmtPrice(t.price)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums">${t.equityAfter.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Not enough data */}
      {!isLoading && bars && bars.length < slowPeriod + 2 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FlaskConical size={40} className="text-[var(--color-text-faint)] mb-4" />
          <h3 className="font-semibold text-[var(--color-text)] mb-1">Not enough data</h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-[40ch]">
            Need at least {slowPeriod + 2} daily bars. Try a longer period or smaller SMA parameters.
          </p>
        </div>
      )}
    </main>
  )
}
