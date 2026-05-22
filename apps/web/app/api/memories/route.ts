import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import prisma from '@memorychain/db'
import { registerMemoryProof, hashData } from '@/lib/aptos'

export async function GET(req: NextRequest) {
  try {
    const publicMemories = await prisma.memory.findMany({
      where: { visibility: 'PUBLIC' },
      include: {
        uploader: { select: { displayName: true, walletAddress: true, avatarUrl: true } },
        family: { select: { familyName: true, coverImageBlob: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(publicMemories)
  } catch (err) {
    console.error('[Memories/GET]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      familyId, title, description, memoryType, eventDate,
      locationText, isEncrypted, encryptedKey, encryptedIv,
      visibility, shelbyBlobName, shelbyBlobHash, fileMimeType,
      fileSize, tags,
    } = body

    if (!familyId || !title || !memoryType) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    // Kiểm tra thành viên
    const isMember = await prisma.familyMember.findFirst({
      where: { familyId, walletAddress: session.walletAddress },
    })
    if (!isMember || isMember.role === 'VIEWER') {
      return NextResponse.json({ error: 'Không có quyền upload' }, { status: 403 })
    }

    const memory = await prisma.memory.create({
      data: {
        familyId,
        uploaderWallet: session.walletAddress,
        title,
        description,
        memoryType,
        eventDate: eventDate ? new Date(eventDate) : null,
        locationText,
        isEncrypted: isEncrypted || false,
        encryptedKey,
        encryptedIv,
        visibility: visibility || 'PRIVATE',
        shelbyBlobName,
        shelbyBlobHash,
        fileMimeType,
        fileSize: fileSize ? BigInt(fileSize) : null,
        tags: tags || [],
      },
    })

    // Ghi proof lên Aptos
    try {
      const [familyIdHash, memoryIdHash] = await Promise.all([
        hashData(familyId),
        hashData(memory.id),
      ])
      const txHash = await registerMemoryProof({
        familyIdHash,
        memoryIdHash,
        fileHash: shelbyBlobHash || '',
        shelbyRefHash: await hashData(shelbyBlobName || ''),
        owner: session.walletAddress,
        timestamp: Date.now(),
      })
      await prisma.memory.update({
        where: { id: memory.id },
        data: { txHash },
      })
    } catch (e) {
      console.warn('Aptos proof failed (non-critical):', e)
    }

    return NextResponse.json(memory, { status: 201 })
  } catch (err) {
    console.error('[Memories/POST]', err)
    return NextResponse.json({ error: 'Lưu memory thất bại' }, { status: 500 })
  }
}
