import { useQuery } from '@tanstack/react-query'

const MX_API = 'https://api.multiversx.com'

async function json(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MultiversX API error: ${res.status}`)
  return res.json()
}

export function useEgldAccount(address: string) {
  return useQuery({
    queryKey: ['egld-account', address],
    queryFn: () => json(`${MX_API}/accounts/${address}`),
    enabled: Boolean(address),
    staleTime: 30_000,
  })
}

export function useEgldTokens(address: string) {
  return useQuery({
    queryKey: ['egld-tokens', address],
    queryFn: () => json(`${MX_API}/accounts/${address}/tokens?size=100&includeMetaESDT=false`),
    enabled: Boolean(address),
    staleTime: 60_000,
  })
}

export function useEgldNfts(address: string) {
  return useQuery({
    queryKey: ['egld-nfts', address],
    queryFn: () => json(`${MX_API}/accounts/${address}/nfts?size=50&type=NonFungibleESDT,SemiFungibleESDT`),
    enabled: Boolean(address),
    staleTime: 60_000,
  })
}

export function useEgldTransactions(address: string, size = 20) {
  return useQuery({
    queryKey: ['egld-txns', address, size],
    queryFn: () => json(`${MX_API}/accounts/${address}/transactions?size=${size}&status=success`),
    enabled: Boolean(address),
    staleTime: 30_000,
  })
}
