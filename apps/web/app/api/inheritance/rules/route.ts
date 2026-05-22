import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const familyId = searchParams.get('familyId')

  try {
    const rules = await prisma.inheritanceRule.findMany({
      where: { ownerWallet: session.walletAddress, ...(familyId ? { familyId } : {}) },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rules)
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const { familyId, heirWallet, triggerType, unlockYear, approvalCount, note } = await req.json()

    if (!familyId || !heirWallet || !triggerType) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    // Kiểm tra owner
    const family = await prisma.family.findUnique({ where: { id: familyId } })
    if (family?.ownerWallet !== session.walletAddress) {
      return NextResponse.json({ error: 'Chỉ chủ sở hữu mới có thể đặt quy tắc kế thừa' }, { status: 403 })
    }

    // Upsert heir user
    await prisma.user.upsert({
      where: { walletAddress: heirWallet },
      update: {},
      create: { walletAddress: heirWallet },
    })

    const rule = await prisma.inheritanceRule.create({
      data: {
        familyId, ownerWallet: session.walletAddress, heirWallet,
        triggerType, unlockYear, approvalCount, note, status: 'ACTIVE',
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (err) {
    console.error('[Inheritance/POST]', err)
    return NextResponse.json({ error: 'Tạo quy tắc thất bại' }, { status: 500 })
  }
}
