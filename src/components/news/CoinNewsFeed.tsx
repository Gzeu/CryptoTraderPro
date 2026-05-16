'use client'

// =============================================================================
// CoinNewsFeed — CryptoPanic API news feed for a specific coin
// Public endpoint (no API key needed for free tier, no-auth mode)
// https://cryptopanic.com/api/v1/posts/?auth_token=...&currencies=BTC
// Falls back to a free public proxy endpoint if CORS blocks direct calls.
// =============================================================================

import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Newspaper } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

export interface NewsPost {
  id:           number
  title:        string
  published_at: string
  url:          string
  source: {
    title: string
    domain: string
  }
  votes: {
    positive: number
    negative: number
    important: number
  }
  currencies?: { code: string; title: string }[]
}

interface CryptoPanicResponse {
  results: NewsPost[]
}

// CryptoPanic free public API — no auth token required for public feed
// Filter by currency symbol (e.g. BTC, ETH, EGLD)
const CRYPTOPANIC_TOKEN = process.env.NEXT_PUBLIC_CRYPTOPANIC_TOKEN ?? 'public'

function buildUrl(symbol: string) {
  const currency = symbol.toUpperCase()
  // Use the free public endpoint; if a NEXT_PUBLIC_CRYPTOPANIC_TOKEN env var is set, use it
  if (CRYPTOPANIC_TOKEN !== 'public') {
    return `https://cryptopanic.com/api/v1/posts/?auth_token=${CRYPTOPANIC_TOKEN}&currencies=${currency}&kind=news&public=true`
  }
  // Fallback: general crypto news filtered client-side by mention of the symbol
  return `https://cryptopanic.com/api/v1/posts/?auth_token=free&currencies=${currency}&kind=news&public=true`
}

async function fetchNews(symbol: string): Promise<NewsPost[]> {
  const url = buildUrl(symbol)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`CryptoPanic ${res.status}`)
    const data = await res.json() as CryptoPanicResponse
    return data.results ?? []
  } catch {
    // CORS fallback: try via AllOrigins proxy
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    const res2  = await fetch(proxy)
    if (!res2.ok) throw new Error('News unavailable')
    const data2 = await res2.json() as CryptoPanicResponse
    return data2.results ?? []
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m    = Math.floor(diff / 60_000)
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface Props {
  symbol: string   // e.g. 'BTC', 'EGLD'
  limit?: number
}

export function CoinNewsFeed({ symbol, limit = 8 }: Props) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['coin-news', symbol],
    queryFn: () => fetchNews(symbol),
    staleTime: 5 * 60_000,    // 5 min
    retry: 1,
  })

  const posts = data?.slice(0, limit) ?? []

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Newspaper size={14} style={{ color: 'var(--color-primary)' }} />
          Latest News · {symbol.toUpperCase()}
        </h2>
        <a href={`https://cryptopanic.com/news/${symbol.toLowerCase()}/`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}>
          CryptoPanic <ExternalLink size={10} />
        </a>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="divide-y" style={{ borderColor: 'var(--color-divider)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-4 py-6 text-center space-y-2">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Couldn't load news.</p>
          <button onClick={() => refetch()}
            className="text-xs px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            Retry
          </button>
          <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
            Tip: set NEXT_PUBLIC_CRYPTOPANIC_TOKEN in .env for reliable access.
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No news found for {symbol.toUpperCase()}.
        </div>
      ) : (
        <ul className="divide-y" style={{ '--divide-color': 'var(--color-divider)' } as React.CSSProperties}>
          {posts.map(post => (
            <li key={post.id}>
              <a href={post.url} target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-1 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ textDecoration: 'none' }}>
                <span className="text-sm font-medium leading-snug line-clamp-2"
                  style={{ color: 'var(--color-text)' }}>
                  {post.title}
                </span>
                <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{post.source.domain}</span>
                  <span style={{ color: 'var(--color-text-faint)' }}>·</span>
                  <span>{timeAgo(post.published_at)}</span>
                  {post.votes.positive > 0 && (
                    <span style={{ color: 'var(--color-success)' }}>▲ {post.votes.positive}</span>
                  )}
                  {post.votes.important > 0 && (
                    <span style={{ color: 'var(--color-gold)' }}>★ {post.votes.important}</span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
