'use client'

export function SkeletonCard() {
  return (
    <div className="card compact-card space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-24 rounded bg-secondary" />
          <div className="h-6 w-32 rounded bg-secondary" />
        </div>
        <div className="h-8 w-8 rounded-md bg-secondary" />
      </div>
      <div className="h-5 w-16 rounded-full bg-secondary" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="card compact-card space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-5 w-40 rounded bg-secondary" />
          <div className="h-4 w-24 rounded bg-secondary" />
        </div>
        <div className="h-7 w-20 rounded-full bg-secondary" />
      </div>
      {/* Chart bars simulation */}
      <div className="flex h-[380px] items-end gap-1 pt-4">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-secondary"
            style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 10 }: { rows?: number }) {
  return (
    <div className="card compact-card animate-pulse">
      <div className="space-y-2">
        {/* Header row */}
        <div className="flex gap-3 border-b pb-2">
          <div className="h-3 w-6 rounded bg-secondary" />
          <div className="h-3 w-24 rounded bg-secondary" />
          <div className="ml-auto h-3 w-20 rounded bg-secondary" />
          <div className="h-3 w-16 rounded bg-secondary" />
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <div className="h-4 w-4 rounded bg-secondary" />
            <div className="h-5 w-5 rounded-full bg-secondary" />
            <div className="space-y-1">
              <div className="h-3.5 w-16 rounded bg-secondary" />
              <div className="h-3 w-10 rounded bg-secondary" />
            </div>
            <div className="ml-auto h-4 w-20 rounded bg-secondary" />
            <div className="h-5 w-14 rounded-full bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-64 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-80 animate-pulse rounded bg-secondary" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-lg bg-secondary" />
      </div>
      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><SkeletonChart /></div>
        <div><SkeletonTable rows={12} /></div>
      </div>
    </div>
  )
}
