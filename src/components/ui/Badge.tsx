import { TrendingUp, TrendingDown } from 'lucide-react'

interface BadgeProps {
  value: number
  size?: 'sm' | 'md'
}

export function PctBadge({ value, size = 'sm' }: BadgeProps) {
  const up   = value >= 0
  const text = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium num px-1.5 py-0.5 rounded-full ${text} ${
      up
        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/60'
        : 'text-red-600   dark:text-red-400   bg-red-50   dark:bg-red-950/60'
    }`}>
      {up ? <TrendingUp size={size === 'sm' ? 10 : 12} /> : <TrendingDown size={size === 'sm' ? 10 : 12} />}
      {up ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}
