import axios from 'axios'

const BASE = 'https://api.coingecko.com/api/v3'
const client = axios.create({ baseURL: BASE, timeout: 10_000 })

export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number | null
  total_volume: number
  price_change_percentage_24h: number | null
  price_change_percentage_7d_in_currency?: number | null
  circulating_supply: number | null
  ath: number
  ath_change_percentage: number
  sparkline_in_7d?: { price: number[] }
}

export interface OHLCBar {
  time:  number
  open:  number
  high:  number
  low:   number
  close: number
}

export async function fetchMarkets(page = 1, perPage = 100): Promise<Coin[]> {
  const { data } = await client.get('/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page,
      sparkline: true,
      price_change_percentage: '7d',
    },
  })
  return data
}

export async function fetchCoinDetail(id: string) {
  const { data } = await client.get(`/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: false,
    },
  })
  return data
}

export async function fetchOHLC(id: string, days: string): Promise<OHLCBar[]> {
  const { data } = await client.get(`/coins/${id}/ohlc`, {
    params: { vs_currency: 'usd', days },
  })
  // CoinGecko returns [[timestamp, open, high, low, close], ...]
  return (data as number[][]).map(([time, open, high, low, close]) => ({
    time, open, high, low, close,
  }))
}

export async function fetchGlobal() {
  const { data } = await client.get('/global')
  return data.data
}

export async function searchCoins(query: string) {
  const { data } = await client.get('/search', { params: { query } })
  return data.coins as Array<{ id: string; name: string; symbol: string; thumb: string; market_cap_rank: number }>
}
