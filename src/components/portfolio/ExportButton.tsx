'use client'

// =============================================================================
// ExportButton — one-click CSV download for the portfolio page
// =============================================================================

import { Download } from 'lucide-react'
import { useExportCSV } from '@/hooks/useExportCSV'

export function ExportButton() {
  const { exportCSV, isEmpty } = useExportCSV()

  return (
    <button
      onClick={exportCSV}
      disabled={isEmpty}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-opacity disabled:opacity-40"
      style={{
        background:   'var(--surface-2)',
        borderColor:  'var(--border)',
        color:        'var(--text)',
      }}
      title={isEmpty ? 'No entries to export' : 'Export portfolio as CSV'}
      aria-label="Export portfolio CSV"
    >
      <Download size={14} />
      Export CSV
    </button>
  )
}
