'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, Activity, Users, Layers, Zap, Search } from 'lucide-react'
import {
  fetchEgldEconomics, fetchEgldStats, fetchEgldTokens,
  type EgldToken,
} from '@/lib/api/multiversx'
import { useLivePrice } from '@/hooks/useLivePrice'
import { fmtPrice, fmtLarge, fmtPct } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border p-4 flex items-start gap-3"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <span className="mt-0.5" style={{ color: accent ?? 'var(--color-primary)' }}>{icon}</span>
      <div>
        <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        <p className="font-semibold tabular-nums text-sm">{value}</p>
      </div>
    </div>
  )
}

export default function EgldPage() {
  const router  = useRouter()
  const [query, setQuery] = useState('')

  const { data: eco,    isLoading: ecoLoading    } = useQuery({ queryKey: ['egld-eco'],    queryFn: fetchEgldEconomics,           staleTime: 60_000 })
  const { data: stats,  isLoading: statsLoading  } = useQuery({ queryKey: ['egld-stats'],  queryFn: fetchEgldStats,               staleTime: 60_000 })
  const { data: tokens, isLoading: tokensLoading } = useQuery({ queryKey: ['egld-tokens'], queryFn: () => fetchEgldTokens(20, 0), staleTime: 60_000 })

  const { price: livePrice, priceChangePercent: livePct, isLive } = useLivePrice('EGLDUSDT')

  const price     = livePrice ?? eco?.price ?? 0
  const change24h = livePct   ?? 0
  const loading   = ecoLoading || statsLoading

  function handleWalletSearch(e: React.FormEvent) {
    e.preventDefault()
    const addr = query.trim()
    if (!addr) return
    router.push(`/egld/${addr}`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <header className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-sm"
            style={{ color: 'var(--color-text-muted)' }}>← Dashboard</Link>
          <span className="font-bold text-base">MultiversX / EGLD</span>
          {isLive && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-success)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                style={{ background: 'var(--color-success)' }} /> Live
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Wallet search */}
        <form onSubmit={handleWalletSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="erd1… — inspect any MultiversX wallet"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          <button type="submit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--color-primary)', color: '#fff' }}>
            <Search size={14} /> Inspect
          </button>
        </form>

        {/* Price hero */}
        <div className="flex flex-wrap items-end gap-4">
          {loading
            ? <><Skeleton className="w-48 h-10" /><Skeleton className="w-24 h-6" /></>
            : <>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold tabular-nums">{fmtPrice(price)}</h1>
                </div>
                <span className={`flex items-center gap-1 text-lg font-semibold tabular-nums px-2 py-0.5 rounded-lg ${
                  change24h >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                }`}>
                  {change24h >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                  {fmtPct(change24h)}
                </span>
              </>
          }
        </div>

        {/* Economics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {loading ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />) : (
            <>
              <StatCard label="Market Cap"   value={fmtLarge(eco?.marketCap ?? 0)}                  icon={<Layers size={16}/>} />
              <StatCard label="Circulating"  value={fmtLarge(eco?.circulatingSupply ?? 0, false)}   icon={<Activity size={16}/>} />
              <StatCard label="Staked"       value={fmtLarge(eco?.staked ?? 0, false)}              icon={<Zap size={16}/>} accent="var(--color-gold)" />
              <StatCard label="Staking APR"  value={`${(eco?.apr ?? 0).toFixed(2)}%`}               icon={<TrendingUp size={16}/>} accent="var(--color-success)" />
              <StatCard label="Accounts"     value={fmtLarge(stats?.accounts ?? 0, false)}         icon={<Users size={16}/>} />
              <StatCard label="Transactions" value={fmtLarge(stats?.transactions ?? 0, false)}     icon={<Activity size={16}/>} />
              <StatCard label="Epoch"        value={String(stats?.epoch ?? 0)}                      icon={<Layers size={16}/>} accent="var(--color-purple)" />
              <StatCard label="Total Supply" value={fmtLarge(eco?.totalSupply ?? 0, false)}        icon={<Layers size={16}/>} accent="var(--color-text-muted)" />
            </>
          )}
        </div>

        {/* ESDT Tokens */}
        <div className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold text-sm">Top ESDT Tokens</h2>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>by Market Cap</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Token', 'Ticker', 'Price', 'Market Cap', 'Volume 24h', 'Transactions'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium text-xs"
                      style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokensLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-2">
                      <Skeleton className="h-5 w-full" />
                    </td></tr>
                  ))
                  : (tokens ?? []).map((t: EgldToken) => (
                    <tr key={t.identifier}
                      className="border-t transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: 'var(--color-divider)' }}>
                      <td className="px-4 py-2.5 font-medium">{t.name}</td>
                      <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{t.ticker}</td>
                      <td className="px-4 py-2.5 tabular-nums">{t.price != null ? fmtPrice(t.price) : '—'}</td>
                      <td className="px-4 py-2.5 tabular-nums">{t.marketCap != null ? fmtLarge(t.marketCap) : '—'}</td>
                      <td className="px-4 py-2.5 tabular-nums">{t.volume24h != null ? fmtLarge(t.volume24h) : '—'}</td>
                      <td className="px-4 py-2.5 tabular-nums">{fmtLarge(t.transactions, false)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Explorer',  href: 'https://explorer.multiversx.com' },
            { label: 'xExchange', href: 'https://xexchange.com' },
            { label: 'Staking',   href: 'https://staking.multiversx.com' },
            { label: 'API Docs',  href: 'https://api.multiversx.com' },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-opacity hover:opacity-80"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              {label} ↗
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}
