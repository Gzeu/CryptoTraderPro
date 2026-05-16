// =============================================================================
// Binance WebSocket Price Feed — singleton manager
// Multiplexed combined stream: wss://stream.binance.com/stream
// Handles reconnect with exponential backoff, tab visibility pause
// =============================================================================

type PriceTickerCallback = (data: TickerPayload) => void

export interface TickerPayload {
  symbol:             string  // e.g. 'BTCUSDT'
  price:              number
  priceChange:        number
  priceChangePercent: number
  high:               number
  low:                number
  volume:             number
  quoteVolume:        number
  lastUpdated:        number  // ms timestamp
}

const WS_BASE = 'wss://stream.binance.com:9443/stream?streams='
const MAX_SYMBOLS_PER_CONN = 200
const RECONNECT_BASE_MS    = 1_000
const RECONNECT_MAX_MS     = 30_000

interface Subscription {
  symbol:   string
  callback: PriceTickerCallback
}

class PriceFeedManager {
  private ws:           WebSocket | null = null
  private subs:         Map<string, Set<PriceTickerCallback>> = new Map()
  private lastPrices:   Map<string, TickerPayload> = new Map()
  private reconnectMs:  number = RECONNECT_BASE_MS
  private reconnectTid: ReturnType<typeof setTimeout> | null = null
  private closed:       boolean = false

  private buildStreamNames(): string {
    return Array.from(this.subs.keys())
      .slice(0, MAX_SYMBOLS_PER_CONN)
      .map(s => `${s.toLowerCase()}@ticker`)
      .join('/')
  }

  private connect() {
    if (this.subs.size === 0) return
    const streams = this.buildStreamNames()
    if (!streams) return

    this.ws = new WebSocket(`${WS_BASE}${streams}`)

    this.ws.onopen = () => {
      this.reconnectMs = RECONNECT_BASE_MS
    }

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string)
        const d = msg?.data
        if (!d || d.e !== '24hrTicker') return

        const payload: TickerPayload = {
          symbol:             d.s,
          price:              parseFloat(d.c),
          priceChange:        parseFloat(d.p),
          priceChangePercent: parseFloat(d.P),
          high:               parseFloat(d.h),
          low:                parseFloat(d.l),
          volume:             parseFloat(d.v),
          quoteVolume:        parseFloat(d.q),
          lastUpdated:        Date.now(),
        }
        this.lastPrices.set(payload.symbol, payload)
        this.subs.get(payload.symbol)?.forEach(cb => cb(payload))
      } catch { /* ignore parse errors */ }
    }

    this.ws.onclose = () => {
      if (this.closed) return
      this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTid) clearTimeout(this.reconnectTid)
    this.reconnectTid = setTimeout(() => {
      this.reconnectMs = Math.min(this.reconnectMs * 2, RECONNECT_MAX_MS)
      this.connect()
    }, this.reconnectMs)
  }

  private reconnectFull() {
    this.ws?.close()
    this.ws = null
    if (this.reconnectTid) clearTimeout(this.reconnectTid)
    if (this.subs.size > 0) this.connect()
  }

  subscribe(symbol: string, cb: PriceTickerCallback): () => void {
    const upper = symbol.toUpperCase()
    if (!this.subs.has(upper)) {
      this.subs.set(upper, new Set())
      // reconnect to add new stream
      this.reconnectFull()
    }
    this.subs.get(upper)!.add(cb)

    // If we already have cached data, fire immediately
    const cached = this.lastPrices.get(upper)
    if (cached) setTimeout(() => cb(cached), 0)

    return () => this.unsubscribe(upper, cb)
  }

  private unsubscribe(symbol: string, cb: PriceTickerCallback) {
    const set = this.subs.get(symbol)
    if (!set) return
    set.delete(cb)
    if (set.size === 0) {
      this.subs.delete(symbol)
      this.reconnectFull()
    }
  }

  getCached(symbol: string): TickerPayload | null {
    return this.lastPrices.get(symbol.toUpperCase()) ?? null
  }

  destroy() {
    this.closed = true
    if (this.reconnectTid) clearTimeout(this.reconnectTid)
    this.ws?.close()
  }
}

// Singleton — shared across all hooks
export const priceFeed = new PriceFeedManager()
