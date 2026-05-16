'use client'

// =============================================================================
// BacktestPanel — full backtesting UI
// Strategy selector → fetch OHLC → run backtest → render equity curve + trades
// =============================================================================

import { useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, BarChart2, RefreshCw } from 'lucide-react'
import { useBacktest, type Strategy } from '@/hooks/useBacktest'
import { getOHLCBars, type OHLCBar } from '@/lib/api/coingecko'

const COINS = [
  { id: 'bitcoin',          label: 'BTC' },
  { id: 'ethereum',         label: 'ETH' },
  { id: 'elrond-erd-2',     label: 'EGLD' },
  { id: 'solana',           label: 'SOL' },
  { id: 'binancecoin',      label: 'BNB' },
]

const STRATEGIES: { value: Strategy; label: string; desc: string }[] = [
  { value: 'sma_cross',    label: 'SMA Cross',       desc: 'Buy when 9-SMA crosses above 21-SMA' },
  { value: 'rsi_oversold', label: 'RSI Reversal',    desc: 'Buy RSI<30, sell RSI>70' },
  { value: 'buy_hold',     label: 'Buy & Hold',      desc: 'Baseline: buy and hold entire period' },
]

const DAYS_OPTIONS = [
  { value: 30,  label: '1M'  },
  { value: 90,  label: '3M'  },
  { value: 180, label: '6M'  },
  { value: 365, label: '1Y'  },
]

function StatCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const color = positive === undefined ? 'var(--text)'
    : positive ? 'var(--success)' : 'var(--error)'
  return (
    <div className="rounded-xl border p-3" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-lg font-bold num" style={{ color }}>{value}</p>
    </div>
  )
}

// Minimal inline equity curve (SVG sparkline, no external dep needed)
function EquityCurve({ data }: { data: { time: number; equity: number }[] }) {
  if (data.length < 2) return null
  const W = 600, H = 120
  const minE = Math.min(...data.map(d => d.equity))
  const maxE = Math.max(...data.map(d => d.equity))
  const rangeE = maxE - minE || 1
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((d.equity - minE) / rangeE) * (H - 8) - 4
    return `${x},${y}`
  }).join(' ')
  const isPositive = data[data.length - 1].equity >= 100
  const strokeColor = isPositive ? 'var(--success)' : 'var(--error)'
  // fill area
  const areaPoints = `0,${H} ${points} ${W},${H}`
  return (
    <div className="w-full overflow-hidden rounded-lg" style={{ background: 'var(--surface-2)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }} aria-label="Equity curve">
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#eqGrad)" />
        <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function BacktestPanel() {
  const [coinId,   setCoinId]   = useState('bitcoin')
  const [strategy, setStrategy] = useState<Strategy>('sma_cross')
  const [days,     setDays]     = useState(90)
  const [bars,     setBars]     = useState<OHLCBar[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [ran,      setRan]      = useState(false)

  const result = useBacktest(bars, strategy)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOHLCBars(coinId, 'usd', days)
      setBars(data)
      setRan(true)
    } catch {
      setError('Failed to fetch OHLC data. Try again.')
    } finally {
      setLoading(false)
    }
  }, [coinId, days])

  const coin = COINS.find(c => c.id === coinId)

  return (
    <section className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
        <h2 className="font-bold text-sm">Backtesting</h2>
      </div>

      {/* Controls */}
      <div className="px-5 py-4 flex flex-wrap gap-3">
        {/* Coin */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Asset</label>
          <select
            value={coinId}
            onChange={e => setCoinId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-sm"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {COINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {/* Strategy */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Strategy</label>
          <select
            value={strategy}
            onChange={e => setStrategy(e.target.value as Strategy)}
            className="px-3 py-1.5 rounded-lg border text-sm"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Period */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Period</label>
          <div className="flex gap-1">
            {DAYS_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setDays(o.value)}
                className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
                style={{
                  background:  days === o.value ? 'var(--primary)' : 'var(--surface-2)',
                  borderColor: days === o.value ? 'var(--primary)' : 'var(--border)',
                  color:       days === o.value ? '#fff' : 'var(--text)',
                }}
              >{o.label}</button>
            ))}
          </div>
        </div>

        {/* Run */}
        <div className="flex flex-col justify-end ml-auto">
          <button
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Running…' : 'Run Backtest'}
          </button>
        </div>
      </div>

      {/* Strategy description */}
      <div className="px-5 pb-2">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {STRATEGIES.find(s => s.value === strategy)?.desc}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--error-highlight)', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {ran && result.totalTrades > 0 && (
        <div className="px-5 pb-5 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total Return"
              value={`${result.totalReturn >= 0 ? '+' : ''}${result.totalReturn.toFixed(2)}%`}
              positive={result.totalReturn >= 0}
            />
            <StatCard label="Win Rate"    value={`${result.winRate.toFixed(1)}%`} />
            <StatCard
              label="Max Drawdown"
              value={`-${result.maxDrawdown.toFixed(2)}%`}
              positive={false}
            />
            <StatCard label="Sharpe"      value={result.sharpe.toFixed(2)} />
          </div>

          {/* Equity Curve */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Equity Curve (rebased to 100)</p>
            <EquityCurve data={result.equityCurve} />
          </div>

          {/* Trade log */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              {result.totalTrades} trade{result.totalTrades !== 1 ? 's' : ''} — {coin?.label} · {DAYS_OPTIONS.find(d => d.value === days)?.label}
            </p>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Entry</th>
                    <th className="px-3 py-2 text-left font-medium">Exit</th>
                    <th className="px-3 py-2 text-right font-medium">Entry $</th>
                    <th className="px-3 py-2 text-right font-medium">Exit $</th>
                    <th className="px-3 py-2 text-right font-medium">P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.slice(0, 20).map((t, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <td className="px-3 py-2 num" style={{ color: 'var(--text-faint)' }}>{i + 1}</td>
                      <td className="px-3 py-2 num">{new Date(t.entryTime).toLocaleDateString()}</td>
                      <td className="px-3 py-2 num">{new Date(t.exitTime).toLocaleDateString()}</td>
                      <td className="px-3 py-2 num text-right">${t.entryPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 num text-right">${t.exitPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 num text-right" style={{ color: t.pnlPct >= 0 ? 'var(--success)' : 'var(--error)' }}>
                        {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.trades.length > 20 && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>Showing first 20 of {result.trades.length} trades.</p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!ran && !loading && (
        <div className="px-5 pb-8 flex flex-col items-center justify-center gap-3" style={{ minHeight: 160 }}>
          <BarChart2 size={36} style={{ color: 'var(--text-faint)' }} />
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Select an asset, strategy, and period, then click <strong>Run Backtest</strong>.
          </p>
        </div>
      )}

      {ran && result.totalTrades === 0 && !loading && (
        <div className="px-5 pb-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No trades generated for this strategy in this period.</p>
        </div>
      )}
    </section>
  )
}
