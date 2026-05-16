// =============================================================================
// CoinGecko API helpers — free tier, max 30 req/min
// =============================================================================

import axios from 'axios'

const BASE = 'https://api.coingecko.com/api/v3'

export const coinIdMap: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  EGLD: 'elrond-erd-2',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  DOT: 'polkadot',
}

export interface OHLCCandle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
}

export interface MarketChartPoint {
  timestamp: number
  price: number
}

/**
 * Fetch OHLC candlestick data for a coin.
 * CoinGecko returns array of [timestamp, open, high, low, close].
 */
export async function getOHLCData(coinId: string, days: number): Promise<OHLCCandle[]> {
  const response = await axios.get<number[][]>(`${BASE}/coins/${coinId}/ohlc`, {
    params: { vs_currency: 'usd', days },
  })
  return response.data.map(([timestamp, open, high, low, close]) => ({
    timestamp,
    open,
    high,
    low,
    close,
  }))
}

/**
 * Fetch price history for sparklines / area charts.
 */
export async function getMarketChart(coinId: string, days: number): Promise<MarketChartPoint[]> {
  const response = await axios.get<{ prices: number[][] }>(`${BASE}/coins/${coinId}/market_chart`, {
    params: { vs_currency: 'usd', days },
  })
  return response.data.prices.map(([timestamp, price]) => ({ timestamp, price }))
}

/**
 * Resolve ticker symbol (e.g. 'BTC') → CoinGecko coin ID.
 */
export function resolveCoinId(symbol: string): string {
  const id = coinIdMap[symbol.toUpperCase()]
  if (!id) throw new Error(`Unknown symbol: ${symbol}`)
  return id
}
