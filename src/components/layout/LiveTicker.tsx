'use client'

import { type Coin } from '@/types'
import { fmtPrice } from '@/lib/formatters'

const COINS = ['bitcoin','ethereum','elrond-erd-2','binancecoin','solana','cardano','polkadot','avalanche-2']
const SYMS:  Record<string,string> = {
  'bitcoin':'BTC','ethereum':'ETH','elrond-erd-2':'EGLD','binancecoin':'BNB',
  'solana':'SOL','cardano':'ADA','polkadot':'DOT','avalanche-2':'AVAX',
}

export function LiveTicker({ coins }: { coins: Coin[] }) {
  const items = COINS.map(id => ({ id, sym: SYMS[id], coin: coins.find(c => c.id === id) }))
  const doubled = [...items, ...items]

  return (
    <div className="ticker-wrap border-b py-2 text-xs" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4">
            <span className="font-semibold" style={{ color: 'var(--primary)' }}>{t.sym}</span>
            <span className="num font-medium">
              {t.coin ? fmtPrice(t.coin.current_price) : '—'}
            </span>
            {t.coin && (
              <span className="num" style={{ color: t.coin.price_change_percentage_24h >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {t.coin.price_change_percentage_24h >= 0 ? '+' : ''}{t.coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            )}
            <span style={{ color: 'var(--border)' }}>•</span>
          </span>
        ))}
      </div>
    </div>
  )
}
