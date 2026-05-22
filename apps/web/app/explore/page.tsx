import { Globe, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import prisma from '@memorychain/db'
import { formatDate, formatBytes } from '@/lib/utils'
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-indigo w-80 h-80 top-20 right-20" />
        <div className="orb orb-emerald w-60 h-60 bottom-20 left-20" style={{ animationDelay: '3s' }} />
        <div className="bg-grid absolute inset-0" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="text-indigo-400" size={28} />
            Khám phá ký ức cộng đồng
          </h1>
          <p className="text-slate-400">Những khoảnh khắc gia đình được chia sẻ với mọi người</p>
        </div>

        {publicMemories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicMemories.map(memory => (
              <Link key={memory.id} href={`/family/${memory.familyId}/memory/${memory.id}`} className="block">
                <div className="glass rounded-2xl overflow-hidden hover-card h-full flex flex-col transition-all duration-300">
                  <div className="h-48 bg-slate-800/50 relative">
                    {memory.memoryType === 'PHOTO' && memory.shelbyBlobName ? (
                       <div className="absolute inset-0 flex items-center justify-center text-4xl">📷</div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        {memory.memoryType === 'VIDEO' ? '🎬' : memory.memoryType === 'AUDIO' ? '🎵' : '📄'}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium border border-white/10">
                      Gia đình {memory.family.familyName}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{memory.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                      {memory.description || 'Không có mô tả'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Avatar address={memory.uploader.walletAddress} name={memory.uploader.displayName || ''} size="sm" />
                        <span className="text-xs text-slate-300">{memory.uploader.displayName || 'Người dùng ẩn danh'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Heart size={14} /> 0</span>
                        <span className="flex items-center gap-1"><MessageCircle size={14} /> {memory._count.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state glass rounded-2xl">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-white mb-2">Chưa có ký ức công khai</h3>
            <p className="text-slate-400">Đây là nơi các gia đình chia sẻ ký ức với cộng đồng</p>
            <Link href="/login" className="btn-primary mt-6 inline-flex">
              Bắt đầu hành trình của bạn
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
