// =============================================================================
// MultiversX Staking API helpers
// =============================================================================

import axios from 'axios'

const MX_API = 'https://api.multiversx.com'

const DENOMINATION = 1e18

export interface Validator {
  identity: string
  name: string
  locked: number       // EGLD
  apr: number          // percent
  numNodes: number
  topUp: number
  stake: number
}

export interface Delegation {
  address: string      // validator address
  contract: string
  value: number        // EGLD
  claimableRewards: number // EGLD
}

export interface StakingEconomics {
  apr: number
  totalStaked: number
  stakeAPR: number
}

export async function fetchValidators(size = 20): Promise<Validator[]> {
  const response = await axios.get<Record<string, unknown>[]>(`${MX_API}/validators`, {
    params: { size, sort: 'locked', order: 'desc' },
  })
  return response.data.map((v) => ({
    identity: String(v.identity ?? v.bls ?? ''),
    name: String(v.name ?? v.identity ?? 'Unknown'),
    locked: Number(v.locked ?? 0) / DENOMINATION,
    apr: Number(v.apr ?? 0),
    numNodes: Number(v.numNodes ?? 0),
    topUp: Number(v.topUp ?? 0) / DENOMINATION,
    stake: Number(v.stake ?? 0) / DENOMINATION,
  }))
}

export async function fetchDelegations(address: string): Promise<Delegation[]> {
  const response = await axios.get<Record<string, unknown>[]>(
    `${MX_API}/accounts/${address}/delegation`
  )
  return response.data.map((d) => ({
    address: String(d.address ?? ''),
    contract: String(d.contract ?? ''),
    value: Number(d.value ?? 0) / DENOMINATION,
    claimableRewards: Number(d.claimableRewards ?? 0) / DENOMINATION,
  }))
}

export async function fetchStakingAPR(): Promise<number> {
  const response = await axios.get<Record<string, unknown>>(`${MX_API}/economics`)
  return Number(response.data.apr ?? 0)
}

/** Calculate projected staking rewards */
export function calcRewards(egldAmount: number, aprPercent: number) {
  const yearly = (egldAmount * aprPercent) / 100
  return {
    yearly,
    monthly: yearly / 12,
    daily: yearly / 365,
  }
}
