// CoinGecko API v3 — typed client
const BASE = 'https://api.coingecko.com/api/v3'
const KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY ?? ''

function headers(): HeadersInit {
  return KEY ? { 'x-cg-demo-api-key': KEY } : {}
}

export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  circulating_supply: number
  ath: number
  ath_change_percentage: number
  sparkline_in_7d?: { price: number[] }
}

export interface CoinDetail {
  id: string
  symbol: string
  name: string
  description: { en: string }
  image: { thumb: string; small: string; large: string }
  market_data: {
    current_price: { usd: number }
    market_cap: { usd: number }
    total_volume: { usd: number }
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    ath: { usd: number }
    atl: { usd: number }
  }
  links: { homepage: string[]; blockchain_site: string[] }
}

export interface OHLCBar {
  time: number   // Unix ms
  open: number
  high: number
  low: number
  close: number
}

export async function fetchMarkets(page = 1, perPage = 100): Promise<Coin[]> {
  const res = await fetch(
    `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h,7d`,
    { headers: headers(), next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function fetchCoinDetail(id: string): Promise<CoinDetail> {
  const res = await fetch(
    `${BASE}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,
    { headers: headers(), next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function fetchOHLC(id: string, days: 1 | 7 | 14 | 30 | 90 | 180 | 365 = 7): Promise<OHLCBar[]> {
  const res = await fetch(
    `${BASE}/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
    { headers: headers(), next: { revalidate: 300 } }
  )
  if (!res.ok) throw new Error(`CoinGecko OHLC ${res.status}`)
  const raw: number[][] = await res.json()
  return raw.map(([time, open, high, low, close]) => ({ time, open, high, low, close }))
}

export async function fetchGlobal() {
  const res = await fetch(`${BASE}/global`, { headers: headers(), next: { revalidate: 120 } })
  if (!res.ok) throw new Error('CoinGecko global failed')
  const { data } = await res.json()
  return data as {
    total_market_cap: Record<string, number>
    total_volume: Record<string, number>
    market_cap_percentage: Record<string, number>
    market_cap_change_percentage_24h_usd: number
  }
}

export async function searchCoins(query: string) {
  const res = await fetch(`${BASE}/search?query=${encodeURIComponent(query)}`, { headers: headers() })
  if (!res.ok) throw new Error('CoinGecko search failed')
  return res.json() as Promise<{ coins: { id: string; name: string; symbol: string; thumb: string }[] }>
}
