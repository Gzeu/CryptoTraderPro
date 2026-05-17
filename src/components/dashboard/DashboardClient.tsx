'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  TrendingUp, TrendingDown, RefreshCw,
  Star, BarChart2, Wallet, Search,
  Moon, Sun, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useMarketsQuery } from '@/hooks/useMarketsQuery'
import { useTheme } from '@/hooks/useTheme'
import { useWatchlistStore } from '@/store/watchlistStore'
import { fmtPrice, fmtLarge, fmtPct } from '@/lib/formatters'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { LiveTicker } from '@/components/layout/LiveTicker'
import { SkeletonKPI, SkeletonTable } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { type Coin } from '@/types'

type SortField = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume'
type SortDir   = 'asc' | 'desc'
type Tab       = 'market' | 'watchlist'

const PAGE_SIZE = 25

const NAV_LINKS = [
  { href: '/',          label: 'Dashboard' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/egld',      label: 'EGLD' },
  { href: '/compare',   label: 'Compare' },
  { href: '/backtest',  label: 'Backtest' },
] as const

function SortIcon({ field, active, dir }: { field: string; active: SortField; dir: SortDir }) {
  if (field !== active) return <ChevronUp size={11} className="opacity-20" />
  return dir === 'asc'
    ? <ChevronUp   size={11} style={{ color: 'var(--primary)' }} />
    : <ChevronDown size={11} style={{ color: 'var(--primary)' }} />
}

function PctBadge({ pct }: { pct: number }) {
  const up = pct >= 0
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-medium num px-1.5 py-0.5 rounded-full"
      style={{
        color:      up ? 'var(--green)'        : 'var(--red)',
        background: up ? 'var(--green-subtle)' : 'var(--red-subtle)',
      }}
    >
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {fmtPct(pct)}
    </span>
  )
}

interface Props {
  initialCoins: Coin[]
}

export function DashboardClient({ initialCoins }: Props) {
  const {
    data: coins = initialCoins,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useMarketsQuery()

  const { theme, toggle: toggleTheme } = useTheme()
  const { ids: watchlist, toggle: toggleWatchlist } = useWatchlistStore()

  const [search,    setSearch]    = useState('')
  const [tab,       setTab]       = useState<Tab>('market')
  const [sortField, setSortField] = useState<SortField>('market_cap_rank')
  const [sortDir,   setSortDir]   = useState<SortDir>('asc')
  const [page,      setPage]      = useState(1)

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt) : null

  function handleSort(field: SortField) {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
    setPage(1)
  }

  const handleStarClick = useCallback((e: React.MouseEvent, coinId: string) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWatchlist(coinId)
  }, [toggleWatchlist])

  const filtered = useMemo(() => {
    let list = [...coins]
    if (tab === 'watchlist') list = list.filter(c => watchlist.includes(c.id))
    if (search) list = list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
    )
    list.sort((a, b) => {
      const av = (a[sortField] ?? 0) as number
      const bv = (b[sortField] ?? 0) as number
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return list
  }, [coins, tab, search, sortField, sortDir, watchlist])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const btc       = coins.find(c => c.id === 'bitcoin')
  const egld      = coins.find(c => c.id === 'elrond-erd-2')
  const totalMcap = coins.reduce((s, c) => s + c.market_cap,    0)
  const totalVol  = coins.reduce((s, c) => s + c.total_volume,  0)

  type ColDef = { label: string; field: SortField; cls: string }
  const COLS: ColDef[] = [
    { label: 'Price',      field: 'current_price',               cls: 'text-right' },
    { label: '24h %',      field: 'price_change_percentage_24h', cls: 'text-right' },
    { label: 'Market Cap', field: 'market_cap',                  cls: 'text-right hidden sm:block' },
    { label: 'Volume',     field: 'total_volume',                cls: 'text-right hidden lg:block' },
  ]

  const currentPath = '/'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Ticker */}
      <LiveTicker coins={coins} />

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo + Nav */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="CryptoTraderPro">
                <rect width="28" height="28" rx="7" fill="var(--primary)" />
                <path d="M6 14h4l2.5-5.5 3.5 11 2.5-7.5 2 2h3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-bold text-sm tracking-tight hidden sm:block">CryptoTraderPro</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Main navigation">
              {NAV_LINKS.map(({ href, label }) => {
                const active = href === currentPath
                return (
                  <Link
                    key={href}
                    href={href}
                    className="px-3 py-1 rounded-lg font-medium transition-opacity hover:opacity-80"
                    style={active
                      ? { background: 'var(--surface-2)', color: 'var(--text)' }
                      : { color: 'var(--text-muted)' }
                    }
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="search"
              placeholder="Search coins…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              aria-label="Search coins"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {lastUpdate && (
              <span className="text-xs num hidden md:block mr-1" style={{ color: 'var(--text-faint)' }}>
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => refetch()}
              title="Refresh"
              aria-label="Refresh prices"
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {isLoading
            ? [0,1,2,3].map(i => <SkeletonKPI key={i} />)
            : [
                { label: 'Total Market Cap', icon: <BarChart2 size={14}/>, value: fmtLarge(totalMcap)  },
                { label: '24h Volume',       icon: <TrendingUp size={14}/>, value: fmtLarge(totalVol)  },
                { label: 'BTC',  icon: <Wallet size={14}/>, value: fmtPrice(btc?.current_price  ?? 0), pct: btc?.price_change_percentage_24h  },
                { label: 'EGLD', icon: <Star   size={14}/>, value: fmtPrice(egld?.current_price ?? 0), pct: egld?.price_change_percentage_24h },
              ].map((k, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 border fade-up"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', animationDelay: `${i*60}ms` }}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {k.icon}{k.label}
                  </div>
                  <p className="font-bold text-lg num leading-none">{k.value}</p>
                  {k.pct != null && (
                    <p className="text-xs num mt-0.5" style={{ color: k.pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {fmtPct(k.pct)}
                    </p>
                  )}
                </div>
              ))
          }
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: 'var(--surface-2)' }}>
          {(['market','watchlist'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1) }}
              className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
              style={tab === t
                ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: 'var(--text-muted)' }
              }
              aria-pressed={tab === t}
            >
              {t === 'watchlist' ? `⭐ Watchlist (${watchlist.length})` : '📊 Market'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
          role="region"
          aria-label="Cryptocurrency table"
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Header row */}
          <div
            className="grid grid-cols-[2rem_1fr_7rem_7rem_6rem_6rem_5rem_4rem] gap-3 px-4 py-3 text-xs font-medium border-b"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            role="row"
          >
            <button className="text-left" onClick={() => handleSort('market_cap_rank')}>
              <span className="flex items-center gap-0.5">
                #<SortIcon field="market_cap_rank" active={sortField} dir={sortDir} />
              </span>
            </button>
            <span role="columnheader">Name</span>
            {COLS.map(col => (
              <button
                key={col.field}
                className={`${col.cls} flex items-center justify-end gap-0.5 w-full`}
                onClick={() => handleSort(col.field)}
                aria-sort={sortField === col.field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {col.label}<SortIcon field={col.field} active={sortField} dir={sortDir} />
              </button>
            ))}
            <span className="text-right hidden md:block" role="columnheader">7d</span>
            <span className="text-center" role="columnheader">★</span>
          </div>

          {/* Body */}
          {isLoading
            ? <SkeletonTable rows={PAGE_SIZE} />
            : paginated.length === 0
              ? <EmptyState variant={tab === 'watchlist' ? 'watchlist' : 'search'} />
              : paginated.map((coin: Coin, i: number) => (
                  <Link
                    key={coin.id}
                    href={`/coin/${coin.id}`}
                    className="coin-row grid-cols-[2rem_1fr_7rem_7rem_6rem_6rem_5rem_4rem] gap-3 px-4 py-3 border-b items-center fade-up"
                    style={{ borderColor: 'var(--border)', animationDelay: `${Math.min(i*20,200)}ms` }}
                    aria-label={`${coin.name} — ${fmtPrice(coin.current_price)}, ${fmtPct(coin.price_change_percentage_24h ?? 0)} 24h`}
                  >
                    <span className="text-xs num" style={{ color: 'var(--text-faint)' }}>{coin.market_cap_rank}</span>

                    <div className="flex items-center gap-2 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coin.image}
                        alt={coin.name}
                        width={28}
                        height={28}
                        className="rounded-full shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{coin.name}</p>
                        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{coin.symbol}</p>
                      </div>
                    </div>

                    <p className="text-right text-sm font-medium num">{fmtPrice(coin.current_price)}</p>

                    <div className="flex justify-end">
                      <PctBadge pct={coin.price_change_percentage_24h ?? 0} />
                    </div>

                    <p className="text-right text-xs num hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                      {fmtLarge(coin.market_cap)}
                    </p>
                    <p className="text-right text-xs num hidden lg:block" style={{ color: 'var(--text-muted)' }}>
                      {fmtLarge(coin.total_volume)}
                    </p>

                    <div className="hidden md:flex justify-end">
                      <SparklineChart prices={coin.sparkline_in_7d?.price ?? []} />
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={e => handleStarClick(e, coin.id)}
                        className="p-1 rounded transition-colors"
                        aria-label={watchlist.includes(coin.id) ? `Remove ${coin.name} from watchlist` : `Add ${coin.name} to watchlist`}
                        style={{ color: watchlist.includes(coin.id) ? 'var(--yellow)' : 'var(--text-faint)' }}
                      >
                        <Star size={14} fill={watchlist.includes(coin.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </Link>
                ))
          }

          {/* Pagination */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div
              className="flex items-center justify-between px-4 py-3 border-t"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <span className="text-xs num" style={{ color: 'var(--text-muted)' }}>
                {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p-1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg disabled:opacity-30 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs num px-2" style={{ color: 'var(--text)' }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p+1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg disabled:opacity-30 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
          Data by{' '}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--primary)' }}
          >
            CoinGecko
          </a>
          {' '}· Auto-refresh 60s{lastUpdate && ` · ${lastUpdate.toLocaleTimeString()}`}
        </p>
      </main>
    </div>
  )
}
