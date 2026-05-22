import { NextRequest, NextResponse } from 'next/server'
import { generateNonce, createSignMessage } from '@/lib/auth'

// Simple in-memory nonce store (dùng Redis trong production)
const nonceStore = new Map<string, { nonce: string; expires: number }>()

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()
    if (!walletAddress) {
      return NextResponse.json({ error: 'Thiếu địa chỉ ví' }, { status: 400 })
    }

    const nonce = generateNonce()
    const message = createSignMessage(nonce, walletAddress)

    // Lưu nonce với TTL 5 phút
    nonceStore.set(walletAddress, {
      nonce,
      expires: Date.now() + 5 * 60 * 1000,
    })

    return NextResponse.json({ nonce, message })
  } catch (err) {
    console.error('[Auth/Nonce]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export { nonceStore }
