'use client'

import { useMemo } from 'react'
import { type OHLCBar } from '@/lib/api/coingecko'

export type Strategy = 'sma_cross' | 'rsi_oversold' | 'buy_hold'

export interface Trade {
  entryTime:  number
  exitTime:   number
  entryPrice: number
  exitPrice:  number
  pnlPct:     number
  type:       'long'
}

export interface BacktestResult {
  trades:        Trade[]
  totalReturn:   number   // %
  winRate:       number   // %
  maxDrawdown:   number   // %
  sharpe:        number
  totalTrades:   number
  equityCurve:   { time: number; equity: number }[]
}

// --- Indicators ---
function sma(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) =>
    i < period - 1 ? null : prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
  )
}

function rsi(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(period).fill(null)
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff; else losses -= diff
  }
  let avgGain = gains / period
  let avgLoss = losses / period
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  }
  return result
}

// --- Strategy runners ---
function runSMACross(bars: OHLCBar[], fast = 9, slow = 21): Trade[] {
  const closes = bars.map(b => b.close)
  const fastMA = sma(closes, fast)
  const slowMA = sma(closes, slow)
  const trades: Trade[] = []
  let entry: { price: number; time: number } | null = null

  for (let i = 1; i < bars.length; i++) {
    const pf = fastMA[i - 1], ps = slowMA[i - 1]
    const cf = fastMA[i],     cs = slowMA[i]
    if (pf === null || ps === null || cf === null || cs === null) continue

    if (pf <= ps && cf > cs && !entry) {
      entry = { price: bars[i].close, time: bars[i].time }
    } else if (pf >= ps && cf < cs && entry) {
      const exitPrice = bars[i].close
      trades.push({
        entryTime: entry.time, exitTime: bars[i].time,
        entryPrice: entry.price, exitPrice,
        pnlPct: ((exitPrice - entry.price) / entry.price) * 100,
        type: 'long',
      })
      entry = null
    }
  }
  // close open position at end
  if (entry && bars.length > 0) {
    const last = bars[bars.length - 1]
    trades.push({
      entryTime: entry.time, exitTime: last.time,
      entryPrice: entry.price, exitPrice: last.close,
      pnlPct: ((last.close - entry.price) / entry.price) * 100,
      type: 'long',
    })
  }
  return trades
}

function runRSIOversold(bars: OHLCBar[], oversold = 30, overbought = 70): Trade[] {
  const closes = bars.map(b => b.close)
  const rsiVals = rsi(closes)
  const trades: Trade[] = []
  let entry: { price: number; time: number } | null = null

  for (let i = 1; i < bars.length; i++) {
    const prev = rsiVals[i - 1], curr = rsiVals[i]
    if (prev === null || curr === null) continue

    if (prev < oversold && curr >= oversold && !entry) {
      entry = { price: bars[i].close, time: bars[i].time }
    } else if (prev < overbought && curr >= overbought && entry) {
      const exitPrice = bars[i].close
      trades.push({
        entryTime: entry.time, exitTime: bars[i].time,
        entryPrice: entry.price, exitPrice,
        pnlPct: ((exitPrice - entry.price) / entry.price) * 100,
        type: 'long',
      })
      entry = null
    }
  }
  if (entry && bars.length > 0) {
    const last = bars[bars.length - 1]
    trades.push({
      entryTime: entry.time, exitTime: last.time,
      entryPrice: entry.price, exitPrice: last.close,
      pnlPct: ((last.close - entry.price) / entry.price) * 100,
      type: 'long',
    })
  }
  return trades
}

function runBuyHold(bars: OHLCBar[]): Trade[] {
  if (bars.length < 2) return []
  const first = bars[0], last = bars[bars.length - 1]
  return [{
    entryTime: first.time, exitTime: last.time,
    entryPrice: first.close, exitPrice: last.close,
    pnlPct: ((last.close - first.close) / first.close) * 100,
    type: 'long',
  }]
}

// --- Stats ---
function calcStats(trades: Trade[], bars: OHLCBar[]): BacktestResult {
  const totalTrades = trades.length
  if (!totalTrades || !bars.length) {
    return { trades: [], totalReturn: 0, winRate: 0, maxDrawdown: 0, sharpe: 0, totalTrades: 0, equityCurve: [] }
  }

  const winners = trades.filter(t => t.pnlPct > 0).length
  const winRate = (winners / totalTrades) * 100

  // Compound total return
  let equity = 100
  const equityPoints: { time: number; equity: number }[] = []
  for (const t of trades) {
    equity *= (1 + t.pnlPct / 100)
    equityPoints.push({ time: t.exitTime, equity: parseFloat(equity.toFixed(2)) })
  }
  const totalReturn = equity - 100

  // Max drawdown on equity curve
  let peak = 100, maxDD = 0
  for (const p of equityPoints) {
    if (p.equity > peak) peak = p.equity
    const dd = (peak - p.equity) / peak * 100
    if (dd > maxDD) maxDD = dd
  }

  // Sharpe (simplified, daily returns)
  const returns = trades.map(t => t.pnlPct / 100)
  const meanR = returns.reduce((a, b) => a + b, 0) / returns.length
  const stdR  = Math.sqrt(returns.map(r => Math.pow(r - meanR, 2)).reduce((a, b) => a + b, 0) / returns.length)
  const sharpe = stdR > 0 ? (meanR / stdR) * Math.sqrt(252) : 0

  return {
    trades,
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    winRate:     parseFloat(winRate.toFixed(1)),
    maxDrawdown: parseFloat(maxDD.toFixed(2)),
    sharpe:      parseFloat(sharpe.toFixed(2)),
    totalTrades,
    equityCurve: equityPoints,
  }
}

/**
 * Run a backtest strategy on OHLC bars.
 * Returns memoized result — only recomputes when bars or strategy change.
 */
export function useBacktest(bars: OHLCBar[], strategy: Strategy): BacktestResult {
  return useMemo(() => {
    if (!bars.length) return calcStats([], bars)
    const trades =
      strategy === 'sma_cross'    ? runSMACross(bars) :
      strategy === 'rsi_oversold' ? runRSIOversold(bars) :
      runBuyHold(bars)
    return calcStats(trades, bars)
  }, [bars, strategy])
}
