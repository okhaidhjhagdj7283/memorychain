import { Globe, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import prisma from '@memorychain/db'
import { formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'

export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  const publicMemories = await prisma.memory.findMany({
    where: { visibility: 'PUBLIC' },
    include: {
      uploader: { select: { displayName: true, walletAddress: true, avatarUrl: true } },
      family: { select: { familyName: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="fixed inset-0 pointer-events-none bg-grid opacity-35" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-20">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2.5 mb-1">
            <Globe size={20} style={{ color: 'var(--indigo-light)' }} />
            <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-1)' }}>
              Khám phá ký ức cộng đồng
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Những khoảnh khắc gia đình được chia sẻ với mọi người
          </p>
        </div>

        {publicMemories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 stagger">
            {publicMemories.map(memory => (
              <Link
                key={memory.id}
                href={`/family/${memory.familyId}/memory/${memory.id}`}
                className="memory-card"
              >
                {/* Thumbnail */}
                <div
                  className="h-44 flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <span className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
                    {memory.memoryType === 'VIDEO'
                      ? '🎬'
                      : memory.memoryType === 'AUDIO'
                      ? '🎵'
                      : memory.memoryType === 'PHOTO'
                      ? '📷'
                      : '📄'}
                  </span>

                  {/* Family badge */}
                  <div
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--text-2)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {memory.family.familyName}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-1.5">
                  <h3
                    className="font-semibold text-sm line-clamp-1 transition-colors"
                    style={{ color: 'var(--text-1)' }}
                  >
                    {memory.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed line-clamp-2 flex-1"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {memory.description || 'Không có mô tả'}
                  </p>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-2.5 mt-1"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar
                        address={memory.uploader.walletAddress}
                        name={memory.uploader.displayName || ''}
                        size="sm"
                      />
                      <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                        {memory.uploader.displayName || 'Ẩn danh'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
                      <span className="flex items-center gap-1">
                        <Heart size={11} /> 0
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={11} /> {memory._count.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 sm:p-16 text-center animate-scale-in">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="font-semibold mb-1.5" style={{ color: 'var(--text-1)' }}>
              Chưa có ký ức công khai
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>
              Đây là nơi các gia đình chia sẻ ký ức với cộng đồng
            </p>
            <Link href="/login" className="btn-primary inline-flex no-underline">
              Bắt đầu hành trình của bạn
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
