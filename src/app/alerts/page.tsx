'use client'

// =============================================================================
// Alerts Page
// =============================================================================

import React from 'react'
import { AlertManager } from '@/components/alerts/AlertManager'

export default function AlertsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Price Alerts</h1>
        <p className="text-muted-foreground text-sm">
          Get notified when a crypto reaches your target price.
        </p>
      </div>
      <AlertManager />
    </div>
  )
}
