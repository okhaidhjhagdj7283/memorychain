/**
 * Aptos smart contract integration
 * Phase 1: Mock/stub - log proof data
 * Phase 2: Real Move contract on testnet
 */

const APTOS_NODE = process.env.APTOS_NODE_URL || 'https://api.testnet.aptoslabs.com/v1'

export interface MemoryProof {
  familyIdHash: string
  memoryIdHash: string
  fileHash: string
  shelbyRefHash: string
  owner: string
  timestamp: number
}

/**
 * Ghi memory proof lên Aptos
 * Phase 1: Log và return mock tx hash
 */
export async function registerMemoryProof(proof: MemoryProof): Promise<string> {
  console.log('[Aptos] Registering memory proof:', proof)
  
  // Phase 2: Gọi smart contract thật
  // const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }))
  // const txn = await aptos.transaction.build.simple({ ... })
  
  // Mock tx hash
  const mockHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('')}`
  
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate
  return mockHash
}

/**
 * Tạo family proof trên Aptos
 */
export async function createFamilyProof(
  familyId: string,
  ownerAddress: string
): Promise<string> {
  console.log('[Aptos] Creating family proof:', familyId, ownerAddress)
  
  const mockHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('')}`
  
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockHash
}

/**
 * Verify proof trên Aptos
 */
export async function verifyProof(txHash: string): Promise<boolean> {
  try {
    const response = await fetch(`${APTOS_NODE}/transactions/by_hash/${txHash}`)
    return response.ok
  } catch {
    return false
  }
}

export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(data)
  
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hash = await window.crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  const { createHash } = await import('crypto')
  return createHash('sha256').update(data).digest('hex')
}
