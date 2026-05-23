'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { Upload, Grid3X3, List, Search, Image as ImageIcon, Video, Music, FileText } from 'lucide-react'
import { useFamily } from '@/hooks/useFamilies'
import { useMemories } from '@/hooks/useMemories'
import { AppLayout } from '@/components/layout/AppLayout'
import { MemoryCard } from '@/components/memory/MemoryCard'
import { MemoryCardSkeleton } from '@/components/ui/Skeleton'
import { PrivacyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

const memoryTypeFilters = [
  { value: '',         label: 'Tất cả',   icon: Grid3X3   },
  { value: 'PHOTO',   label: 'Ảnh',       icon: ImageIcon },
  { value: 'VIDEO',   label: 'Video',      icon: Video     },
  { value: 'AUDIO',   label: 'Âm thanh',  icon: Music     },
  { value: 'DOCUMENT', label: 'Tài liệu', icon: FileText  },
]

export default function FamilyVaultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [viewMode, setViewMode]         = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState('')
  const [searchQuery, setSearchQuery]   = useState('')

  const { data: family,   isLoading: familyLoading }   = useFamily(id)
  const { data: memories, isLoading: memoriesLoading } = useMemories(id)

  const filteredMemories = memories?.filter(m => {
    if (selectedType && m.memoryType !== selectedType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        m.title.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <AppLayout familyId={id} familyName={family?.familyName}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7">

        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-5">
          {familyLoading ? (
            <div className="space-y-2">
              <div className="skeleton h-7 w-52" />
              <div className="skeleton h-4 w-36" />
            </div>
          ) : family ? (
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="font-display text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
                    {family.familyName}
                  </h1>
                  <PrivacyBadge mode={family.privacyMode} />
                </div>
                {family.description && (
                  <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>{family.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
                  <span>{family._count?.members || 0} thành viên</span>
                  <span>·</span>
                  <span>{family._count?.memories || 0} ký ức</span>
                  <span>·</span>
                  <span>Tạo {formatDate(family.createdAt)}</span>
                </div>
              </div>
              <Link href={`/family/${id}/upload`} className="no-underline">
                <Button icon={<Upload size={14} />}>Upload</Button>
              </Link>
            </div>
          ) : null}
        </div>

        {/* ── Toolbar ──────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-3)' }}
            />
            <input
              className="input pl-8 text-sm"
              placeholder="Tìm kiếm ký ức…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type filter + view toggle */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <div className="tab-bar flex-shrink-0">
              {memoryTypeFilters.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`tab-item ${selectedType === value ? 'active' : ''}`}
                  onClick={() => setSelectedType(value)}
                >
                  <Icon size={12} />
                  <span className="hide-mobile sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <div className="ml-auto flex gap-0.5 p-0.5 rounded-lg flex-shrink-0" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {([['grid', Grid3X3], ['list', List]] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="p-1.5 rounded-md transition-colors"
                  style={{
                    background: viewMode === mode ? 'var(--indigo)' : 'transparent',
                    color: viewMode === mode ? '#fff' : 'var(--text-3)',
                  }}
                  aria-label={mode === 'grid' ? 'Dạng lưới' : 'Dạng danh sách'}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid / List ───────────────────────────────── */}
        {memoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <MemoryCardSkeleton key={i} />)}
          </div>
        ) : filteredMemories && filteredMemories.length > 0 ? (
          <div
            className={`grid gap-3 sm:gap-4 stagger ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {filteredMemories.map(memory => (
              <MemoryCard key={memory.id} memory={memory} familyId={id} />
            ))}
          </div>
        ) : (
          <div className="card p-10 sm:p-14 text-center animate-fade-in">
            <div className="text-4xl mb-4">
              {selectedType === 'PHOTO' ? '📷' : selectedType === 'VIDEO' ? '🎬' : '🗂️'}
            </div>
            <h3 className="font-semibold mb-1.5" style={{ color: 'var(--text-1)' }}>
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có ký ức nào'}
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>
              {searchQuery
                ? `Không có ký ức nào khớp với "${searchQuery}"`
                : 'Hãy upload ký ức đầu tiên cho vault này'}
            </p>
            {!searchQuery && (
              <Link href={`/family/${id}/upload`} className="no-underline">
                <Button icon={<Upload size={14} />}>Upload ký ức đầu tiên</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
