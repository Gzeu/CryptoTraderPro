import { Suspense } from 'react'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { SkeletonTable, SkeletonKPI } from '@/components/ui/Skeleton'
import { type Coin } from '@/types'

// Server Component — fetches coins at request time (ISR 60s)
async function getCoins(): Promise<Coin[]> {
  try {
    const base = process.env.NEXT_PUBLIC_COINGECKO_BASE ?? 'https://api.coingecko.com/api/v3'
    const key  = process.env.COINGECKO_API_KEY
    const url  = `${base}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`
    const res  = await fetch(url, {
      headers: key ? { 'x-cg-pro-api-key': key } : {},
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

function DashboardFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[0,1,2,3].map(i => <SkeletonKPI key={i} />)}
      </div>
      <SkeletonTable rows={25} />
    </div>
  )
}

export default async function DashboardPage() {
  const coins = await getCoins()
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardClient initialCoins={coins} />
    </Suspense>
  )
}
