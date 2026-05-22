import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'
import { createFamilyProof } from '@/lib/aptos'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const families = await prisma.family.findMany({
      where: {
        OR: [
          { ownerWallet: session.walletAddress },
          { members: { some: { walletAddress: session.walletAddress } } },
        ],
      },
      include: {
        _count: { select: { members: true, memories: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(families)
  } catch (err) {
    console.error('[Families/GET]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const { familyName, description, privacyMode } = await req.json()
    if (!familyName) return NextResponse.json({ error: 'Thiếu tên gia đình' }, { status: 400 })

    const family = await prisma.family.create({
      data: {
        familyName,
        description,
        privacyMode: privacyMode || 'PRIVATE',
        ownerWallet: session.walletAddress,
      },
    })

    // Thêm owner vào members
    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        walletAddress: session.walletAddress,
        role: 'OWNER',
        name: 'Chủ sở hữu',
      },
    })

    // Ghi proof trên Aptos (mock Phase 1)
    try {
      const txHash = await createFamilyProof(family.id, session.walletAddress)
      await prisma.family.update({
        where: { id: family.id },
        data: { contractTxHash: txHash },
      })
    } catch (e) {
      console.warn('Aptos proof failed (non-critical):', e)
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        walletAddress: session.walletAddress,
        familyId: family.id,
        action: 'CREATE_FAMILY',
        resourceId: family.id,
        resourceType: 'family',
      },
    })

    return NextResponse.json(family, { status: 201 })
  } catch (err) {
    console.error('[Families/POST]', err)
    return NextResponse.json({ error: 'Tạo vault thất bại' }, { status: 500 })
  }
}
