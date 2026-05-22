import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const comments = await prisma.comment.findMany({
      where: { memoryId: id },
      include: { user: { select: { displayName: true, walletAddress: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
  const { id } = await params

  try {
    const { content } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Nội dung rỗng' }, { status: 400 })

    const comment = await prisma.comment.create({
      data: { memoryId: id, walletAddress: session.walletAddress, content: content.trim() },
      include: { user: { select: { displayName: true, walletAddress: true } } },
    })
    return NextResponse.json(comment, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gửi bình luận thất bại' }, { status: 500 })
  }
}
