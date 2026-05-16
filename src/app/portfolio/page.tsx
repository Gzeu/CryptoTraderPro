'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Trash2, Plus, Download, TrendingUp, TrendingDown,
  BarChart2, PieChart, Radio,
} from 'lucide-react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { usePortfolioExport } from '@/hooks/usePortfolioExport'
import { usePortfolioLivePrices } from '@/hooks/usePortfolioLivePrices'
import { PortfolioPieChart, type PieSlice } from '@/components/charts/PortfolioPieChart'
import { useTheme } from '@/hooks/useTheme'
import { fmtPrice, fmtLarge, fmtPct } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

const COINS = [
  { id: 'bitcoin',       name: 'Bitcoin',   symbol: 'BTC'  },
  { id: 'ethereum',      name: 'Ethereum',  symbol: 'ETH'  },
  { id: 'elrond-erd-2',  name: 'EGLD',      symbol: 'EGLD' },
  { id: 'solana',        name: 'Solana',    symbol: 'SOL'  },
  { id: 'binancecoin',   name: 'BNB',       symbol: 'BNB'  },
  { id: 'cardano',       name: 'Cardano',   symbol: 'ADA'  },
  { id: 'ripple',        name: 'XRP',       symbol: 'XRP'  },
  { id: 'dogecoin',      name: 'Dogecoin',  symbol: 'DOGE' },
  { id: 'polkadot',      name: 'Polkadot',  symbol: 'DOT'  },
  { id: 'avalanche-2',   name: 'Avalanche', symbol: 'AVAX' },
  { id: 'chainlink',     name: 'Chainlink', symbol: 'LINK' },
  { id: 'litecoin',      name: 'Litecoin',  symbol: 'LTC'  },
]

type ViewMode = 'table' | 'chart'

export default function PortfolioPage() {
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'
  const { entries, addEntry, removeEntry } = usePortfolioStore()
  const { exportCsv, loading: exportLoading } = usePortfolioExport()

  const [coinId,   setCoinId]   = useState(COINS[0].id)
  const [amount,   setAmount]   = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [view,     setView]     = useState<ViewMode>('table')

  // ── REST fallback prices (CoinGecko) ───────────────────────────────────
  const heldIds = [...new Set(entries.map(e => e.coinId))]
  const { data: restPrices, isLoading: restLoading } = useQuery({
    queryKey: ['portfolio-prices', heldIds.join(',')],
    queryFn: async () => {
      if (heldIds.length === 0) return {} as Record<string, number>
      const res  = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${heldIds.join(',')}&vs_currencies=usd`,
      )
      const data = await res.json() as Record<string, { usd: number }>
      return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.usd]))
    },
    enabled: heldIds.length > 0,
    staleTime: 60_000,       // REST refreshes only if WS goes down
    refetchInterval: 60_000,
  })

  // ── Live WS prices (Binance) — primary source ──────────────────────
  const {
    rows,
    totalCost,
    totalValue,
    totalPnl,
    totalPnlPct,
    anyLive,
  } = usePortfolioLivePrices(restPrices, restLoading)

  // Still loading if no WS data yet AND REST hasn't returned
  const pricesLoading = restLoading && !anyLive

  function handleAdd() {
    const a = parseFloat(amount)
    const p = parseFloat(buyPrice)
    if (isNaN(a) || isNaN(p) || a <= 0 || p <= 0) return
    const coin = COINS.find(c => c.id === coinId)!
    addEntry({ coinId, coinName: coin.name, amount: a, buyPrice: p })
    setAmount(''); setBuyPrice(''); setShowForm(false)
  }

  // ── Pie chart data ─────────────────────────────────────────────
  const pieData = useMemo<PieSlice[]>(() => {
    const grouped = rows.reduce<Record<string, { name: string; value: number }>>(
      (acc, r) => {
        if (!acc[r.coinId]) acc[r.coinId] = { name: r.coinName, value: 0 }
        acc[r.coinId].value += r.value
        return acc
      },
      {},
    )
    return Object.entries(grouped)
      .map(([, { name, value }]) => ({
        name,
        value,
        pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [rows, totalValue])

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Dashboard
          </Link>
          <span className="font-bold">Portfolio</span>

          {/* Live indicator */}
          {anyLive && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--color-success)' }}
            >
              <Radio size={11} className="animate-pulse" /> Live
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {entries.length > 0 && (
              <>
                {/* View toggle */}
                <div
                  className="flex gap-0.5 rounded-lg p-0.5"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  {(['table', 'chart'] as ViewMode[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                      style={
                        view === v
                          ? { background: 'var(--color-surface)', color: 'var(--color-text)', boxShadow: 'var(--shadow-sm)' }
                          : { color: 'var(--color-text-muted)' }
                      }
                    >
                      {v === 'table' ? <BarChart2 size={12} /> : <PieChart size={12} />}
                      {v === 'table' ? 'Table' : 'Chart'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={exportCsv}
                  disabled={exportLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  <Download size={13} />
                  {exportLoading ? 'Exporting…' : 'Export CSV'}
                </button>
              </>
            )}

            <Link
              href="/compare"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-opacity hover:opacity-80"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              <BarChart2 size={13} /> Compare
            </Link>

            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Add form */}
        {showForm && (
          <div
            className="rounded-xl border p-4 space-y-3"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="font-semibold text-sm">Add Position</h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Coin</label>
                <select
                  value={coinId}
                  onChange={e => setCoinId(e.target.value)}
                  className="px-3 py-2 rounded-lg border text-sm"
                  style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  {COINS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Amount</label>
                <input
                  type="number" min="0" step="any" placeholder="0.5"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  className="px-3 py-2 rounded-lg border text-sm w-32 tabular-nums"
                  style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Buy price (USD)</label>
                <input
                  type="number" min="0" step="any" placeholder="42000"
                  value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                  className="px-3 py-2 rounded-lg border text-sm w-36 tabular-nums"
                  style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Totals */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Cost',  val: fmtLarge(totalCost) },
              { label: 'Total Value', val: fmtLarge(totalValue) },
              {
                label: 'Total P&L',
                val: `${totalPnl >= 0 ? '+' : ''}${fmtLarge(totalPnl)}`,
                color: totalPnl >= 0 ? 'var(--color-success)' : 'var(--color-error)',
              },
              {
                label: 'P&L %',
                val: fmtPct(totalPnlPct),
                color: totalPnlPct >= 0 ? 'var(--color-success)' : 'var(--color-error)',
              },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="rounded-xl border p-3"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                <p
                  className="font-semibold text-sm tabular-nums"
                  style={color ? { color } : {}}
                >
                  {val}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {entries.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <TrendingUp size={36} style={{ color: 'var(--color-text-faint)' }} />
            <p className="font-medium">No positions yet</p>
            <p className="text-xs">Click <strong>+ Add</strong> to track your first coin</p>
          </div>

        ) : view === 'chart' ? (
          /* Pie chart view */
          <div
            className="rounded-xl border p-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="font-semibold text-sm mb-4">Allocation by Current Value</h2>
            {pricesLoading
              ? <Skeleton style={{ height: 300, borderRadius: 8 }} />
              : <PortfolioPieChart data={pieData} isDark={isDark} height={300} />
            }
          </div>

        ) : (
          /* Table view with live indicators */
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['', 'Coin', 'Amount', 'Buy Price', 'Current', 'Cost', 'Value', 'P&L', 'P&L %', ''].map((h, i) => (
                      <th
                        key={i}
                        className="px-4 py-2.5 text-left font-medium text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr
                      key={r.id}
                      className="border-t transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: 'var(--color-divider)' }}
                    >
                      {/* Live dot */}
                      <td className="pl-4 pr-1 py-2.5 w-5">
                        <span
                          title={r.isLive ? 'Live price (Binance WS)' : 'REST price (CoinGecko)'}
                          className="block w-2 h-2 rounded-full transition-colors"
                          style={{
                            background: r.isLive
                              ? 'var(--color-success)'
                              : 'var(--color-text-faint)',
                            boxShadow: r.isLive
                              ? '0 0 6px var(--color-success)'
                              : 'none',
                          }}
                        />
                      </td>

                      <td className="px-4 py-2.5 font-medium">
                        <Link
                          href={`/coin/${r.coinId}`}
                          className="hover:underline"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {r.coinName}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">{r.amount}</td>
                      <td className="px-4 py-2.5 tabular-nums">{fmtPrice(r.buyPrice)}</td>
                      <td className="px-4 py-2.5 tabular-nums font-medium">
                        {pricesLoading && !r.isLive ? '…' : fmtPrice(r.currentPrice)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">{fmtLarge(r.cost)}</td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {pricesLoading && !r.isLive ? '…' : fmtLarge(r.value)}
                      </td>
                      <td
                        className="px-4 py-2.5 tabular-nums font-medium"
                        style={{ color: r.pnl >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}
                      >
                        {pricesLoading && !r.isLive
                          ? '…'
                          : `${r.pnl >= 0 ? '+' : ''}${fmtLarge(r.pnl)}`
                        }
                      </td>
                      <td
                        className="px-4 py-2.5 tabular-nums"
                        style={{ color: r.pnlPct >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}
                      >
                        {pricesLoading && !r.isLive ? '…' : (
                          <span className="flex items-center gap-1">
                            {r.pnlPct >= 0
                              ? <TrendingUp size={12} />
                              : <TrendingDown size={12} />
                            }
                            {fmtPct(r.pnlPct)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => removeEntry(r.id)}
                          className="p-1 rounded hover:opacity-60 transition-opacity"
                          style={{ color: 'var(--color-text-faint)' }}
                          aria-label="Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div
              className="px-4 py-2 border-t flex items-center gap-4 text-xs"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--color-success)', boxShadow: '0 0 6px var(--color-success)' }}
                />
                Binance WebSocket (live)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-text-faint)' }} />
                CoinGecko REST (60s)
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
