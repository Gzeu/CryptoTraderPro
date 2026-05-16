import { cn } from '@/lib/utils'

interface Props { className?: string }

export function Skeleton({ className }: Props) {
  return <div className={cn('skeleton rounded', className)} />
}

export function SkeletonTable({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-[2rem_1fr_7rem_7rem_6rem_5rem_4rem] gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Skeleton className="h-4 w-5" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-5 w-16 ml-auto rounded-full" />
          <Skeleton className="h-4 w-20 ml-auto hidden sm:block" />
          <Skeleton className="h-8 w-16 ml-auto hidden md:block" />
          <Skeleton className="h-5 w-5 mx-auto rounded" />
        </div>
      ))}
    </>
  )
}

export function SkeletonKPI() {
  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-7 w-32" />
    </div>
  )
}
