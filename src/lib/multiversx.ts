// =============================================================================
// MultiversX API utilities
// =============================================================================

import axios from 'axios'

const MVX_API = 'https://api.multiversx.com'
const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const EGLD_DENOMINATION = BigInt('1000000000000000000') // 10^18

export interface EgldEconomics {
  totalSupply: number
  circulatingSupply: number
  staked: number
  price: number
  marketCap: number
  apr: number
  topUpApr: number
  baseApr: number
}

export interface WalletInfo {
  address: string
  balance: number // in EGLD (already converted)
  nonce: number
  txCount: number
}

export interface EgldPricePoint {
  timestamp: number
  price: number
}

export async function fetchEgldEconomics(): Promise<EgldEconomics> {
  const { data } = await axios.get<EgldEconomics>(`${MVX_API}/economics`)
  return data
}

export async function fetchEgldPrice(): Promise<number> {
  const economics = await fetchEgldEconomics()
  return economics.price
}

export async function fetchWalletBalance(address: string): Promise<WalletInfo> {
  const { data } = await axios.get<{ address: string; balance: string; nonce: number; txCount: number }>(
    `${MVX_API}/accounts/${address}`
  )
  const balanceEgld = Number(BigInt(data.balance) * BigInt(1e6) / EGLD_DENOMINATION) / 1e6
  return {
    address: data.address,
    balance: balanceEgld,
    nonce: data.nonce,
    txCount: data.txCount,
  }
}

export async function fetchEgldPriceHistory(days: number): Promise<EgldPricePoint[]> {
  const { data } = await axios.get<{ prices: [number, number][] }>(
    `${COINGECKO_API}/coins/elrond-erd-2/market_chart`,
    { params: { vs_currency: 'usd', days } }
  )
  return data.prices.map(([timestamp, price]) => ({ timestamp, price }))
}

export const MVX_ADDRESS_REGEX = /^erd1[a-z0-9]{58}$/

export function validateMvxAddress(address: string): boolean {
  return MVX_ADDRESS_REGEX.test(address)
}

export function formatEgld(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount)
}
