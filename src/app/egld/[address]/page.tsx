import { Suspense } from 'react'
import { EgldWalletInspector } from '@/components/egld/EgldWalletInspector'
import { notFound } from 'next/navigation'

interface Props {
  params: { address: string }
}

export async function generateMetadata({ params }: Props) {
  const { address } = params
  if (!address.startsWith('erd1') || address.length !== 62) {
    return { title: 'Invalid address' }
  }
  return {
    title: `Wallet ${address.slice(0, 10)}… | CryptoTraderPro`,
    description: `EGLD balance, ESDT tokens and NFTs for ${address}`,
  }
}

export default function EgldWalletPage({ params }: Props) {
  const { address } = params
  if (!address.startsWith('erd1') || address.length !== 62) {
    notFound()
  }
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <Suspense fallback={<WalletSkeleton />}>
        <EgldWalletInspector address={address} />
      </Suspense>
    </main>
  )
}

function WalletSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  )
}
