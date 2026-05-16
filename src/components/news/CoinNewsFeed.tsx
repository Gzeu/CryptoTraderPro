'use client'

/**
 * CoinNewsFeed
 * ─────────────
 * Wrapper used inside /coin/[id]/page.tsx.
 * Maps from Binance/display symbol → CryptoPanic currency code
 * and renders CryptoPanicFeed.
 */

import { CryptoPanicFeed } from './CryptoPanicFeed'

interface Props {
  /** Display symbol, e.g. 'BTC', 'EGLD', 'SOL' */
  symbol: string
  limit?: number
}

export function CoinNewsFeed({ symbol, limit = 10 }: Props) {
  // CryptoPanic uses standard uppercase ticker codes
  const currency = symbol.toUpperCase()
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <CryptoPanicFeed coinId={currency} limit={limit} />
    </div>
  )
}
