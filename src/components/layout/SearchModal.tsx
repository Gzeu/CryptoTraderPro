'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react'
import { useMarketsQuery } from '@/hooks/useMarketsQuery'
import { fmtPrice, fmtPct } from '@/lib/formatters'
import { type Coin } from '@/lib/api/coingecko'

interface Props {
  open:    boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: Props) {
  const router = useRouter()
  const { data: coins = [] } = useMarketsQuery()
  const [query,   setQuery]   = useState('')
  const [cursor,  setCursor]  = useState(0)
  const inputRef  = useRef<HTMLInputElement>(null)
  const listRef   = useRef<HTMLUListElement>(null)

  const results: Coin[] = query.length < 1
    ? coins.slice(0, 8)   // show top 8 when empty
    : coins.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 12)

  useEffect(() => { if (open) { setQuery(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])
  useEffect(() => { setCursor(0) }, [query])

  const select = useCallback((coin: Coin) => {
    router.push(`/coin/${coin.id}`)
    onClose()
  }, [router, onClose])

  useEffect(() => {
    if (!open) return
    function kd(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
      if (e.key === 'Enter' && results[cursor]) select(results[cursor])
    }
    window.addEventListener('keydown', kd)
    return () => window.removeEventListener('keydown', kd)
  }, [open, cursor, results, select, onClose])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label="Global search"
    >
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search coins… (↑↓ navigate, Enter select)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text)' }}
          />
          <button onClick={onClose} className="p-1 rounded hover:opacity-60 transition-opacity" aria-label="Close">
            <X size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Results */}
        <ul ref={listRef} className="max-h-[360px] overflow-y-auto py-1" role="listbox">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No coins found</li>
          )}
          {results.map((coin, i) => {
            const up = (coin.price_change_percentage_24h ?? 0) >= 0
            return (
              <li key={coin.id} role="option" aria-selected={i === cursor}>
                <button
                  onClick={() => select(coin)}
                  onMouseEnter={() => setCursor(i)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{
                    background: i === cursor ? 'var(--surface-2)' : 'transparent',
                    color: 'var(--text)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coin.image} alt={coin.name} width={24} height={24} loading="lazy" className="rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{coin.name}</span>
                    <span className="ml-2 text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{coin.symbol}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium num">{fmtPrice(coin.current_price)}</p>
                    <p className={`text-xs num flex items-center justify-end gap-0.5 ${
                      up ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {up ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
                      {fmtPct(coin.price_change_percentage_24h ?? 0)}
                    </p>
                  </div>
                  <span className="text-xs w-6 text-right num" style={{ color: 'var(--text-faint)' }}>#{coin.market_cap_rank}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t flex items-center gap-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
          <span><kbd className="px-1 py-0.5 rounded" style={{ background: 'var(--surface-2)' }}>↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded" style={{ background: 'var(--surface-2)' }}>↵</kbd> open</span>
          <span><kbd className="px-1 py-0.5 rounded" style={{ background: 'var(--surface-2)' }}>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
