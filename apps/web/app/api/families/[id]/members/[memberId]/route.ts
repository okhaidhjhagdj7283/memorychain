import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  const { id, memberId } = await params

  try {
    const family = await prisma.family.findUnique({ where: { id } })
    if (!family) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    if (family.ownerWallet !== session.walletAddress) {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    await prisma.familyMember.delete({ where: { id: memberId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 })
  }
}
