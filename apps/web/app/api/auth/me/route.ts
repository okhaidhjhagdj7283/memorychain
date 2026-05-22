import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.walletAddress },
    })
    return NextResponse.json(user || { walletAddress: session.walletAddress })
  } catch {
    return NextResponse.json({ walletAddress: session.walletAddress })
  }
}
