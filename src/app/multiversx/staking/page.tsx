'use client'

// =============================================================================
// EGLD Staking Page
// =============================================================================

import React from 'react'
import { StakingDashboard } from '@/components/multiversx/StakingDashboard'

export default function StakingPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">EGLD Staking</h1>
        <p className="text-muted-foreground text-sm">
          Explore validators, track delegations and estimate staking rewards.
        </p>
      </div>
      <StakingDashboard />
    </div>
  )
}
