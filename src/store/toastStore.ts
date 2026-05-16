import { create } from 'zustand'

export type ToastType = 'alert' | 'success' | 'error' | 'info'

export interface Toast {
  id:      string
  type:    ToastType
  title:   string
  message: string
  coinId?: string
  ttl:     number
}

interface ToastState {
  toasts: Toast[]
  push:   (t: Omit<Toast, 'id' | 'ttl'> & { ttl?: number }) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => set(s => ({
    toasts: [
      ...s.toasts.slice(-4),
      { ...t, id: crypto.randomUUID(), ttl: t.ttl ?? 6_000 },
    ],
  })),
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))
