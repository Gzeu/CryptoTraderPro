'use client'

import { useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePortfolioStore, type PortfolioEntry } from '@/store/portfolioStore'
import { useMarkets } from '@/hooks/useCoinGecko'
import { fmtPrice, fmtLarge, fmtPct } from '@/lib/formatters'
import { SkeletonKPI } from '@/components/ui/Skeleton'

export default function PortfolioPage() {
  const { entries, add, remove } = usePortfolioStore()
  const { coins, loading } = useMarkets({ refreshInterval: 60_000 })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ coinId: '', symbol: '', name: '', image: '', amount: '', buyPrice: '' })

  // Enrich entries with live prices
  const enriched = entries.map(e => {
    const live = coins.find(c => c.id === e.coinId)
    const currentValue = (live?.current_price ?? e.buyPrice) * e.amount
    const costBasis    = e.buyPrice * e.amount
    const pnl          = currentValue - costBasis
    const pnlPct       = costBasis > 0 ? (pnl / costBasis) * 100 : 0
    return { ...e, live, currentValue, costBasis, pnl, pnlPct }
  })

  const totalValue    = enriched.reduce((s, e) => s + e.currentValue, 0)
  const totalCost     = enriched.reduce((s, e) => s + e.costBasis, 0)
  const totalPnl      = totalValue - totalCost
  const totalPnlPct   = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const handleAdd = () => {
    if (!form.coinId || !form.amount || !form.buyPrice) return
    const coin = coins.find(c => c.id === form.coinId)
    const entry: PortfolioEntry = {
      coinId:   form.coinId,
      symbol:   coin?.symbol ?? form.symbol,
      name:     coin?.name   ?? form.coinId,
      image:    coin?.image  ?? '',
      amount:   parseFloat(form.amount),
      buyPrice: parseFloat(form.buyPrice),
      addedAt:  Date.now(),
    }
    add(entry)
    setForm({ coinId: '', symbol: '', name: '', image: '', amount: '', buyPrice: '' })
    setShowForm(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link href="/" className="text-sm flex items-center gap-1 mb-6 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
          ← Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-2xl">Portfolio</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{entries.length} position{entries.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Plus size={14} /> Add position
          </button>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {loading && !entries.length
            ? [0,1,2].map(i => <SkeletonKPI key={i} />)
            : [
                { label: 'Total Value',   value: fmtLarge(totalValue),                       icon: <Wallet size={14} /> },
                { label: 'Total Cost',    value: fmtLarge(totalCost),                        icon: <Wallet size={14} /> },
                { label: 'Total P&L',     value: `${totalPnl >= 0 ? '+' : ''}${fmtLarge(Math.abs(totalPnl))} (${fmtPct(totalPnlPct)})`, icon: totalPnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} /> },
              ].map((kpi, i) => (
                <div key={i} className="rounded-xl p-4 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-1.5 mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>{kpi.icon}{kpi.label}</div>
                  <p className="font-bold text-lg num">{kpi.value}</p>
                </div>
              ))
          }
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="rounded-xl border p-4 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-4">Add Position</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Coin ID (CoinGecko)</label>
                <input
                  placeholder="e.g. bitcoin, elrond-erd-2"
                  value={form.coinId}
                  onChange={e => setForm(f => ({ ...f, coinId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Amount</label>
                <input
                  type="number" min="0" step="any"
                  placeholder="0.5"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm num"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Avg Buy Price (USD)</label>
                <input
                  type="number" min="0" step="any"
                  placeholder="42000"
                  value={form.buyPrice}
                  onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm num"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Add</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Holdings Table */}
        {entries.length === 0
          ? (
              <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
                <Wallet size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No holdings yet</p>
                <p className="text-sm mt-1">Click "Add position" to track your crypto</p>
              </div>
            )
          : (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <div className="grid grid-cols-[1fr_6rem_6rem_6rem_7rem_3rem] gap-3 px-4 py-3 text-xs font-medium border-b"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                  <span>Asset</span>
                  <span className="text-right">Holdings</span>
                  <span className="text-right">Avg Buy</span>
                  <span className="text-right">Current</span>
                  <span className="text-right">P&L</span>
                  <span />
                </div>
                {enriched.map(e => (
                  <div key={e.coinId} className="grid grid-cols-[1fr_6rem_6rem_6rem_7rem_3rem] gap-3 px-4 py-3 border-b items-center" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                      {e.image && <img src={e.image} alt={e.name} width={24} height={24} className="rounded-full" loading="lazy" />}
                      <div>
                        <p className="font-semibold text-sm">{e.name}</p>
                        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{e.symbol}</p>
                      </div>
                    </div>
                    <p className="text-right text-sm num">{e.amount} <span className="text-xs uppercase" style={{ color: 'var(--text-faint)' }}>{e.symbol}</span></p>
                    <p className="text-right text-sm num">{fmtPrice(e.buyPrice)}</p>
                    <p className="text-right text-sm num">{e.live ? fmtPrice(e.live.current_price) : '—'}</p>
                    <div className="text-right">
                      <p className="text-sm num font-medium" style={{ color: e.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {e.pnl >= 0 ? '+' : ''}{fmtLarge(e.pnl)}
                      </p>
                      <p className="text-xs num" style={{ color: e.pnlPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {fmtPct(e.pnlPct)}
                      </p>
                    </div>
                    <button onClick={() => remove(e.coinId)} className="p-1 rounded hover:opacity-70 transition-opacity flex justify-center" style={{ color: 'var(--text-faint)' }} aria-label="Remove position">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )
        }
      </div>
    </div>
  )
}
