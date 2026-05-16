import { useRef, useState, useEffect } from 'react'

export type FlashDirection = 'up' | 'down' | null

/**
 * Tracks price changes and returns a flash direction ('up' | 'down' | null).
 * Flash clears automatically after `duration` ms (default 600ms).
 *
 * Usage:
 *   const flash = usePriceFlash(price)
 *   <span className={cn('tabular-nums', flash === 'up' && 'flash-up', flash === 'down' && 'flash-down')}>
 *     {fmtPrice(price)}
 *   </span>
 */
export function usePriceFlash(price: number | null | undefined, duration = 600): FlashDirection {
  const prevRef = useRef<number | null>(null)
  const [flash, setFlash] = useState<FlashDirection>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (price == null) return
    const prev = prevRef.current

    if (prev !== null && prev !== price) {
      const dir: FlashDirection = price > prev ? 'up' : 'down'
      setFlash(dir)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setFlash(null), duration)
    }

    prevRef.current = price
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [price, duration])

  return flash
}
