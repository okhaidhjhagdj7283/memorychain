import { NextRequest, NextResponse } from 'next/server'
import { downloadFromShelby } from '@/lib/shelby'

export async function GET(req: NextRequest, { params }: { params: Promise<{ blobName: string[] }> }) {
  try {
    const { blobName } = await params
    const fullBlobName = blobName.join('/')
    
    const data = await downloadFromShelby(fullBlobName)
    
    if (!data) {
      // Nếu mock (không tải được từ Shelby SDK), ta trả về 1 empty buffer hoặc redirect
      // Ở đây MVP ta trả về lỗi hoặc file giả lập
      return new NextResponse('File not found or Shelby mock mode', { status: 404 })
    }

    // Đoán mimetype từ tên file (MVP đơn giản)
    let contentType = 'application/octet-stream'
    if (fullBlobName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) contentType = 'image/jpeg'
    if (fullBlobName.match(/\.(mp4|webm)$/i)) contentType = 'video/mp4'
    if (fullBlobName.match(/\.(mp3|wav|m4a)$/i)) contentType = 'audio/mpeg'
    if (fullBlobName.match(/\.pdf$/i)) contentType = 'application/pdf'

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('[Blob API]', err)
    return new NextResponse('Server error', { status: 500 })
  }
}
