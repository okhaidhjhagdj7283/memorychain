import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  const { id } = await params

  try {
    const memory = await prisma.memory.findUnique({
      where: { id },
      include: {
        uploader: { select: { displayName: true, walletAddress: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    })
    if (!memory) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })

    const isMember = await prisma.familyMember.findFirst({
      where: { familyId: memory.familyId, walletAddress: session.walletAddress },
    })
    if (!isMember && memory.visibility === 'PRIVATE') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    return NextResponse.json(memory)
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  const { id } = await params

  try {
    const memory = await prisma.memory.findUnique({ where: { id } })
    if (!memory) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    if (memory.uploaderWallet !== session.walletAddress) {
      return NextResponse.json({ error: 'Không có quyền xóa' }, { status: 403 })
    }

    await prisma.memory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 })
  }
}
