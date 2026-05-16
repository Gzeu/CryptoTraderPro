'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Star, BarChart2, Wallet, Search, Moon, Sun } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Coin {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
  sparkline_in_7d?: { price: number[] }
}

const WATCHLIST_DEFAULT = [
  'bitcoin', 'ethereum', 'elrond-erd-2', 'binancecoin',
  'solana', 'cardano', 'polkadot', 'avalanche-2',
]

const TICKER_COINS = [
  { id: 'bitcoin', sym: 'BTC' }, { id: 'ethereum', sym: 'ETH' },
  { id: 'elrond-erd-2', sym: 'EGLD' }, { id: 'binancecoin', sym: 'BNB' },
  { id: 'solana', sym: 'SOL' }, { id: 'cardano', sym: 'ADA' },
  { id: 'polkadot', sym: 'DOT' }, { id: 'avalanche-2', sym: 'AVAX' },
]

function fmt(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n < 0.01)  return `$${n.toFixed(6)}`
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function SparklineBar({ prices }: { prices: number[] }) {
  if (!prices?.length) return <div className="h-8 w-16 skeleton rounded" />
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const norm = prices.map(p => max === min ? 0.5 : (p - min) / (max - min))
  const last = prices[prices.length - 1]
  const first = prices[0]
  const up = last >= first
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" className="overflow-visible">
      <polyline
        points={norm.map((v, i) => `${(i / (norm.length - 1)) * 64},${32 - v * 28}`).join(' ')}
        fill="none"
        stroke={up ? 'var(--green)' : 'var(--red)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PctBadge({ pct }: { pct: number }) {
  const up = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium num px-1.5 py-0.5 rounded-full ${
      up ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
    }`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}{pct.toFixed(2)}%
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [ticker, setTicker] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'market' | 'watchlist'>('market')
  const [watchlist, setWatchlist] = useState<string[]>(WATCHLIST_DEFAULT)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Theme toggle
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('ctp-theme') : null
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const t = (stored as 'dark' | 'light') || sys
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('ctp-theme', next)
  }

  // Fetch market data
  const fetchCoins = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h',
        { signal: AbortSignal.timeout(10000) }
      )
      if (!res.ok) throw new Error('CoinGecko rate limit')
      const data: Coin[] = await res.json()
      setCoins(data)
      setTicker(data.filter(c => TICKER_COINS.some(t => t.id === c.id)))
      setLastUpdate(new Date())
    } catch (e) {
      console.warn('CoinGecko fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCoins() }, [fetchCoins])
  useEffect(() => {
    const id = setInterval(fetchCoins, 60_000)
    return () => clearInterval(id)
  }, [fetchCoins])

  const toggleWatchlist = (id: string) =>
    setWatchlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])

  const filtered = coins
    .filter(c => tab === 'watchlist' ? watchlist.includes(c.id) : true)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
    )

  // Ticker items
  const tickerItems = TICKER_COINS.map(t => {
    const coin = ticker.find(c => c.id === t.id)
    return { ...t, price: coin?.current_price, pct: coin?.price_change_percentage_24h }
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Live Ticker ── */}
      <div className="ticker-wrap border-b py-2 text-xs" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-4">
              <span className="font-semibold" style={{ color: 'var(--primary)' }}>{t.sym}</span>
              <span className="num font-medium">{t.price ? fmt(t.price) : '—'}</span>
              {t.pct != null && (
                <span className={`num ${t.pct >= 0 ? '' : ''}` } style={{ color: t.pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {t.pct >= 0 ? '+' : ''}{t.pct.toFixed(2)}%
                </span>
              )}
              <span style={{ color: 'var(--border)' }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="CryptoTraderPro">
              <rect width="28" height="28" rx="7" fill="var(--primary)" />
              <path d="M8 14h3l2-5 3 10 2-7 2 2h3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-sm tracking-tight hidden sm:block">CryptoTraderPro</span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="search"
              placeholder="Search coins…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs hidden md:block num" style={{ color: 'var(--text-faint)' }}>
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchCoins}
              title="Refresh"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))
            : [
                {
                  label: 'Total Market Cap',
                  icon: <BarChart2 size={16} />,
                  value: coins[0]
                    ? fmt(coins.reduce((s, c) => s + c.market_cap, 0))
                    : '—',
                },
                {
                  label: '24h Volume',
                  icon: <TrendingUp size={16} />,
                  value: coins[0]
                    ? fmt(coins.reduce((s, c) => s + c.total_volume, 0))
                    : '—',
                },
                {
                  label: 'BTC Price',
                  icon: <Wallet size={16} />,
                  value: fmt(coins.find(c => c.id === 'bitcoin')?.current_price ?? 0),
                },
                {
                  label: 'EGLD Price',
                  icon: <Star size={16} />,
                  value: fmt(coins.find(c => c.id === 'elrond-erd-2')?.current_price ?? 0),
                },
              ].map((kpi, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 border fade-up"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-muted)' }}>
                    {kpi.icon}
                    <span className="text-xs">{kpi.label}</span>
                  </div>
                  <p className="font-bold text-lg num">{kpi.value}</p>
                </div>
              ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: 'var(--surface-2)' }}>
          {(['market', 'watchlist'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
              style={tab === t
                ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: 'var(--text-muted)' }
              }
            >
              {t === 'watchlist' ? `⭐ Watchlist (${watchlist.length})` : '📊 Market'}
            </button>
          ))}
        </div>

        {/* Coin Table */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {/* Table Header */}
          <div
            className="grid grid-cols-[2rem_1fr_7rem_7rem_6rem_5rem_4rem] gap-3 px-4 py-3 text-xs font-medium border-b"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
          >
            <span>#</span>
            <span>Name</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h %</span>
            <span className="text-right hidden sm:block">Market Cap</span>
            <span className="text-right hidden md:block">7d Chart</span>
            <span className="text-center">★</span>
          </div>

          {/* Rows */}
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_7rem_7rem_6rem_5rem_4rem] gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="skeleton h-4 w-5 rounded" />
                  <div className="flex items-center gap-2">
                    <div className="skeleton h-8 w-8 rounded-full" />
                    <div className="skeleton h-4 w-24 rounded" />
                  </div>
                  <div className="skeleton h-4 w-20 rounded ml-auto" />
                  <div className="skeleton h-4 w-16 rounded ml-auto" />
                  <div className="skeleton h-4 w-20 rounded ml-auto hidden sm:block" />
                  <div className="skeleton h-8 w-16 rounded ml-auto hidden md:block" />
                  <div className="skeleton h-6 w-6 rounded mx-auto" />
                </div>
              ))
            : filtered.length === 0
              ? (
                  <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
                    <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No coins found</p>
                    <p className="text-sm mt-1">Try a different search or tab</p>
                  </div>
                )
              : filtered.map((coin, i) => (
                  <div
                    key={coin.id}
                    className="grid grid-cols-[2rem_1fr_7rem_7rem_6rem_5rem_4rem] gap-3 px-4 py-3 border-b items-center hover:opacity-80 transition-opacity fade-up"
                    style={{ borderColor: 'var(--border)', animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    <span className="text-xs num" style={{ color: 'var(--text-faint)' }}>{i + 1}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full shrink-0" loading="lazy" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{coin.name}</p>
                        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{coin.symbol}</p>
                      </div>
                    </div>
                    <p className="text-right text-sm font-medium num">{fmt(coin.current_price)}</p>
                    <div className="flex justify-end">
                      <PctBadge pct={coin.price_change_percentage_24h ?? 0} />
                    </div>
                    <p className="text-right text-xs num hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                      {fmt(coin.market_cap)}
                    </p>
                    <div className="hidden md:flex justify-end">
                      <SparklineBar prices={coin.sparkline_in_7d?.price ?? []} />
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleWatchlist(coin.id)}
                        className="p-1 rounded transition-colors"
                        title={watchlist.includes(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                        style={{ color: watchlist.includes(coin.id) ? 'var(--yellow)' : 'var(--text-faint)' }}
                        aria-label={watchlist.includes(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        <Star size={14} fill={watchlist.includes(coin.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                ))
          }
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
          Data by{' '}
          <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>CoinGecko</a>
          {' '}· Auto-refresh every 60s
          {lastUpdate && ` · Last update: ${lastUpdate.toLocaleTimeString()}`}
        </p>
      </main>
    </div>
  )
}
