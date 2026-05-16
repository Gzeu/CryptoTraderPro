import '@testing-library/jest-dom'

// Polyfill crypto.randomUUID for jsdom
if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error polyfill
  globalThis.crypto = { randomUUID: () => Math.random().toString(36).slice(2) }
}

// Silence console.warn from safeParse in tests
const originalWarn = console.warn
beforeEach(() => { console.warn = () => {} })
afterEach(()  => { console.warn = originalWarn })
