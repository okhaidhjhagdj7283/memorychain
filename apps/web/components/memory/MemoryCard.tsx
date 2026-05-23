'use client'

import Link from 'next/link'
import {
  Image as ImageIcon, Video, Music,
  FileText, Mail, BookOpen, Lock, Eye, MessageCircle,
} from 'lucide-react'
import { Memory } from '@/types'
import { formatDate, formatBytes } from '@/lib/utils'
import { MemoryTypeBadge } from '@/components/ui/Badge'

const TypeIcon = ({ type }: { type: string }) => {
  const props = { size: 28 }
  const map: Record<string, React.ReactNode> = {
    PHOTO:    <ImageIcon {...props} className="file-icon-photo"    />,
    VIDEO:    <Video     {...props} className="file-icon-video"    />,
    AUDIO:    <Music     {...props} className="file-icon-audio"    />,
    DOCUMENT: <FileText  {...props} className="file-icon-document" />,
    LETTER:   <Mail      {...props} className="file-icon-letter"   />,
    STORY:    <BookOpen  {...props} className="file-icon-story"    />,
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
      {/* Thumbnail */}
      <div
        className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {memory.thumbnailBlob ? (
          <img
            src={`/api/blob/${encodeURIComponent(memory.thumbnailBlob)}`}
            alt={memory.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="opacity-25 group-hover:opacity-40 transition-opacity">
            <TypeIcon type={memory.memoryType} />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2.5 left-2.5">
          <MemoryTypeBadge type={memory.memoryType} />
        </div>

        {/* Encrypted */}
        {memory.isEncrypted && (
          <div
            className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              color: 'var(--amber)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <Lock size={9} /> Mã hóa
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold text-sm mb-1 truncate transition-colors group-hover:text-[color:var(--indigo-light)]"
          style={{ color: 'var(--text-1)' }}
        >
          {memory.title}
        </h3>

        {memory.description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-2)' }}>
            {memory.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-3)' }}>
          <span>{memory.eventDate ? formatDate(memory.eventDate) : formatDate(memory.createdAt)}</span>
          <div className="flex items-center gap-2">
            {memory.fileSize && <span>{formatBytes(Number(memory.fileSize))}</span>}
            {(memory._count?.comments || 0) > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle size={9} /> {memory._count?.comments}
              </span>
            )}
            <span className="flex items-center gap-1">
              {memory.visibility === 'PRIVATE' ? <Lock size={9} /> : <Eye size={9} />}
              {memory.visibility === 'PRIVATE'
                ? 'Riêng tư'
                : memory.visibility === 'FAMILY'
                ? 'Gia đình'
                : 'Công khai'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
