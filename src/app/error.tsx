'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[CTP Error]', error) }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-sm">
        <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: 'var(--red)' }} />
        <h2 className="font-bold text-xl mb-2">Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    </div>
  )
}
