import axios, { type AxiosError } from 'axios'

const BASE = 'https://api.coingecko.com/api/v3'

export const client = axios.create({ baseURL: BASE, timeout: 12_000 })

// --- Rate-limit retry interceptor (HTTP 429) ---
const MAX_RETRIES = 3
client.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const config = error.config as (typeof error.config & { _retryCount?: number })
    if (!config) return Promise.reject(error)

    config._retryCount = config._retryCount ?? 0

    if (error.response?.status === 429 && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1
      const delay = Math.pow(2, config._retryCount) * 500   // 1s, 2s, 4s
      await new Promise(r => setTimeout(r, delay))
      return client(config)
    }

    return Promise.reject(error)
  },
)

// --- Types ---
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

// --- Endpoints ---
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
  return data.coins as Array<{
    id: string; name: string; symbol: string; thumb: string; market_cap_rank: number
  }>
}
