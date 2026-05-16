'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Bell, TrendingUp, TrendingDown, ExternalLink, Activity, Radio } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchCoinDetail, fetchOHLC } from '@/lib/api/coingecko'
import { CandlestickChart } from '@/components/charts/CandlestickChart'
import { BacktestPanel } from '@/components/dashboard/BacktestPanel'
import { CoinNewsFeed } from '@/components/news/CoinNewsFeed'
import { useTheme } from '@/hooks/useTheme'
import { useWatchlistStore } from '@/store/watchlistStore'
import { useAlertStore } from '@/store/alertStore'
import { useLivePrice } from '@/hooks/useLivePrice'
import { useKlineStream } from '@/hooks/useKlineStream'
import { fmtPrice, fmtLarge, fmtPct, fmtDate } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/Skeleton'
import type { KlineInterval } from '@/hooks/useKlineStream'

// ---- CoinGecko id → Binance symbol + ticker ----
const COIN_META: Record<string, { binance: string; symbol: string }> = {
  bitcoin:        { binance: 'BTC',  symbol: 'BTC'  },
  ethereum:       { binance: 'ETH',  symbol: 'ETH'  },
  'elrond-erd-2': { binance: 'EGLD', symbol: 'EGLD' },
  solana:         { binance: 'SOL',  symbol: 'SOL'  },
  binancecoin:    { binance: 'BNB',  symbol: 'BNB'  },
  cardano:        { binance: 'ADA',  symbol: 'ADA'  },
  ripple:         { binance: 'XRP',  symbol: 'XRP'  },
  dogecoin:       { binance: 'DOGE', symbol: 'DOGE' },
  polkadot:       { binance: 'DOT',  symbol: 'DOT'  },
  litecoin:       { binance: 'LTC',  symbol: 'LTC'  },
  'avalanche-2':  { binance: 'AVAX', symbol: 'AVAX' },
  chainlink:      { binance: 'LINK', symbol: 'LINK' },
  uniswap:        { binance: 'UNI',  symbol: 'UNI'  },
  stellar:        { binance: 'XLM',  symbol: 'XLM'  },
  cosmos:         { binance: 'ATOM', symbol: 'ATOM' },
}

function toBinanceBase(coinId: string): string {
  return COIN_META[coinId.toLowerCase()]?.binance ?? coinId.toUpperCase()
}
function toTickerSymbol(coinId: string, fallback: string): string {
  return COIN_META[coinId.toLowerCase()]?.symbol ?? fallback.toUpperCase()
}

type Range = '1' | '7' | '14' | '30' | '90' | '365'
const RANGES: { label: string; value: Range; interval: KlineInterval }[] = [
  { label: '1D',  value: '1',   interval: '1m'  },
  { label: '7D',  value: '7',   interval: '15m' },
  { label: '14D', value: '14',  interval: '30m' },
  { label: '1M',  value: '30',  interval: '1h'  },
  { label: '3M',  value: '90',  interval: '4h'  },
  { label: '1Y',  value: '365', interval: '1d'  },
]

export default function CoinDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const { theme } = useTheme()
  const isDark   = theme === 'dark'
  const { ids: watchlist, toggle: toggleWatchlist } = useWatchlistStore()
  const { addAlert } = useAlertStore()

  const [range,        setRange]        = useState(RANGES[3])
  const [alertPrice,   setAlertPrice]   = useState('')
  const [alertDir,     setAlertDir]     = useState<'above'|'below'>('above')
  const [alertSaved,   setAlertSaved]   = useState(false)
  const [showBacktest, setShowBacktest] = useState(false)

  const { data: coin, isLoading: coinLoading } = useQuery({
    queryKey: ['coin', id],
    queryFn:  () => fetchCoinDetail(id),
    staleTime: 60_000,
  })

  const { data: ohlc = [], isLoading: ohlcLoading } = useQuery({
    queryKey: ['ohlc', id, range.value],
    queryFn:  () => fetchOHLC(id, range.value),
    staleTime: 60_000,
  })

  const binanceBase  = toBinanceBase(id)
  const wsSymbol     = `${binanceBase}USDT`
  const tickerSymbol = toTickerSymbol(id, coin?.symbol ?? id)

  const { price: livePrice, priceChangePercent: livePct, isLive } = useLivePrice(wsSymbol)
  const { candles, isLive: klineIsLive } = useKlineStream(ohlc, wsSymbol, range.interval, !ohlcLoading)

  const price     = livePrice ?? coin?.market_data?.current_price?.usd    ?? 0
  const change24h = livePct   ?? coin?.market_data?.price_change_percentage_24h ?? 0

  function handleAddAlert() {
    const p = parseFloat(alertPrice)
    if (!coin || isNaN(p) || p <= 0) return
    addAlert({ coinId: id, coinName: coin.name, price: p, direction: alertDir })
    setAlertSaved(true)
    setAlertPrice('')
    setTimeout(() => setAlertSaved(false), 2_500)
  }

  const isWatched = watchlist.includes(id)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          {coinLoading
            ? <div className="h-5 w-32 rounded" style={{ background: 'var(--color-surface-2)' }} />
            : <>
                {coin?.image?.small && (
                  <img src={coin.image.small} alt={coin.name} width={24} height={24}
                    loading="lazy" className="rounded-full" />
                )}
                <span className="font-bold">{coin?.name}</span>
                <span className="text-sm uppercase" style={{ color: 'var(--color-text-muted)' }}>{coin?.symbol}</span>
                <span className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                  #{coin?.market_cap_rank}
                </span>
                {isLive && (
                  <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: 'var(--color-success)' }}>
                    <Radio size={12} className="animate-pulse" /> Live
                  </span>
                )}
              </>
          }
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => toggleWatchlist(id)}
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: isWatched ? 'var(--color-gold)' : 'var(--color-text-muted)' }}
              aria-label="Toggle watchlist">
              <Star size={16} fill={isWatched ? 'currentColor' : 'none'} />
            </button>
            {coin?.links?.homepage?.[0] && (
              <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-text-muted)' }} aria-label="Website">
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
                <h1 className="text-4xl font-bold tabular-nums">{fmtPrice(price)}</h1>
                <span className={`flex items-center gap-1 text-lg font-semibold tabular-nums px-2 py-0.5 rounded-lg ${
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
            { label: 'Market Cap',  val: fmtLarge(coin?.market_data?.market_cap?.usd ?? 0) },
            { label: '24h Volume',  val: fmtLarge(coin?.market_data?.total_volume?.usd ?? 0) },
            { label: 'ATH',         val: fmtPrice(coin?.market_data?.ath?.usd ?? 0) },
            { label: 'ATH Date',    val: coin?.market_data?.ath_date?.usd ? fmtDate(new Date(coin.market_data.ath_date.usd)) : '—' },
            { label: 'Circulating', val: fmtLarge(coin?.market_data?.circulating_supply ?? 0, false) },
            { label: 'Max Supply',  val: coin?.market_data?.max_supply ? fmtLarge(coin.market_data.max_supply, false) : '∞' },
            { label: '7d Change',   val: fmtPct(coin?.market_data?.price_change_percentage_7d ?? 0) },
            { label: '30d Change',  val: fmtPct(coin?.market_data?.price_change_percentage_30d ?? 0) },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl p-3 border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <p className="font-semibold text-sm tabular-nums">{coinLoading ? '—' : val}</p>
            </div>
          ))}
        </div>

        {/* OHLC Chart */}
        <div className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm">OHLC Candlestick</h2>
              {klineIsLive && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-success)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                    style={{ background: 'var(--color-success)' }} />
                  live
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {RANGES.map(r => (
                <button key={r.value} onClick={() => setRange(r)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={range.value === r.value
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-text-muted)', background: 'var(--color-surface-2)' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="px-2 pb-4">
            {ohlcLoading
              ? <Skeleton style={{ height: 280, borderRadius: 8 }} />
              : <CandlestickChart data={candles} isDark={isDark} />
            }
          </div>
        </div>

        {/* Backtest */}
        <button onClick={() => setShowBacktest(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <Activity size={14} style={{ color: 'var(--color-primary)' }} />
          {showBacktest ? 'Hide Backtest' : 'Run Backtest'}
        </button>
        {showBacktest && coin && <BacktestPanel coinId={id} coinName={coin.name} />}

        {/* Price Alert */}
        <div className="rounded-xl border p-4"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Bell size={15} style={{ color: 'var(--color-primary)' }} /> Price Alert
          </h2>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Direction</label>
              <select value={alertDir} onChange={e => setAlertDir(e.target.value as 'above'|'below')}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                <option value="above">Price goes above</option>
                <option value="below">Price drops below</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Target price (USD)</label>
              <input type="number" min="0" step="any"
                placeholder={`e.g. ${Math.round(price * 1.05)}`}
                value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm w-40 tabular-nums"
                style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
            <button onClick={handleAddAlert}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: alertSaved ? 'var(--color-success)' : 'var(--color-primary)', color: '#fff' }}>
              {alertSaved ? '✓ Saved!' : 'Set Alert'}
            </button>
          </div>
          {isLive && (
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Current live price: <span className="font-semibold tabular-nums"
                style={{ color: 'var(--color-text)' }}>${fmtPrice(price)}</span>
            </p>
          )}
        </div>

        {/* ── News Feed (CryptoPanic) ── */}
        <CoinNewsFeed symbol={tickerSymbol} limit={10} />

        {/* Description */}
        {coin?.description?.en && (
          <div className="rounded-xl border p-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold text-sm mb-3">About {coin.name}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}
              dangerouslySetInnerHTML={{ __html:
                coin.description.en.split('. ').slice(0, 5).join('. ') + '.'
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
