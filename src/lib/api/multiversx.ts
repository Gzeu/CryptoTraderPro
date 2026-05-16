// =============================================================================
// MultiversX / EGLD native API
// Docs: https://api.multiversx.com
// =============================================================================

const BASE = 'https://api.multiversx.com'

export interface EgldEconomics {
  totalSupply:          number
  circulatingSupply:    number
  staked:               number
  price:                number
  marketCap:            number
  apr:                  number
  topUpApr:             number
  baseApr:              number
  tokenMarketCap:       number | null
}

export interface EgldStats {
  accounts:             number
  blocks:               number
  epoch:                number
  transactions:         number
  scResults:            number
  refreshRate:          number
}

export interface EgldToken {
  identifier:           string
  name:                 string
  ticker:               string
  owner:                string
  decimals:             number
  isPaused:             boolean
  price:                number | null
  marketCap:            number | null
  volume24h:            number | null
  circulatingSupply:    string
  transactions:         number
}

export interface EgldNft {
  identifier:           string
  collection:           string
  name:                 string
  type:                 string
  url:                  string | null
  thumbnailUrl:         string | null
  rarities?:            Record<string, unknown>
}

export interface EgldAccountSummary {
  address:              string
  balance:              string  // raw denomination (10^18)
  nonce:                number
  txCount:              number
  scrCount:             number
  username:             string | null
  shard:                number
  developerReward:      string
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error(`MultiversX API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// ---- Economics & Stats ----
export const fetchEgldEconomics = () => get<EgldEconomics>('/economics')
export const fetchEgldStats     = () => get<EgldStats>('/stats')

// ---- ESDT Tokens ----
export const fetchEgldTokens = (size = 25, from = 0) =>
  get<EgldToken[]>(`/tokens?size=${size}&from=${from}&sort=marketCap&order=desc`)

export const fetchEgldToken = (identifier: string) =>
  get<EgldToken>(`/tokens/${identifier}`)

// ---- Account ----
export const fetchEgldAccount = (address: string) =>
  get<EgldAccountSummary>(`/accounts/${address}`)

export const fetchEgldAccountTokens = (address: string, size = 50) =>
  get<EgldToken[]>(`/accounts/${address}/tokens?size=${size}`)

export const fetchEgldAccountNfts = (address: string, size = 50) =>
  get<EgldNft[]>(`/accounts/${address}/nfts?size=${size}`)

// ---- NFT Collections ----
export const fetchEgldNftCollections = (size = 25) =>
  get<{ collection: string; name: string; type: string }[]>(
    `/collections?size=${size}&sort=holderCount&order=desc`,
  )

// ---- Price history (CoinGecko fallback for EGLD) ----
export async function fetchEgldPriceHistory(days: number): Promise<[number, number][]> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/elrond-erd-2/market_chart?vs_currency=usd&days=${days}`,
    { next: { revalidate: 300 } },
  )
  if (!res.ok) throw new Error('EGLD price history fetch failed')
  const data = await res.json() as { prices: [number, number][] }
  return data.prices
}

// ---- Denomination helper ----
export function fromDenomination(raw: string | number, decimals = 18): number {
  return Number(raw) / Math.pow(10, decimals)
}
