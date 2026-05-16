// =============================================================================
// Backtesting Engine — SMA Crossover + RSI Strategy
// =============================================================================

import type { OHLCCandle } from './coingecko'

export type TradeAction = 'BUY' | 'SELL'

export interface Trade {
  timestamp: number
  action: TradeAction
  price: number
  returnPercent: number | null // null on BUY, set on SELL
}

export interface BacktestResult {
  trades: Trade[]
  totalReturnPercent: number
  winRate: number
  maxDrawdown: number
  sharpeRatio: number
  tradeCount: number
  profitableTrades: number
}

// ---------------------------------------------------------------------------
// Indicator helpers
// ---------------------------------------------------------------------------

function sma(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null
    const slice = closes.slice(i - period + 1, i + 1)
    return slice.reduce((a, b) => a + b, 0) / period
  })
}

function rsi(closes: number[], period: number): (number | null)[] {
  const result: (number | null)[] = Array(period).fill(null)
  if (closes.length <= period) return result

  const gains: number[] = []
  const losses: number[] = []
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    gains.push(diff > 0 ? diff : 0)
    losses.push(diff < 0 ? Math.abs(diff) : 0)
  }

  let avgGain = gains.reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.reduce((a, b) => a + b, 0) / period

  const rsiValues: (number | null)[] = Array(period).fill(null)
  rsiValues.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? Math.abs(diff) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    rsiValues.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  }

  return rsiValues
}

function calcMaxDrawdown(equityCurve: number[]): number {
  let peak = equityCurve[0]
  let maxDD = 0
  for (const val of equityCurve) {
    if (val > peak) peak = val
    const dd = (peak - val) / peak
    if (dd > maxDD) maxDD = dd
  }
  return maxDD * 100
}

function calcSharpe(returns: number[]): number {
  if (returns.length < 2) return 0
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)
  if (stdDev === 0) return 0
  return (avg / stdDev) * Math.sqrt(252) // annualised
}

// ---------------------------------------------------------------------------
// SMA Crossover Strategy
// ---------------------------------------------------------------------------

export function runSMACrossover(
  data: OHLCCandle[],
  fastPeriod: number,
  slowPeriod: number
): BacktestResult {
  const closes = data.map((c) => c.close)
  const fastSMA = sma(closes, fastPeriod)
  const slowSMA = sma(closes, slowPeriod)

  const trades: Trade[] = []
  let inTrade = false
  let buyPrice = 0
  const tradeReturns: number[] = []
  const equityCurve: number[] = [1]
  let equity = 1

  for (let i = 1; i < data.length; i++) {
    const fast = fastSMA[i]
    const prevFast = fastSMA[i - 1]
    const slow = slowSMA[i]
    const prevSlow = slowSMA[i - 1]

    if (fast === null || prevFast === null || slow === null || prevSlow === null) {
      equityCurve.push(equity)
      continue
    }

    // Golden cross → BUY
    if (!inTrade && prevFast <= prevSlow && fast > slow) {
      buyPrice = data[i].close
      trades.push({ timestamp: data[i].timestamp, action: 'BUY', price: buyPrice, returnPercent: null })
      inTrade = true
    }
    // Death cross → SELL
    else if (inTrade && prevFast >= prevSlow && fast < slow) {
      const ret = ((data[i].close - buyPrice) / buyPrice) * 100
      trades.push({ timestamp: data[i].timestamp, action: 'SELL', price: data[i].close, returnPercent: ret })
      tradeReturns.push(ret)
      equity *= 1 + ret / 100
      inTrade = false
    }

    equityCurve.push(equity)
  }

  const totalReturnPercent = (equity - 1) * 100
  const profitableTrades = tradeReturns.filter((r) => r > 0).length
  const winRate = tradeReturns.length > 0 ? (profitableTrades / tradeReturns.length) * 100 : 0

  return {
    trades,
    totalReturnPercent,
    winRate,
    maxDrawdown: calcMaxDrawdown(equityCurve),
    sharpeRatio: calcSharpe(tradeReturns),
    tradeCount: tradeReturns.length,
    profitableTrades,
  }
}

// ---------------------------------------------------------------------------
// RSI Strategy
// ---------------------------------------------------------------------------

export function runRSIStrategy(
  data: OHLCCandle[],
  period: number,
  oversold: number,
  overbought: number
): BacktestResult {
  const closes = data.map((c) => c.close)
  const rsiValues = rsi(closes, period)

  const trades: Trade[] = []
  let inTrade = false
  let buyPrice = 0
  const tradeReturns: number[] = []
  const equityCurve: number[] = [1]
  let equity = 1

  for (let i = 1; i < data.length; i++) {
    const rsiVal = rsiValues[i]
    const prevRsi = rsiValues[i - 1]

    if (rsiVal === null || prevRsi === null) {
      equityCurve.push(equity)
      continue
    }

    // BUY when RSI crosses above oversold
    if (!inTrade && prevRsi <= oversold && rsiVal > oversold) {
      buyPrice = data[i].close
      trades.push({ timestamp: data[i].timestamp, action: 'BUY', price: buyPrice, returnPercent: null })
      inTrade = true
    }
    // SELL when RSI crosses above overbought
    else if (inTrade && prevRsi <= overbought && rsiVal > overbought) {
      const ret = ((data[i].close - buyPrice) / buyPrice) * 100
      trades.push({ timestamp: data[i].timestamp, action: 'SELL', price: data[i].close, returnPercent: ret })
      tradeReturns.push(ret)
      equity *= 1 + ret / 100
      inTrade = false
    }

    equityCurve.push(equity)
  }

  const totalReturnPercent = (equity - 1) * 100
  const profitableTrades = tradeReturns.filter((r) => r > 0).length
  const winRate = tradeReturns.length > 0 ? (profitableTrades / tradeReturns.length) * 100 : 0

  return {
    trades,
    totalReturnPercent,
    winRate,
    maxDrawdown: calcMaxDrawdown(equityCurve),
    sharpeRatio: calcSharpe(tradeReturns),
    tradeCount: tradeReturns.length,
    profitableTrades,
  }
}
