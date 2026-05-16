// =============================================================================
// Binance Kline (candlestick) WebSocket feed
// wss://stream.binance.com:9443/ws/<symbol>@kline_<interval>
//
// Emits KlineCandle on every message; last candle in the series is replaced
// live until it closes (k.x === true), then a new one opens.
// =============================================================================

export type KlineInterval =
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M'

export interface KlineCandle {
  openTime:  number
  open:      number
  high:      number
  low:       number
  close:     number
  volume:    number
  closed:    boolean  // true = candle is final
}

type KlineCallback = (candle: KlineCandle) => void

const WS_BASE           = 'wss://stream.binance.com:9443/ws/'
const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS  = 30_000

interface KlineSub {
  symbol:   string
  interval: KlineInterval
  cbs:      Set<KlineCallback>
  ws:       WebSocket | null
  reconnMs: number
  tid:      ReturnType<typeof setTimeout> | null
}

class KlineFeedManager {
  private readonly subs = new Map<string, KlineSub>()
  private destroyed = false

  private key(symbol: string, interval: KlineInterval) {
    return `${symbol.toUpperCase()}_${interval}`
  }

  subscribe(symbol: string, interval: KlineInterval, cb: KlineCallback): () => void {
    const sym = symbol.toUpperCase()
    const k   = this.key(sym, interval)

    if (!this.subs.has(k)) {
      const sub: KlineSub = { symbol: sym, interval, cbs: new Set(), ws: null, reconnMs: RECONNECT_BASE_MS, tid: null }
      this.subs.set(k, sub)
      this.open(sub)
    }
    this.subs.get(k)!.cbs.add(cb)

    return () => this.unsubscribe(k, cb)
  }

  private unsubscribe(k: string, cb: KlineCallback) {
    const sub = this.subs.get(k)
    if (!sub) return
    sub.cbs.delete(cb)
    if (sub.cbs.size === 0) {
      this.close(sub)
      this.subs.delete(k)
    }
  }

  private open(sub: KlineSub) {
    if (this.destroyed) return
    const stream = `${sub.symbol.toLowerCase()}@kline_${sub.interval}`
    sub.ws = new WebSocket(`${WS_BASE}${stream}`)

    sub.ws.onopen = () => { sub.reconnMs = RECONNECT_BASE_MS }

    sub.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string)
        if (msg.e !== 'kline') return
        const k = msg.k
        const candle: KlineCandle = {
          openTime: k.t,
          open:     parseFloat(k.o),
          high:     parseFloat(k.h),
          low:      parseFloat(k.l),
          close:    parseFloat(k.c),
          volume:   parseFloat(k.v),
          closed:   k.x,
        }
        sub.cbs.forEach(cb => cb(candle))
      } catch { /* ignore */ }
    }

    sub.ws.onclose = () => {
      if (this.destroyed) return
      sub.tid = setTimeout(() => {
        sub.reconnMs = Math.min(sub.reconnMs * 2, RECONNECT_MAX_MS)
        this.open(sub)
      }, sub.reconnMs)
    }

    sub.ws.onerror = () => sub.ws?.close()
  }

  private close(sub: KlineSub) {
    if (sub.tid) clearTimeout(sub.tid)
    try { sub.ws?.close() } catch { /* noop */ }
    sub.ws = null
  }

  destroy() {
    this.destroyed = true
    this.subs.forEach(s => this.close(s))
    this.subs.clear()
  }
}

export const klineFeed = new KlineFeedManager()
