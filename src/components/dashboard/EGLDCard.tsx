'use client'

import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEGLD } from '@/hooks/useEGLD'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { fmtPrice, fmtLarge, fmtPct } from '@/lib/formatters'
import { SkeletonKPI } from '@/components/ui/Skeleton'

/**
 * Featured EGLD / MultiversX card — shown prominently on the dashboard.
 * Links to the coin detail page and MultiversX explorer.
 */
export function EGLDCard() {
  const { data, isLoading } = useEGLD()

  if (isLoading) return <SkeletonKPI />

  if (!data) return null

  const up = data.change24h >= 0

  return (
    <Link href="/coin/elrond-erd-2"
      className="block rounded-xl border p-4 hover:opacity-80 transition-opacity group"
      style={{ background: 'var(--surface)', borderColor: 'var(--primary)', boxShadow: '0 0 0 1px var(--primary)20' }}>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* MultiversX X logo inline SVG */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-label="MultiversX">
            <rect width="22" height="22" rx="6" fill="#23F7DD" />
            <path d="M5 5l5.5 6L5 17h2.5l4.25-4.9L16 17h2.5l-5.5-6L18 5h-2.5l-4 4.6L7.5 5H5z" fill="#000" />
          </svg>
          <div>
            <p className="font-bold text-sm leading-none">EGLD</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>MultiversX · #{data.rank}</p>
          </div>
        </div>
        <a href="https://explorer.multiversx.com" target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="p-1 rounded hover:opacity-60 transition-opacity" style={{ color: 'var(--text-faint)' }}
          aria-label="MultiversX Explorer">
          <ExternalLink size={13} />
        </a>
      </div>

      <p className="text-2xl font-bold num mb-0.5">{fmtPrice(data.price)}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium num px-1.5 py-0.5 rounded-full ${
            up ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/60'
               : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/60'
          }`}>
            {up ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
            {fmtPct(data.change24h)}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>24h</span>
        </div>
        <SparklineChart prices={data.sparkline} width={80} height={32} />
      </div>

      <div className="flex justify-between mt-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <span>MCap <strong className="num" style={{ color: 'var(--text)' }}>{fmtLarge(data.marketCap)}</strong></span>
        <span>Vol <strong className="num" style={{ color: 'var(--text)' }}>{fmtLarge(data.volume24h)}</strong></span>
      </div>
    </Link>
  )
}
