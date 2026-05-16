'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function EgldPage() {
  const [address, setAddress] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = address.trim()
    if (trimmed.startsWith('erd1') && trimmed.length === 62) {
      router.push(`/egld/${trimmed}`)
    }
  }

  const isValid = address.trim().startsWith('erd1') && address.trim().length === 62

  return (
    <main className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl font-bold">EGLD Wallet Inspector</h1>
        <p className="text-muted-foreground">
          Enter a MultiversX address to inspect EGLD balance, ESDT tokens and NFTs
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="erd1..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={!isValid}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Inspect
        </button>
      </form>
      {address && !isValid && (
        <p className="text-xs text-red-500 mt-2 pl-1">
          Invalid address — must start with erd1 and be 62 characters
        </p>
      )}

      <div className="mt-12 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Example addresses</p>
        {[
          'erd1qqqqqqqqqqqqqpgqhe8t5jewej70zupmh44jurgn29jfwsdx2tp7qsepukq',
          'erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx',
        ].map((ex) => (
          <button
            key={ex}
            onClick={() => router.push(`/egld/${ex}`)}
            className="block w-full text-left font-mono text-xs text-muted-foreground hover:text-blue-500 transition-colors truncate"
          >
            {ex}
          </button>
        ))}
      </div>
    </main>
  )
}
