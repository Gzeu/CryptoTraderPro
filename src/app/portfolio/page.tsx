'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Download, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useMarketsQuery } from '@/hooks/useMarketsQuery'
import { useLivePrices } from '@/hooks/useLivePrice'
import { fmtPrice, fmtLarge, fmtPct } from '@/lib/formatters'
import { EmptyState } from '@/components/ui/EmptyState'
import { buildPortfolioCsv, downloadCsv, type PortfolioRow } from '@/lib/exportCsv'
import { ExportButton } from '@/components/portfolio/ExportButton'

// Map coinId (CoinGecko) → Binance WS symbol
function toWsSymbol(coinId: string): string {
  const map: Record<string, string> = {
    bitcoin:      'BTCUSDT',
    ethereum:     'ETHUSDT',
    'elrond-erd-2': 'EGLDUSDT',
    solana:       'SOLUSDT',
    binancecoin:  'BNBUSDT',
    cardano:      'ADAUSDT',
    ripple:       'XRPUSDT',
    dogecoin:     'DOGEUSDT',
    polkadot:     'DOTUSDT',
    litecoin:     'LTCUSDT',
    avalanche:    'AVAXUSDT',
    chainlink:    'LINKUSDT',
    uniswap:      'UNIUSDT',
    stellar:      'XLMUSDT',
    cosmos:       'ATOMUSDT',
  }
  return map[coinId.toLowerCase()] ?? `${coinId.toUpperCase()}USDT`
}

export default function PortfolioPage() {
  const { entries, addEntry, removeEntry } = usePortfolioStore()
  const { data: coins = [] }              = useMarketsQuery()

  // Build WS symbols for all portfolio entries
  const wsSymbols = entries.map(e => toWsSymbol(e.coinId))
  const { priceMap, isLive } = useLivePrices(wsSymbols)

  const [coinId,   setCoinId]   = useState('')
  const [coinName, setCoinName] = useState('')
  const [amount,   setAmount]   = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [error,    setError]    = useState('')

  // Build enriched rows — prefer WS live price, fall back to CoinGecko snapshot
  const rows: PortfolioRow[] = entries.map(e => {
    const wsKey        = toWsSymbol(e.coinId)
    const livePrice    = priceMap.get(wsKey)?.price
    const snapshot     = coins.find(c => c.id === e.coinId)?.current_price
    const currentPrice = livePrice ?? snapshot ?? e.buyPrice
    const costBasis    = e.amount * e.buyPrice
    const currentValue = e.amount * currentPrice
    const pnlUsd       = currentValue - costBasis
    const pnlPct       = costBasis > 0 ? (pnlUsd / costBasis) * 100 : 0
    return { ...e, currentPrice, costBasis, currentValue, pnlUsd, pnlPct }
  })

  const totalCost   = rows.reduce((s, r) => s + r.costBasis, 0)
  const totalValue  = rows.reduce((s, r) => s + r.currentValue, 0)
  const totalPnlUsd = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnlUsd / totalCost) * 100 : 0

  function handleAdd() {
    const amt = parseFloat(amount)
    const bp  = parseFloat(buyPrice)
    if (!coinId.trim() || isNaN(amt) || amt <= 0 || isNaN(bp) || bp <= 0) {
      setError('Fill in all fields with valid positive numbers.')
      return
    }
    const name = coinName.trim() || coinId.trim()
    addEntry({ coinId: coinId.trim().toLowerCase(), coinName: name, amount: amt, buyPrice: bp })
    setCoinId(''); setCoinName(''); setAmount(''); setBuyPrice(''); setError('')
  }

  function handleExportCsv() {
    const csv  = buildPortfolioCsv(rows)
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(csv, `portfolio-${date}.csv`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Page header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" aria-label="Back">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold flex-1">Portfolio</h1>

          {/* Live indicator */}
          {entries.length > 0 && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLive ? 'animate-pulse' : 'opacity-30'}`}
                style={{ background: isLive ? 'var(--success)' : 'var(--text-faint)' }}
              />
              {isLive ? 'Live' : 'Connecting…'}
            </span>
          )}

          {/* Export button — uses ExportButton component (WS-aware) */}
          {rows.length > 0 && (
            <ExportButton />
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Summary KPIs */}
        {rows.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Cost Basis',    val: fmtPrice(totalCost) },
              { label: 'Current Value', val: fmtPrice(totalValue) },
              {
                label: 'Total P&L',
                val:   `${totalPnlUsd >= 0 ? '+' : ''}${fmtPrice(totalPnlUsd)} (${fmtPct(totalPnlPct)})`,
                color: totalPnlUsd >= 0 ? 'var(--success)' : 'var(--error)',
              },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-4 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
                <p className="font-bold text-sm num" style={k.color ? { color: k.color } : {}}>{k.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add position form */}
        <div className="rounded-xl border p-4 space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Plus size={14} style={{ color: 'var(--primary)' }} /> Add Position
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Coin ID',     val: coinId,   set: setCoinId,   ph: 'bitcoin',  type: 'text'   },
              { label: 'Name',        val: coinName, set: setCoinName, ph: 'Bitcoin',   type: 'text'   },
              { label: 'Amount',      val: amount,   set: setAmount,   ph: '0.5',       type: 'number' },
              { label: 'Buy Price $', val: buyPrice, set: setBuyPrice, ph: '65000',     type: 'number' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                <input
                  type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  min={f.type === 'number' ? '0' : undefined}
                  step={f.type === 'number' ? 'any' : undefined}
                  className="w-full px-3 py-2 rounded-lg border text-sm num"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            ))}
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            Add Position
          </button>
        </div>

        {/* Positions table */}
        {rows.length === 0
          ? <EmptyState variant="portfolio" />
          : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div
                className="grid grid-cols-[1fr_4rem_4rem_8rem_5rem_5rem_2rem] gap-2 px-4 py-2.5 text-xs font-medium border-b"
                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <span>Coin</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Buy $</span>
                <span className="text-right">Live $</span>
                <span className="text-right">Value</span>
                <span className="text-right">P&L</span>
                <span />
              </div>

              {rows.map(r => {
                const wsKey    = toWsSymbol(r.coinId)
                const wsSymbol = wsKey
                return (
                  <div
                    key={r.id}
                    className="grid grid-cols-[1fr_4rem_4rem_8rem_5rem_5rem_2rem] gap-2 px-4 py-3 border-b last:border-0 items-center text-sm"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div>
                      <p className="font-medium">{r.coinName}</p>
                      <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{r.coinId}</p>
                    </div>

                    <span className="text-right num text-xs">{r.amount}</span>
                    <span className="text-right num text-xs">{fmtPrice(r.buyPrice)}</span>

                    {/* 🔴 Live price cell — WS badge (no %change in table, saves space) */}
                    <div className="flex justify-end">
                      <LivePriceBadge symbol={wsSymbol} showChange={false} className="text-xs" />
                    </div>

                    <span className="text-right num text-xs font-medium">{fmtPrice(r.currentValue)}</span>

                    <span
                      className="text-right num text-xs font-semibold flex items-center justify-end gap-0.5"
                      style={{ color: r.pnlPct >= 0 ? 'var(--success)' : 'var(--error)' }}
                    >
                      {r.pnlPct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {fmtPct(r.pnlPct)}
                    </span>

                    <button
                      onClick={() => removeEntry(r.id)}
                      className="flex justify-center p-1 rounded hover:opacity-60 transition-opacity"
                      style={{ color: 'var(--text-faint)' }}
                      aria-label="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )
        }
      </main>
    </div>
  )
}
