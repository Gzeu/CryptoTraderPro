// =============================================================================
// Binance WebSocket Price Feed — singleton manager
// Combined stream: wss://stream.binance.com:9443/stream?streams=...
//
// KEY DESIGN: subscriptions are BATCHED via a 40ms debounce so that mounting
// 10+ components simultaneously triggers exactly ONE WS reconnect instead of N.
//
// Reconnect strategy: exponential backoff 1s → 2s → 4s … 30s
// Tab visibility:     WS is paused when tab is hidden, resumed on focus
// Max symbols:        200 per connection (Binance limit)
// Overflow:           second connection opens automatically beyond 200 symbols
// =============================================================================

type PriceTickerCallback = (data: TickerPayload) => void

export interface TickerPayload {
  symbol:             string   // 'BTCUSDT'
  price:              number
  priceChange:        number
  priceChangePercent: number
  high:               number
  low:                number
  volume:             number
  quoteVolume:        number
  lastUpdated:        number   // ms epoch
}

const WS_BASE              = 'wss://stream.binance.com:9443/stream?streams='
const MAX_PER_CONN         = 200   // Binance hard limit
const RECONNECT_BASE_MS    = 1_000
const RECONNECT_MAX_MS     = 30_000
const BATCH_DEBOUNCE_MS    = 40    // collapse burst subscriptions into one reconnect

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface ConnState {
  ws:          WebSocket | null
  symbols:     Set<string>      // uppercase symbols on this connection
  reconnectMs: number
  tid:         ReturnType<typeof setTimeout> | null
}

// ---------------------------------------------------------------------------
// PriceFeedManager
// ---------------------------------------------------------------------------

class PriceFeedManager {
  /** symbol → set of callbacks */
  private readonly subs = new Map<string, Set<PriceTickerCallback>>()
  /** symbol → latest payload (cache for late subscribers) */
  private readonly cache = new Map<string, TickerPayload>()
  /** WebSocket connections, one per 200 symbols */
  private readonly conns: ConnState[] = []
  /** Pending symbols that haven't been wired to a connection yet */
  private pendingAdd    = new Set<string>()
  private pendingRemove = new Set<string>()
  /** Debounce timer for batching reconnects */
  private batchTid: ReturnType<typeof setTimeout> | null = null
  private destroyed = false

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  subscribe(symbol: string, cb: PriceTickerCallback): () => void {
    const sym = symbol.toUpperCase()

    if (!this.subs.has(sym)) this.subs.set(sym, new Set())
    this.subs.get(sym)!.add(cb)

    // Fire cached value immediately so UI shows a price before WS connects
    const cached = this.cache.get(sym)
    if (cached) queueMicrotask(() => cb(cached))

    // Mark as needing a connection slot; schedule a batched reconnect
    if (!this.isSubscribedOnAnyConn(sym)) {
      this.pendingAdd.add(sym)
      this.pendingRemove.delete(sym)
      this.scheduleBatch()
    }

    return () => this.unsubscribe(sym, cb)
  }

  getCached(symbol: string): TickerPayload | null {
    return this.cache.get(symbol.toUpperCase()) ?? null
  }

  destroy() {
    this.destroyed = true
    if (this.batchTid) clearTimeout(this.batchTid)
    this.conns.forEach(c => this.closeConn(c))
    this.conns.length = 0
  }

  // -------------------------------------------------------------------------
  // Internal — subscription management
  // -------------------------------------------------------------------------

  private unsubscribe(sym: string, cb: PriceTickerCallback) {
    const set = this.subs.get(sym)
    if (!set) return
    set.delete(cb)
    if (set.size === 0) {
      this.subs.delete(sym)
      // Only schedule removal if there are no pending re-adds
      if (!this.pendingAdd.has(sym)) {
        this.pendingRemove.add(sym)
        this.scheduleBatch()
      }
    }
  }

  private isSubscribedOnAnyConn(sym: string): boolean {
    return this.conns.some(c => c.symbols.has(sym))
  }

  // -------------------------------------------------------------------------
  // Internal — batched reconnect
  // -------------------------------------------------------------------------

  /**
   * Debounce: collect all subscribe/unsubscribe calls within BATCH_DEBOUNCE_MS
   * then rebuild connections once. This collapses portfolio mount (10 symbols)
   * into a single WS reconnect.
   */
  private scheduleBatch() {
    if (this.batchTid) clearTimeout(this.batchTid)
    this.batchTid = setTimeout(() => this.flushBatch(), BATCH_DEBOUNCE_MS)
  }

  private flushBatch() {
    if (this.destroyed) return
    this.batchTid = null

    // Compute desired full symbol set
    const desired = new Set(this.subs.keys())
    const current = new Set(this.conns.flatMap(c => Array.from(c.symbols)))

    const added   = [...desired].filter(s => !current.has(s))
    const removed = [...current].filter(s => !desired.has(s))

    this.pendingAdd.clear()
    this.pendingRemove.clear()

    if (added.length === 0 && removed.length === 0) return

    // Rebuild connections from scratch with desired symbol set
    // (cheap: Binance WS URLs are compact; rebuilding keeps logic simple)
    this.rebuildConnections(desired)
  }

  // -------------------------------------------------------------------------
  // Internal — connection lifecycle
  // -------------------------------------------------------------------------

  private rebuildConnections(allSymbols: Set<string>) {
    // Close all existing connections
    this.conns.forEach(c => this.closeConn(c))
    this.conns.length = 0

    if (allSymbols.size === 0) return

    // Partition into chunks of MAX_PER_CONN
    const symsArr = Array.from(allSymbols)
    for (let i = 0; i < symsArr.length; i += MAX_PER_CONN) {
      const chunk = symsArr.slice(i, i + MAX_PER_CONN)
      const conn: ConnState = {
        ws:          null,
        symbols:     new Set(chunk),
        reconnectMs: RECONNECT_BASE_MS,
        tid:         null,
      }
      this.conns.push(conn)
      this.openConn(conn)
    }
  }

  private openConn(conn: ConnState) {
    if (this.destroyed || conn.symbols.size === 0) return

    const streams = Array.from(conn.symbols)
      .map(s => `${s.toLowerCase()}@ticker`)
      .join('/')

    conn.ws = new WebSocket(`${WS_BASE}${streams}`)

    conn.ws.onopen = () => {
      conn.reconnectMs = RECONNECT_BASE_MS
    }

    conn.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string)
        const d = msg?.data
        if (!d || d.e !== '24hrTicker') return
        this.handleTick(d)
      } catch { /* ignore */ }
    }

    conn.ws.onclose = () => {
      if (this.destroyed) return
      // Exponential backoff reconnect — only for THIS connection
      conn.tid = setTimeout(() => {
        conn.reconnectMs = Math.min(conn.reconnectMs * 2, RECONNECT_MAX_MS)
        this.openConn(conn)
      }, conn.reconnectMs)
    }

    conn.ws.onerror = () => conn.ws?.close()

    // Tab visibility: close WS when hidden, reopen on visible
    if (typeof document !== 'undefined') {
      const onVisibility = () => {
        if (document.hidden) {
          conn.ws?.close()
        } else {
          // Let the onclose backoff handle reopening
        }
      }
      document.addEventListener('visibilitychange', onVisibility)
      // Cleanup attached to conn — will be removed on closeConn
      ;(conn as any)._visibilityCleanup = () =>
        document.removeEventListener('visibilitychange', onVisibility)
    }
  }

  private closeConn(conn: ConnState) {
    if (conn.tid) clearTimeout(conn.tid)
    ;(conn as any)._visibilityCleanup?.()
    try { conn.ws?.close() } catch { /* noop */ }
    conn.ws = null
  }

  // -------------------------------------------------------------------------
  // Internal — message dispatch
  // -------------------------------------------------------------------------

  private handleTick(d: Record<string, string>) {
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
    this.cache.set(payload.symbol, payload)
    this.subs.get(payload.symbol)?.forEach(cb => cb(payload))
  }
}

// Singleton — one instance for the entire app
export const priceFeed = new PriceFeedManager()
