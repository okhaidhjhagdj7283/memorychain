import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const { id } = await params

  try {
    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        members: { orderBy: { createdAt: 'asc' } },
        _count: { select: { memories: true, members: true } },
      },
    })

    if (!family) return NextResponse.json({ error: 'Vault không tồn tại' }, { status: 404 })

    // Check quyền truy cập
    const isMember = family.members.some(m => m.walletAddress === session.walletAddress)
    const isPublic = family.privacyMode === 'PUBLIC'

    if (!isMember && !isPublic) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
    }

    return NextResponse.json(family)
  } catch (err) {
    console.error('[Family/GET]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const { id } = await params

  try {
    const family = await prisma.family.findUnique({ where: { id } })
    if (!family) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    if (family.ownerWallet !== session.walletAddress) {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    const data = await req.json()
    const updated = await prisma.family.update({
      where: { id },
      data: {
        familyName: data.familyName,
        description: data.description,
        privacyMode: data.privacyMode,
        coverImageBlob: data.coverImageBlob,
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[Family/PATCH]', err)
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const { id } = await params

  try {
    const family = await prisma.family.findUnique({ where: { id } })
    if (!family) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    if (family.ownerWallet !== session.walletAddress) {
      return NextResponse.json({ error: 'Chỉ chủ sở hữu mới có thể xóa vault' }, { status: 403 })
    }

    await prisma.family.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Family/DELETE]', err)
    return NextResponse.json({ error: 'Xóa thất bại' }, { status: 500 })
  }
}
