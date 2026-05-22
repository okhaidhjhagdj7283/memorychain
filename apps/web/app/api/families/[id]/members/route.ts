import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  const { id } = await params

  try {
    const members = await prisma.familyMember.findMany({
      where: { familyId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(members)
  } catch {
    return NextResponse.json({ error: 'Lỗi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  const { id } = await params

  try {
    const family = await prisma.family.findUnique({ where: { id } })
    if (!family) return NextResponse.json({ error: 'Không tìm thấy vault' }, { status: 404 })
    if (family.ownerWallet !== session.walletAddress) {
      return NextResponse.json({ error: 'Chỉ chủ sở hữu mới có thể thêm thành viên' }, { status: 403 })
    }

    const { walletAddress, name, role, relation } = await req.json()
    if (!walletAddress) return NextResponse.json({ error: 'Thiếu địa chỉ ví' }, { status: 400 })

    const member = await prisma.familyMember.upsert({
      where: { familyId_walletAddress: { familyId: id, walletAddress } },
      update: { role: role || 'VIEWER', name, relation },
      create: {
        familyId: id,
        walletAddress,
        role: role || 'VIEWER',
        name,
        relation,
      },
    })

    // Upsert user nếu chưa có
    await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (err) {
    console.error('[Members/POST]', err)
    return NextResponse.json({ error: 'Thêm thành viên thất bại' }, { status: 500 })
  }
}
