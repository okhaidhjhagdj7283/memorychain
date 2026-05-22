export type WalletAddress = string

export interface AuthUser {
  walletAddress: WalletAddress
  displayName?: string
  avatarUrl?: string
}

export interface Family {
  id: string
  ownerWallet: WalletAddress
  familyName: string
  description?: string
  coverImageBlob?: string
  privacyMode: 'PRIVATE' | 'FAMILY_ONLY' | 'PUBLIC'
  contractTxHash?: string
  createdAt: string
  _count?: {
    members: number
    memories: number
  }
}

export interface FamilyMember {
  id: string
  familyId: string
  walletAddress: WalletAddress
  name?: string
  role: 'OWNER' | 'EDITOR' | 'VIEWER' | 'HEIR'
  relation?: string
  avatarBlob?: string
  birthYear?: number
  deathYear?: number
  bio?: string
  createdAt: string
}

export type MemoryType = 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LETTER' | 'STORY'
export type VisibilityMode = 'PRIVATE' | 'FAMILY' | 'PUBLIC'

export interface Memory {
  id: string
  familyId: string
  uploaderWallet: WalletAddress
  title: string
  description?: string
  memoryType: MemoryType
  eventDate?: string
  locationText?: string
  isEncrypted: boolean
  visibility: VisibilityMode
  shelbyBlobName?: string
  shelbyBlobHash?: string
  fileMimeType?: string
  fileSize?: number
  thumbnailBlob?: string
  txHash?: string
  tags: string[]
  createdAt: string
  uploader?: {
    displayName?: string
    walletAddress: WalletAddress
  }
  _count?: {
    comments: number
  }
}

export interface Comment {
  id: string
  memoryId: string
  walletAddress: WalletAddress
  content: string
  createdAt: string
  user?: {
    displayName?: string
    walletAddress: WalletAddress
  }
}

export type TriggerType = 'MANUAL_RELEASE' | 'TIME_LOCK' | 'MULTI_MEMBER_APPROVAL'

export interface InheritanceRule {
  id: string
  familyId: string
  ownerWallet: WalletAddress
  heirWallet: WalletAddress
  triggerType: TriggerType
  unlockYear?: number
  approvalCount?: number
  status: 'PENDING' | 'ACTIVE' | 'CLAIMED' | 'REVOKED'
  note?: string
  createdAt: string
}

export interface UploadProgress {
  stage: 'hashing' | 'encrypting' | 'uploading' | 'saving' | 'done' | 'error'
  progress: number
  message: string
}
