export interface EgldAccount {
  address: string
  balance: string      // denominated in 10^18 (1 EGLD = 10^18)
  nonce: number
  shard: number
  username?: string
  code?: string
  codeHash?: string
  rootHash?: string
  txCount: number
  scrCount: number
  developerReward: string
  ownerAddress?: string
}

export interface EsdtToken {
  type: string
  identifier: string
  name: string
  ticker: string
  owner?: string
  minted?: string
  burnt?: string
  decimals: number
  isPaused?: boolean
  assets?: {
    website?: string
    description?: string
    status?: string
    pngUrl?: string
    svgUrl?: string
    ledgerSignature?: string
    lockedAccounts?: string
    extraTokens?: string[]
    preferredRankAlgorithm?: string
  }
  transactions?: number
  accounts?: number
  canUpgrade?: boolean
  canMint?: boolean
  canBurn?: boolean
  canChangeOwner?: boolean
  canPause?: boolean
  canFreeze?: boolean
  canWipe?: boolean
  balance: string
  valueUsd?: number
  price?: number
}

export interface NftToken {
  identifier: string
  collection: string
  timestamp?: number
  attributes?: string
  nonce: number
  type: 'NonFungibleESDT' | 'SemiFungibleESDT' | 'MetaESDT'
  name: string
  creator?: string
  royalties?: number
  uris?: string[]
  url?: string
  thumbnailUrl?: string
  tags?: string[]
  metadata?: {
    description?: string
    fileType?: string
    fileUri?: string
    fileName?: string
  }
  media?: Array<{
    url: string
    originalUrl: string
    thumbnailUrl: string
    fileType: string
    fileSize: number
  }>
  isWhitelistedStorage?: boolean
  balance?: string
  supply?: string
  decimals?: number
}

export interface EgldTransaction {
  txHash: string
  gasLimit: number
  gasPrice: number
  gasUsed: number
  miniBlockHash: string
  nonce: number
  receiver: string
  receiverShard: number
  round: number
  sender: string
  senderShard: number
  signature: string
  status: string
  value: string
  fee: string
  timestamp: number
  data?: string
  function?: string
}
