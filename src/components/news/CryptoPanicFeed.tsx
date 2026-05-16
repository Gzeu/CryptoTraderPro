'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'

interface NewsItem {
  id: number
  title: string
  url: string
  source: { title: string; domain: string }
  published_at: string
  currencies?: Array<{ code: string; title: string }>
  votes: {
    negative: number
    positive: number
    important: number
    liked: number
    disliked: number
    lol: number
    toxic: number
    saved: number
    comments: number
  }
  kind: 'news' | 'media'
  domain: string
  slug: string
  metadata?: {
    image?: string
    description?: string
  }
}

interface Props {
  coinId?: string   // CryptoPanic uses currency codes like BTC, ETH, EGLD
  limit?: number
}

function sentimentIcon(votes: NewsItem['votes']) {
  const score = votes.positive - votes.negative
  if (score > 0) return <TrendingUp size={13} className="text-green-500" />
  if (score < 0) return <TrendingDown size={13} className="text-red-500" />
  return <Minus size={13} className="text-muted-foreground" />
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function CryptoPanicFeed({ coinId, limit = 10 }: Props) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const currency = coinId ? `&currencies=${encodeURIComponent(coinId.toUpperCase())}` : ''
      // Public endpoint — no auth key needed for public feed
      const res = await fetch(
        `/api/news?currency=${coinId ?? ''}&limit=${limit}`,
        { next: { revalidate: 300 } }
      )
      if (!res.ok) throw new Error('Failed to fetch news')
      const data = await res.json()
      setNews(data.results ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [coinId, limit])

  if (loading) return <NewsSkeleton />

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">News</h2>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          aria-label="Refresh news"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {error ? (
        <div className="text-sm text-muted-foreground text-center py-6">
          {error} — <button onClick={() => load()} className="text-blue-500 hover:underline">retry</button>
        </div>
      ) : news.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6">No news found</div>
      ) : (
        <ul className="space-y-2">
          {news.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-3 rounded-xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-500 transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium">{item.source.domain}</span>
                    <span>·</span>
                    <span>{timeAgo(item.published_at)}</span>
                    {item.votes.positive + item.votes.negative > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          {sentimentIcon(item.votes)}
                          <span className="text-green-500">{item.votes.positive}</span>
                          {' / '}
                          <span className="text-red-500">{item.votes.negative}</span>
                        </span>
                      </>
                    )}
                    {item.currencies?.slice(0, 3).map((c) => (
                      <span key={c.code} className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                        {c.code}
                      </span>
                    ))}
                  </div>
                </div>
                <ExternalLink size={14} className="shrink-0 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NewsSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-5 bg-muted rounded w-16" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-3 rounded-xl border border-border space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}
