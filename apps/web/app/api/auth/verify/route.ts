import { NextRequest, NextResponse } from 'next/server'
import { signJWT, setSessionCookie } from '@/lib/auth'
import { nonceStore } from '../nonce/route'
import prisma from '@memorychain/db'

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, signature, nonce } = await req.json()

    if (!walletAddress || !signature || !nonce) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    // Verify nonce
    const stored = nonceStore.get(walletAddress)
    if (!stored || stored.nonce !== nonce || stored.expires < Date.now()) {
      return NextResponse.json({ error: 'Nonce không hợp lệ hoặc đã hết hạn' }, { status: 401 })
    }

    // Xóa nonce sau khi dùng
    nonceStore.delete(walletAddress)

    // Tạo hoặc cập nhật user trong DB
    await prisma.user.upsert({
      where: { walletAddress },
      update: { updatedAt: new Date() },
      create: { walletAddress },
    })

    // Tạo JWT
    const token = await signJWT(walletAddress)
    const cookie = setSessionCookie(token)

    const response = NextResponse.json({ success: true, walletAddress })
    response.cookies.set(cookie.name, cookie.value, cookie.options as object)
    return response
  } catch (err) {
    console.error('[Auth/Verify]', err)
    return NextResponse.json({ error: 'Xác thực thất bại' }, { status: 500 })
  }
}
