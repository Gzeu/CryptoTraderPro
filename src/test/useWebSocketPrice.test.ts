// =============================================================================
// Tests for useWebSocketPrice hook
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWebSocketPrice } from '@/hooks/useWebSocketPrice'

const createMockWebSocket = () => ({
  onopen: null as ((event: Event) => void) | null,
  onmessage: null as ((event: MessageEvent) => void) | null,
  onerror: null as ((event: Event) => void) | null,
  onclose: null as ((event: CloseEvent) => void) | null,
  readyState: WebSocket.CONNECTING,
  close: vi.fn(),
  send: vi.fn(),
})

describe('useWebSocketPrice', () => {
  let mockWs: ReturnType<typeof createMockWebSocket>

  beforeEach(() => {
    mockWs = createMockWebSocket()
    vi.stubGlobal('WebSocket', vi.fn(() => mockWs))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with null data and disconnected state', () => {
    const { result } = renderHook(() => useWebSocketPrice('btcusdt'))
    expect(result.current.data).toBeNull()
    expect(result.current.isConnected).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets isConnected to true on open', async () => {
    const { result } = renderHook(() => useWebSocketPrice('btcusdt'))
    act(() => {
      mockWs.onopen?.(new Event('open'))
    })
    await waitFor(() => expect(result.current.isConnected).toBe(true))
  })

  it('parses price data from ticker message', async () => {
    const { result } = renderHook(() => useWebSocketPrice('btcusdt'))
    act(() => {
      mockWs.onopen?.(new Event('open'))
      mockWs.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify({
          e: '24hrTicker', E: 1234567890000, s: 'BTCUSDT',
          c: '43521.45', p: '1012.30', P: '2.38',
          h: '44100.00', l: '42000.00', v: '12345.67'
        })
      }))
    })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    expect(result.current.data?.price).toBe(43521.45)
    expect(result.current.data?.priceChangePercent).toBe(2.38)
  })

  it('sets error on websocket error', async () => {
    const { result } = renderHook(() => useWebSocketPrice('btcusdt'))
    act(() => {
      mockWs.onerror?.(new Event('error'))
    })
    await waitFor(() => expect(result.current.error).toBeTruthy())
  })

  it('closes websocket on unmount', () => {
    const { unmount } = renderHook(() => useWebSocketPrice('btcusdt'))
    unmount()
    expect(mockWs.close).toHaveBeenCalled()
  })
})
