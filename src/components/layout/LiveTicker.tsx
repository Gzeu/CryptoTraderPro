'use client'

import { useEffect, useRef, useState } from 'react'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TickerItem {
  symbol: string
  price: string
  change: number
}

const INITIAL_TICKER: TickerItem[] = [
  { symbol: 'BTC', price: '...', change: 0 },
  { symbol: 'ETH', price: '...', change: 0 },
  { symbol: 'EGLD', price: '...', change: 0 },
  { symbol: 'BNB', price: '...', change: 0 },
  { symbol: 'SOL', price: '...', change: 0 },
  { symbol: 'ADA', price: '...', change: 0 },
  { symbol: 'DOT', price: '...', change: 0 },
  { symbol: 'AVAX', price: '...', change: 0 },
]

export function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(INITIAL_TICKER)
  const fetchedRef = useRef(false)

  useEffect(() => {
    const EGLD_ID = 'elrond-erd-2'
    const IDS = 'bitcoin,ethereum,elrond-erd-2,binancecoin,solana,cardano,polkadot,avalanche-2'

    const fetch_prices = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${IDS}&vs_currencies=usd&include_24hr_change=true`,
          { next: { revalidate: 0 } }
        )
        if (!res.ok) return
        const data = await res.json()
        const map: Record<string, string> = {
          bitcoin: 'BTC', ethereum: 'ETH', [EGLD_ID]: 'EGLD',
          binancecoin: 'BNB', solana: 'SOL', cardano: 'ADA',
          polkadot: 'DOT', 'avalanche-2': 'AVAX',
        }
        setItems(
          Object.entries(data).map(([id, v]: [string, any]) => ({
            symbol: map[id] ?? id.toUpperCase(),
            price: v.usd < 1 ? v.usd.toFixed(4) : v.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: +(v.usd_24h_change ?? 0).toFixed(2),
          }))
        )
      } catch {}
    }

    if (!fetchedRef.current) { fetchedRef.current = true; fetch_prices() }
    const id = setInterval(fetch_prices, 30000)
    return () => clearInterval(id)
  }, [])

  // Duplicate for seamless loop
  const tickerItems = [...items, ...items]

  return (
    <div className="overflow-hidden border-t bg-muted/20 py-1.5 text-xs">
      <div className="ticker-track flex gap-8 whitespace-nowrap">
        {tickerItems.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{item.symbol}</span>
            <span className="font-mono text-foreground/80">${item.price}</span>
            <span className={cn(
              'inline-flex items-center gap-0.5',
              item.change >= 0 ? 'text-[hsl(var(--bullish))]' : 'text-[hsl(var(--bearish))]'
            )}>
              {item.change >= 0
                ? <TrendingUpIcon className="h-2.5 w-2.5" />
                : <TrendingDownIcon className="h-2.5 w-2.5" />}
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
