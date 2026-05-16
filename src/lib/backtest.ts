/**
 * backtest.ts — client-side SMA crossover backtesting engine
 *
 * Strategy: Buy when SMA(fast) crosses above SMA(slow); Sell when crosses below.
 * All calculations are pure functions — no side effects.
 */

export interface OHLCBar {
  ts: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Trade {
  type: 'buy' | 'sell'
  ts: number
  price: number
  equityAfter: number
}

export interface BacktestResult {
  trades: Trade[]
  equityCurve: Array<{ ts: number; equity: number; price: number }>
  totalReturnPct: number
  maxDrawdownPct: number
  sharpeRatio: number
  numTrades: number
  winRate: number
  finalEquity: number
  startPrice: number
  endPrice: number
  buyAndHoldReturnPct: number
}

export function calcSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null
    const slice = closes.slice(i - period + 1, i + 1)
    return slice.reduce((s, v) => s + v, 0) / period
  })
}

export function runBacktest(
  bars: OHLCBar[],
  fastPeriod = 20,
  slowPeriod = 50,
  initialCapital = 10_000
): BacktestResult {
  const closes = bars.map(b => b.close)
  const smaFast = calcSMA(closes, fastPeriod)
  const smaSlow = calcSMA(closes, slowPeriod)

  let cash = initialCapital
  let position = 0 // units held
  let inPosition = false
  const trades: Trade[] = []
  const equityCurve: BacktestResult['equityCurve'] = []
  const dailyReturns: number[] = []
  let prevEquity = initialCapital
  let peakEquity = initialCapital
  let maxDrawdown = 0

  for (let i = 1; i < bars.length; i++) {
    const bar = bars[i]
    const prevFast = smaFast[i - 1]
    const prevSlow = smaSlow[i - 1]
    const curFast = smaFast[i]
    const curSlow = smaSlow[i]

    if (curFast == null || curSlow == null || prevFast == null || prevSlow == null) {
      equityCurve.push({ ts: bar.ts, equity: cash, price: bar.close })
      continue
    }

    // Golden cross: fast crosses above slow → BUY
    if (!inPosition && prevFast <= prevSlow && curFast > curSlow) {
      position = cash / bar.close
      cash = 0
      inPosition = true
      const equity = position * bar.close
      trades.push({ type: 'buy', ts: bar.ts, price: bar.close, equityAfter: equity })
    }
    // Death cross: fast crosses below slow → SELL
    else if (inPosition && prevFast >= prevSlow && curFast < curSlow) {
      cash = position * bar.close
      position = 0
      inPosition = false
      trades.push({ type: 'sell', ts: bar.ts, price: bar.close, equityAfter: cash })
    }

    const currentEquity = inPosition ? position * bar.close : cash

    // Max drawdown
    if (currentEquity > peakEquity) peakEquity = currentEquity
    const dd = (peakEquity - currentEquity) / peakEquity
    if (dd > maxDrawdown) maxDrawdown = dd

    // Daily returns for Sharpe
    const ret = prevEquity > 0 ? (currentEquity - prevEquity) / prevEquity : 0
    dailyReturns.push(ret)
    prevEquity = currentEquity

    equityCurve.push({ ts: bar.ts, equity: parseFloat(currentEquity.toFixed(2)), price: bar.close })
  }

  // Close open position at last bar
  let finalEquity = inPosition ? position * bars.at(-1)!.close : cash

  const totalReturnPct = ((finalEquity - initialCapital) / initialCapital) * 100
  const startPrice = bars[0]?.close ?? 0
  const endPrice = bars.at(-1)?.close ?? 0
  const buyAndHoldReturnPct = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0

  // Sharpe (annualized, risk-free = 0, 365 trading days crypto)
  const meanReturn = dailyReturns.reduce((s, v) => s + v, 0) / (dailyReturns.length || 1)
  const stdReturn = Math.sqrt(dailyReturns.reduce((s, v) => s + (v - meanReturn) ** 2, 0) / (dailyReturns.length || 1))
  const sharpeRatio = stdReturn > 0 ? parseFloat(((meanReturn / stdReturn) * Math.sqrt(365)).toFixed(2)) : 0

  // Win rate: % of sell trades with profit vs the preceding buy
  const sellTrades = trades.filter(t => t.type === 'sell')
  const buyTrades = trades.filter(t => t.type === 'buy')
  let wins = 0
  sellTrades.forEach((sell, i) => {
    const buy = buyTrades[i]
    if (buy && sell.price > buy.price) wins++
  })
  const winRate = sellTrades.length > 0 ? (wins / sellTrades.length) * 100 : 0

  return {
    trades,
    equityCurve,
    totalReturnPct: parseFloat(totalReturnPct.toFixed(2)),
    maxDrawdownPct: parseFloat((maxDrawdown * 100).toFixed(2)),
    sharpeRatio,
    numTrades: trades.length,
    winRate: parseFloat(winRate.toFixed(1)),
    finalEquity: parseFloat(finalEquity.toFixed(2)),
    startPrice,
    endPrice,
    buyAndHoldReturnPct: parseFloat(buyAndHoldReturnPct.toFixed(2)),
  }
}
