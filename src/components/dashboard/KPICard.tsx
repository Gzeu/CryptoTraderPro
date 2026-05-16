import { type LucideIcon } from 'lucide-react'
import { type KPI } from '@/types'

interface Props extends KPI {
  icon: LucideIcon
  delay?: number
}

export function KPICard({ label, value, subValue, trend, icon: Icon, delay = 0 }: Props) {
  const trendColor = trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--red)' : 'var(--text-muted)'
  return (
    <div
      className="rounded-xl p-4 border fade-up"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-muted)' }}>
        <Icon size={14} />
        <span className="text-xs truncate">{label}</span>
      </div>
      <p className="font-bold text-lg num leading-none mb-1">{value}</p>
      {subValue && (
        <p className="text-xs num" style={{ color: trendColor }}>{subValue}</p>
      )}
    </div>
  )
}
