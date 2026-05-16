'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, BarChart2, Activity } from 'lucide-react'
import { fetchOHLC } from '@/lib/api/coingecko'
import { useBacktest, type Strategy } from '@/hooks/useBacktest'
import { fmtPrice, fmtDate } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/Skeleton'

const STRATEGIES: { value: Strategy; label: string; desc: string }[] = [
  { value: 'buy_hold',    label: 'Buy & Hold',   desc: 'Enter at start, exit at end' },
  { value: 'sma_cross',   label: 'SMA Cross',    desc: 'Fast SMA(9) crosses above/below Slow SMA(21)' },
  { value: 'rsi_oversold',label: 'RSI Oversold', desc: 'Buy RSI<30 exit, Sell RSI>70' },
]

const RANGES = [
  { label: '7D',  value: '7' },
  { label: '1M',  value: '30' },
  { label: '3M',  value: '90' },
  { label: '1Y',  value: '365' },
]

interface Props { coinId: string; coinName: string }

export function BacktestPanel({ coinId, coinName }: Props) {
  const [strategy, setStrategy] = useState<Strategy>('sma_cross')
  const [range,    setRange]    = useState('90')

  const { data: ohlc = [], isLoading } = useQuery({
    queryKey: ['ohlc', coinId, range],
    queryFn:  () => fetchOHLC(coinId, range),
    staleTime: 5 * 60_000,
  })

  const result = useBacktest(ohlc, strategy)

  const totalUp = result.totalReturn >= 0
  const stratDesc = STRATEGIES.find(s => s.value === strategy)?.desc ?? ''

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={15} style={{ color: 'var(--primary)' }} />
          <h2 className="font-semibold text-sm">Backtest — {coinName}</h2>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Strategy selector */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-2)' }}>
            {STRATEGIES.map(s => (
              <button key={s.value} onClick={() => setStrategy(s.value)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                style={strategy === s.value
                  ? { background: 'var(--primary)', color: '#fff' }
                  : { color: 'var(--text-muted)' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Range selector */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-2)' }}>
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                style={range === r.value
                  ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: 'var(--text-muted)' }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>{stratDesc}</p>
      </div>

      {/* Stats */}
      {isLoading
        ? <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        : (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Total Return', value: `${totalUp?'+':''}${result.totalReturn}%`, up: totalUp, icon: <TrendingUp size={13}/> },
                { label: 'Win Rate',     value: `${result.winRate}%`,    up: result.winRate >= 50, icon: <BarChart2 size={13}/> },
                { label: 'Max Drawdown', value: `-${result.maxDrawdown}%`, up: false, icon: <TrendingDown size={13}/> },
                { label: 'Sharpe',       value: result.sharpe.toFixed(2), up: result.sharpe >= 1, icon: <Activity size={13}/> },
              ].map(({ label, value, up, icon }) => (
                <div key={label} className="rounded-xl p-3 border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-1 mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>{icon}{label}</div>
                  <p className={`font-bold text-lg num ${ up ? 'text-green-500' : label === 'Sharpe' && result.sharpe >= 1 ? 'text-green-500' : 'text-red-500'}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Trades table */}
            {result.trades.length > 0 ? (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] px-3 py-2 text-xs font-medium border-b"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <span>Entry</span><span>Exit</span><span className="text-right">Entry $</span><span className="text-right">Exit $</span><span className="text-right">P&L</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {result.trades.map((t, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] px-3 py-2 text-xs border-b last:border-0"
                      style={{ borderColor: 'var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{fmtDate(new Date(t.entryTime))}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{fmtDate(new Date(t.exitTime))}</span>
                      <span className="text-right num">{fmtPrice(t.entryPrice)}</span>
                      <span className="text-right num">{fmtPrice(t.exitPrice)}</span>
                      <span className={`text-right font-semibold num ${t.pnlPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No trades generated with this strategy in the selected range.</p>
            )}
          </div>
        )
      }
    </div>
  )
}
