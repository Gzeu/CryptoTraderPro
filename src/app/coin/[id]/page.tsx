'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Bell, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchCoinDetail, fetchOHLC, type OHLCBar } from '@/lib/api/coingecko'
import { CandlestickChart } from '@/components/charts/CandlestickChart'
import { useTheme } from '@/hooks/useTheme'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useAlertStore } from '@/store/alertStore'
import { fmtPrice, fmtLarge, fmtPct, fmtDate } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/Skeleton'

type Range = '1' | '7' | '14' | '30' | '90' | '365'
const RANGES: { label: string; value: Range }[] = [
  { label: '1D', value: '1' },
  { label: '7D', value: '7' },
  { label: '14D', value: '14' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
]

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { ids: watchlist, toggle: toggleWatchlist } = useWatchlistStore()
  const { addAlert } = useAlertStore()

  const [range, setRange] = useState<Range>('7')
  const [alertPrice, setAlertPrice] = useState('')
  const [alertDir, setAlertDir] = useState<'above' | 'below'>('above')
  const [alertSaved, setAlertSaved] = useState(false)

  const { data: coin, isLoading: coinLoading } = useQuery({
    queryKey: ['coin', id],
    queryFn: () => fetchCoinDetail(id),
    staleTime: 60_000,
  })

  const { data: ohlc = [], isLoading: ohlcLoading } = useQuery({
    queryKey: ['ohlc', id, range],
    queryFn: () => fetchOHLC(id, range),
    staleTime: 60_000,
  })

  function handleAddAlert() {
    const price = parseFloat(alertPrice)
    if (!coin || isNaN(price) || price <= 0) return
    addAlert({ coinId: id, coinName: coin.name, price, direction: alertDir })
    setAlertSaved(true)
    setAlertPrice('')
    setTimeout(() => setAlertSaved(false), 2500)
  }

  const isWatched = watchlist.includes(id)
  const change24h = coin?.market_data?.price_change_percentage_24h ?? 0
  const price     = coin?.market_data?.current_price?.usd ?? 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          {coinLoading
            ? <div className="skeleton skeleton-text w-32 h-5" />
            : <>
                {coin?.image?.small && <img src={coin.image.small} alt={coin.name} width={24} height={24} loading="lazy" className="rounded-full" />}
                <span className="font-bold">{coin?.name}</span>
                <span className="text-sm uppercase" style={{ color: 'var(--text-muted)' }}>{coin?.symbol}</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  #{coin?.market_cap_rank}
                </span>
              </>
          }
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => toggleWatchlist(id)} className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: isWatched ? 'var(--yellow)' : 'var(--text-muted)' }} aria-label="Toggle watchlist">
              <Star size={16} fill={isWatched ? 'currentColor' : 'none'} />
            </button>
            {coin?.links?.homepage?.[0] && (
              <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }} aria-label="Website">
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Price hero */}
        <div className="flex flex-wrap items-end gap-4">
          {coinLoading
            ? <><Skeleton className="w-48 h-10" /><Skeleton className="w-24 h-6" /></>
            : <>
                <h1 className="text-4xl font-bold num">{fmtPrice(price)}</h1>
                <span className={`flex items-center gap-1 text-lg font-semibold num px-2 py-0.5 rounded-lg ${
                  change24h >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                }`}>
                  {change24h >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                  {fmtPct(change24h)}
                </span>
              </>
          }
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Market Cap',    val: fmtLarge(coin?.market_data?.market_cap?.usd ?? 0) },
            { label: '24h Volume',    val: fmtLarge(coin?.market_data?.total_volume?.usd ?? 0) },
            { label: 'ATH',           val: fmtPrice(coin?.market_data?.ath?.usd ?? 0) },
            { label: 'ATH Date',      val: coin?.market_data?.ath_date?.usd ? fmtDate(new Date(coin.market_data.ath_date.usd)) : '—' },
            { label: 'Circulating',   val: fmtLarge(coin?.market_data?.circulating_supply ?? 0, false) },
            { label: 'Max Supply',    val: coin?.market_data?.max_supply ? fmtLarge(coin.market_data.max_supply, false) : '∞' },
            { label: '7d Change',     val: fmtPct(coin?.market_data?.price_change_percentage_7d ?? 0) },
            { label: '30d Change',    val: fmtPct(coin?.market_data?.price_change_percentage_30d ?? 0) },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl p-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="font-semibold text-sm num">{coinLoading ? '—' : val}</p>
            </div>
          ))}
        </div>

        {/* OHLC Chart */}
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="font-semibold text-sm">OHLC Candlestick</h2>
            <div className="flex gap-1">
              {RANGES.map(r => (
                <button key={r.value} onClick={() => setRange(r.value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={range===r.value
                    ? { background: 'var(--primary)', color: '#fff' }
                    : { color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="px-2 pb-4">
            {ohlcLoading
              ? <div className="skeleton" style={{ height: 280, borderRadius: 8 }} />
              : <CandlestickChart data={ohlc} isDark={isDark} />
            }
          </div>
        </div>

        {/* Price Alert */}
        <div className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Bell size={15} style={{ color: 'var(--primary)' }} /> Price Alert
          </h2>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Direction</label>
              <select value={alertDir} onChange={e => setAlertDir(e.target.value as 'above'|'below')}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="above">Price goes above</option>
                <option value="below">Price drops below</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Target price (USD)</label>
              <input type="number" min="0" step="any" placeholder={`e.g. ${Math.round(price * 1.05)}`}
                value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm w-40 num"
                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            <button onClick={handleAddAlert}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: alertSaved ? 'var(--green)' : 'var(--primary)', color: '#fff' }}>
              {alertSaved ? '✓ Saved!' : 'Set Alert'}
            </button>
          </div>
          {alertSaved && (
            <p className="text-xs mt-2" style={{ color: 'var(--primary)' }}>
              Alert set! You\'ll be notified via browser notification when price is triggered.
            </p>
          )}
        </div>

        {/* Description */}
        {coin?.description?.en && (
          <div className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm mb-3">About {coin.name}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}
              dangerouslySetInnerHTML={{ __html: coin.description.en.split('. ').slice(0, 5).join('. ') + '.' }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
