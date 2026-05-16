'use client'

import { useEffect, useRef } from 'react'
import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToastStore, type Toast } from '@/store/toastStore'
import Link from 'next/link'

const ICONS: Record<Toast['type'], React.ReactNode> = {
  alert:   <Bell        size={16} />,
  success: <CheckCircle size={16} />,
  error:   <AlertCircle size={16} />,
  info:    <Info        size={16} />,
}

const COLORS: Record<Toast['type'], string> = {
  alert:   'var(--color-yellow,   #d19900)',
  success: 'var(--color-success,  #437a22)',
  error:   'var(--color-error,    #a12c7b)',
  info:    'var(--color-primary,  #01696f)',
}

function ToastItem({ toast }: { toast: Toast }) {
  const remove   = useToastStore(s => s.remove)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const accent   = COLORS[toast.type]

  useEffect(() => {
    timerRef.current = setTimeout(() => remove(toast.id), toast.ttl)
    return () => clearTimeout(timerRef.current)
  }, [toast.id, toast.ttl, remove])

  const inner = (
    <div
      role="alert"
      aria-live="assertive"
      className="relative flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
      style={{
        background:  'var(--color-surface, #f9f8f5)',
        borderColor: 'var(--color-border,  #d4d1ca)',
        minWidth: 280, maxWidth: 340,
        animation: 'ctp-toast-in 220ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* progress bar */}
      <span className="absolute bottom-0 left-0 h-0.5 rounded-b-xl"
        style={{ background: accent, animation: `ctp-toast-bar ${toast.ttl}ms linear forwards`, width: '100%' }}
      />
      {/* icon */}
      <span className="mt-0.5 shrink-0" style={{ color: accent }}>{ICONS[toast.type]}</span>
      {/* content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--color-text)' }}>{toast.title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{toast.message}</p>
      </div>
      {/* dismiss */}
      <button onClick={() => remove(toast.id)}
        className="shrink-0 rounded p-0.5 hover:opacity-60 transition-opacity"
        style={{ color: 'var(--color-text-faint)' }} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )

  if (toast.type === 'alert') {
    return <Link href="/alerts" style={{ textDecoration: 'none' }}>{inner}</Link>
  }
  return inner
}

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)
  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes ctp-toast-in {
          from { opacity:0; transform:translateY(12px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)     scale(1); }
        }
        @keyframes ctp-toast-bar {
          from { transform:scaleX(1); transform-origin:left; }
          to   { transform:scaleX(0); transform-origin:left; }
        }
      `}</style>
      <div aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </div>
    </>
  )
}
