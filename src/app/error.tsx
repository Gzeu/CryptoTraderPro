'use client'

import { useEffect } from 'react'
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CryptoTraderPro Error]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangleIcon className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground/60">Error ID: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="btn btn-primary compact-btn inline-flex items-center gap-2"
      >
        <RefreshCwIcon className="h-4 w-4" />
        Try again
      </button>
    </div>
  )
}
