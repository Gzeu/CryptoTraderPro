import { Search, Star, BarChart2 } from 'lucide-react'

type EmptyVariant = 'search' | 'watchlist' | 'portfolio'

const CONFIG: Record<EmptyVariant, { icon: React.ReactNode; title: string; desc: string }> = {
  search:    { icon: <Search size={36} />,   title: 'No coins found',         desc: 'Try a different name or symbol' },
  watchlist: { icon: <Star size={36} />,     title: 'Your watchlist is empty', desc: 'Star any coin from the Market tab to add it here' },
  portfolio: { icon: <BarChart2 size={36} />, title: 'No holdings yet',        desc: 'Add your first position from the Market tab' },
}

export function EmptyState({ variant }: { variant: EmptyVariant }) {
  const { icon, title, desc } = CONFIG[variant]
  return (
    <div className="py-16 text-center flex flex-col items-center gap-3" style={{ color: 'var(--text-muted)' }}>
      <div className="opacity-30">{icon}</div>
      <p className="font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
      <p className="text-sm max-w-xs">{desc}</p>
    </div>
  )
}
