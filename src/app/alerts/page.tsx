'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'

export default function AlertsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" aria-label="Back">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold">Price Alerts</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AlertsPanel />
      </main>
    </div>
  )
}
