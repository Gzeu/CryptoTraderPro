'use client'

// =============================================================================
// Backtesting Page
// =============================================================================

import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PlayIcon, TrendingUpIcon, TrendingDownIcon, PercentIcon, ZapIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { getOHLCData, coinIdMap } from '@/lib/coingecko'
import { runSMACrossover, runRSIStrategy } from '@/lib/backtest'
import type { BacktestResult, Trade } from '@/lib/backtest'
import type { OHLCCandle } from '@/lib/coingecko'
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'

type Strategy = 'sma' | 'rsi'
type Timeframe = 30 | 90 | 180 | 365

const SYMBOLS = Object.keys(coinIdMap)
const TIMEFRAMES: Timeframe[] = [30, 90, 180, 365]

function KPICard({ label, value, positive, icon }: { label: string; value: string; positive?: boolean; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn('text-xl font-mono font-bold mt-0.5',
              positive === true ? 'text-bullish' : positive === false ? 'text-bearish' : ''
            )}>{value}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function BacktestChart({ candles, trades }: { candles: OHLCCandle[]; trades: Trade[] }) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return

    const chart = createChart(chartRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      height: 320,
    })

    const lineSeries = chart.addLineSeries({ color: '#3b82f6', lineWidth: 2, priceLineVisible: false })
    lineSeries.setData(candles.map((c) => ({ time: Math.floor(c.timestamp / 1000) as unknown as string, value: c.close })))

    // Buy markers
    const buyMarkers = trades
      .filter((t) => t.action === 'BUY')
      .map((t) => ({ time: Math.floor(t.timestamp / 1000) as unknown as string, position: 'belowBar' as const, color: '#22c55e', shape: 'arrowUp' as const, text: 'BUY' }))

    // Sell markers
    const sellMarkers = trades
      .filter((t) => t.action === 'SELL')
      .map((t) => ({ time: Math.floor(t.timestamp / 1000) as unknown as string, position: 'aboveBar' as const, color: '#ef4444', shape: 'arrowDown' as const, text: `SELL ${t.returnPercent !== null ? (t.returnPercent >= 0 ? '+' : '') + t.returnPercent.toFixed(1) + '%' : ''}` }))

    lineSeries.setMarkers([...buyMarkers, ...sellMarkers].sort((a, b) => String(a.time).localeCompare(String(b.time))))

    chart.timeScale().fitContent()

    return () => chart.remove()
  }, [candles, trades])

  return <div ref={chartRef} className="w-full rounded-lg overflow-hidden" />
}

export default function BacktestPage() {
  const [symbol, setSymbol] = useState('BTC')
  const [strategy, setStrategy] = useState<Strategy>('sma')
  const [timeframe, setTimeframe] = useState<Timeframe>(90)
  const [fastPeriod, setFastPeriod] = useState(9)
  const [slowPeriod, setSlowPeriod] = useState(21)
  const [rsiPeriod, setRsiPeriod] = useState(14)
  const [oversold, setOversold] = useState(30)
  const [overbought, setOverbought] = useState(70)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [candles, setCandles] = useState<OHLCCandle[]>([])
  const [running, setRunning] = useState(false)

  const { data: ohlcData, isLoading, error, refetch } = useQuery({
    queryKey: ['ohlc', symbol, timeframe],
    queryFn: () => getOHLCData(coinIdMap[symbol], timeframe),
    staleTime: 5 * 60 * 1000,
    enabled: false,
  })

  const handleRun = async () => {
    setRunning(true)
    try {
      const { data } = await refetch()
      if (!data) return
      setCandles(data)
      const res = strategy === 'sma'
        ? runSMACrossover(data, fastPeriod, slowPeriod)
        : runRSIStrategy(data, rsiPeriod, oversold, overbought)
      setResult(res)
    } finally {
      setRunning(false)
    }
  }

  const sellTrades = result?.trades.filter((t) => t.action === 'SELL') ?? []

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backtesting</h1>
        <p className="text-muted-foreground text-sm">Test trading strategies on historical OHLC data.</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Asset */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Asset</label>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {SYMBOLS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Strategy */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Strategy</label>
              <div className="flex gap-1">
                {(['sma', 'rsi'] as Strategy[]).map((s) => (
                  <button key={s} onClick={() => setStrategy(s)}
                    className={cn('px-3 py-2 text-sm rounded-lg font-medium transition-colors',
                      strategy === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Timeframe</label>
              <div className="flex gap-1">
                {TIMEFRAMES.map((t) => (
                  <button key={t} onClick={() => setTimeframe(t)}
                    className={cn('px-3 py-2 text-sm rounded-lg font-medium transition-colors',
                      timeframe === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}>
                    {t}d
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy Params */}
            {strategy === 'sma' ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Fast Period</label>
                  <input type="number" min={2} max={50} value={fastPeriod} onChange={(e) => setFastPeriod(+e.target.value)}
                    className="w-20 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Slow Period</label>
                  <input type="number" min={2} max={200} value={slowPeriod} onChange={(e) => setSlowPeriod(+e.target.value)}
                    className="w-20 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">RSI Period</label>
                  <input type="number" min={2} max={50} value={rsiPeriod} onChange={(e) => setRsiPeriod(+e.target.value)}
                    className="w-20 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Oversold</label>
                  <input type="number" min={10} max={50} value={oversold} onChange={(e) => setOversold(+e.target.value)}
                    className="w-20 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Overbought</label>
                  <input type="number" min={50} max={90} value={overbought} onChange={(e) => setOverbought(+e.target.value)}
                    className="w-20 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </>
            )}

            <Button onClick={handleRun} disabled={running || isLoading} className="h-10">
              <PlayIcon className="h-4 w-4 mr-2" />
              {running ? 'Running…' : 'Run Backtest'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-bearish/30 bg-bearish/10 px-4 py-3 text-sm text-bearish">
          Failed to fetch data. CoinGecko free tier may be rate-limited. Try again in a moment.
        </div>
      )}

      {result && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard
              label="Total Return"
              value={`${result.totalReturnPercent >= 0 ? '+' : ''}${result.totalReturnPercent.toFixed(2)}%`}
              positive={result.totalReturnPercent >= 0}
              icon={result.totalReturnPercent >= 0 ? <TrendingUpIcon className="h-5 w-5" /> : <TrendingDownIcon className="h-5 w-5" />}
            />
            <KPICard
              label="Win Rate"
              value={`${result.winRate.toFixed(1)}%`}
              positive={result.winRate >= 50}
              icon={<PercentIcon className="h-5 w-5" />}
            />
            <KPICard
              label="Max Drawdown"
              value={`-${result.maxDrawdown.toFixed(2)}%`}
              positive={false}
              icon={<TrendingDownIcon className="h-5 w-5" />}
            />
            <KPICard
              label="Trades / Sharpe"
              value={`${result.tradeCount} / ${result.sharpeRatio.toFixed(2)}`}
              icon={<ZapIcon className="h-5 w-5" />}
            />
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {symbol} · {strategy.toUpperCase()} · {timeframe}d — Buy/Sell signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BacktestChart candles={candles} trades={result.trades} />
            </CardContent>
          </Card>

          {/* Trade Log */}
          {sellTrades.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Trade Log</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t text-xs text-muted-foreground">
                        {['#', 'Date', 'Buy Price', 'Sell Price', 'Return %'].map((h) => (
                          <th key={h} className="px-4 py-2 text-right first:text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sellTrades.map((trade, i) => {
                        const buyTrade = result.trades.filter((t) => t.action === 'BUY')[i]
                        return (
                          <tr key={trade.timestamp} className="border-t hover:bg-muted/30">
                            <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                            <td className="px-4 py-2 text-right">{new Date(trade.timestamp).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-right font-mono">{buyTrade ? formatCurrency(buyTrade.price) : '—'}</td>
                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(trade.price)}</td>
                            <td className={cn('px-4 py-2 text-right font-mono font-medium',
                              (trade.returnPercent ?? 0) >= 0 ? 'text-bullish' : 'text-bearish'
                            )}>
                              {trade.returnPercent !== null
                                ? `${trade.returnPercent >= 0 ? '+' : ''}${trade.returnPercent.toFixed(2)}%`
                                : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
