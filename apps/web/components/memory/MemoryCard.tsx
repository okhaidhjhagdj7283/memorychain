'use client'

import Link from 'next/link'
import { Image as ImageIcon, Video, Music, FileText, Mail, BookOpen, Lock, Eye, MessageCircle } from 'lucide-react'
import { Memory } from '@/types'
import { formatDate, formatBytes } from '@/lib/utils'
import { MemoryTypeBadge } from '@/components/ui/Badge'

const TypeIcon = ({ type }: { type: string }) => {
  const props = { size: 20 }
  const map: Record<string, React.ReactNode> = {
    PHOTO: <ImageIcon {...props} className="file-icon-photo" />,
    VIDEO: <Video {...props} className="file-icon-video" />,
    AUDIO: <Music {...props} className="file-icon-audio" />,
    DOCUMENT: <FileText {...props} className="file-icon-document" />,
    LETTER: <Mail {...props} className="file-icon-letter" />,
    STORY: <BookOpen {...props} className="file-icon-story" />,
  }
  return <>{map[type] || <FileText {...props} />}</>
}

interface MemoryCardProps {
  memory: Memory
  familyId: string
}

export function MemoryCard({ memory, familyId }: MemoryCardProps) {
  return (
    <Link
      href={`/family/${familyId}/memory/${memory.id}`}
      className="memory-card block no-underline group"
    >
      {/* Thumbnail / Preview */}
      <div
        className="h-48 flex items-center justify-center relative overflow-hidden"
        style={{
          background: memory.memoryType === 'PHOTO'
            ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.1))'
            : memory.memoryType === 'VIDEO'
            ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.1))'
            : memory.memoryType === 'AUDIO'
            ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.1))'
            : 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(147,197,253,0.1))'
        }}
      >
        {memory.thumbnailBlob ? (
          <img
            src={`/api/blob/${encodeURIComponent(memory.thumbnailBlob)}`}
            alt={memory.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="opacity-30 group-hover:opacity-50 transition-opacity">
            <TypeIcon type={memory.memoryType} />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <MemoryTypeBadge type={memory.memoryType} />
        </div>

        {memory.isEncrypted && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-xs text-amber-400">
            <Lock size={10} />
            Mã hóa
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-1 truncate group-hover:text-indigo-400 transition-colors">
          {memory.title}
        </h3>

        {memory.description && (
          <p className="text-slate-400 text-xs mb-3 line-clamp-2">{memory.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{memory.eventDate ? formatDate(memory.eventDate) : formatDate(memory.createdAt)}</span>
          <div className="flex items-center gap-2">
            {memory.fileSize && <span>{formatBytes(Number(memory.fileSize))}</span>}
            {(memory._count?.comments || 0) > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle size={10} />
                {memory._count?.comments}
              </span>
            )}
            <span className="flex items-center gap-1">
              {memory.visibility === 'PRIVATE' ? <Lock size={10} /> : <Eye size={10} />}
              {memory.visibility === 'PRIVATE' ? 'Riêng tư' : memory.visibility === 'FAMILY' ? 'Gia đình' : 'Công khai'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
