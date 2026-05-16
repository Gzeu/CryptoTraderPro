'use client'

import { CryptoPanicFeed } from '@/components/news/CryptoPanicFeed'

// Map CoinGecko IDs → CryptoPanic currency codes
const CG_TO_CRYPTOPANIC: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  'elrond-erd-2': 'EGLD',
  solana: 'SOL',
  cardano: 'ADA',
  'binancecoin': 'BNB',
  'matic-network': 'MATIC',
  polkadot: 'DOT',
  avalanche: 'AVAX',
  chainlink: 'LINK',
  uniswap: 'UNI',
  litecoin: 'LTC',
  ripple: 'XRP',
  dogecoin: 'DOGE',
  'shiba-inu': 'SHIB',
}

export function NewsSection({ coinId }: { coinId: string }) {
  const currency = CG_TO_CRYPTOPANIC[coinId] ?? coinId.toUpperCase().split('-')[0]
  return <CryptoPanicFeed coinId={currency} limit={12} />
}
