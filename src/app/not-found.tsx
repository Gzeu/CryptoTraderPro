import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <p className="text-7xl font-black mb-4" style={{ color: 'var(--primary)' }}>404</p>
        <h2 className="font-bold text-xl mb-2">Page not found</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This page doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
