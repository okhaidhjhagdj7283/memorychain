import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  const { id } = await params

  try {
    // Kiểm tra quyền
    const isMember = await prisma.familyMember.findFirst({
      where: { familyId: id, walletAddress: session.walletAddress },
    })
    const family = await prisma.family.findUnique({ where: { id } })
    if (!isMember && family?.privacyMode !== 'PUBLIC') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const search = searchParams.get('q')

    const memories = await prisma.memory.findMany({
      where: {
        familyId: id,
        ...(type ? { memoryType: type as 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LETTER' | 'STORY' } : {}),
        ...(search ? { OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ]} : {}),
      },
      include: {
        uploader: { select: { displayName: true, walletAddress: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(memories)
  } catch (err) {
    console.error('[Memories/GET]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
